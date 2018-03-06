/*
 Copyright (c) 2018 Warren Dano. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

 (function(obj) {

	var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;

	zip.workerScriptsPath = "/common/js/zip/WebContent/";

	function onerror(message) {
		//alert(message);
	}

	function createTempFile(callback) {
		var tmpFilename = "tmp.dat";
		requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
			function create() {
				filesystem.root.getFile(tmpFilename, {
					create : true
				}, function(zipFile) {
					callback(zipFile);
				});
			}

			filesystem.root.getFile(tmpFilename, null, function(entry) {
				entry.remove(create, create);
			}, create);
		});
	}

	var model = (function() {
		var URL = obj.webkitURL || obj.mozURL || obj.URL;

		return {
			getEntries : function(file, onend) {
				zip.createReader(new zip.HttpReader(file), function(zipReader) {
					zipReader.getEntries(onend);
				}, );
			},
			getEntryFile : function(entry, creationMethod, onend, onprogress) {
				var writer, zipFileEntry;

				function getData() {
					entry.getData(writer, function(blob) {
						var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
						onend(blobURL);
					}, onprogress);
				}

				if (creationMethod == "Blob") {
					writer = new zip.BlobWriter();
					getData();
				} else {
					createTempFile(function(fileEntry) {
						zipFileEntry = fileEntry;
						writer = new zip.FileWriter(zipFileEntry);
						getData();
					});
				}
			}
		};
	})();

	(function() {
		//var fileInput = document.getElementById("file-input");
		var fileInput = document.getElementsByClassName("mp4test");
		var unzipProgress = document.createElement("progress");
		var fileList = document.createElement("file-list");
		var body = document.getElementsByTagName("body");
		var creationMethodInput = document.createElement("creation-method-input");
		var current;

		function download(entry, li, a) {
			model.getEntryFile(entry, "Blob", function(blobURL) {
				var clickEvent = document.createEvent("MouseEvent");
				if (unzipProgress.parentNode)
					unzipProgress.parentNode.removeChild(unzipProgress);
				unzipProgress.value = 0;
				unzipProgress.max = 0;
				//clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				//a.href = blobURL;
				//a.download = entry.filename;
				a.downloaded = 1;
				//a.dispatchEvent(clickEvent);				
				var video = document.createElement("video");
				var source = document.createElement("source");
				video.loop = 1;
				video.id = "video1";
				video.autoplay = 1;
				video.style = "position: absolute;	top: 50px;	width: 50%;	left: 250px;";
				source.src = blobURL;
				video.appendChild(source);
				body[0].appendChild(video);								
				video.addEventListener('click', function(){
					if (video.pause) {
						video.remove();
					}
				});
				setTimeout(function(){
					if (video.play) {
						video.pause();
					}
				}, 25000);
			}, function(current, total) {
				unzipProgress.value = current;
				unzipProgress.max = total;
				li.appendChild(unzipProgress);
			});
		}

		if (typeof requestFileSystem == "undefined")
			creationMethodInput.options.length = 1;
		for (var i = 0; i < fileInput.length; i++) {
			fileInput[i].addEventListener('click', function() {
				fileInput.disabled = true;
				console.log(this.getAttribute("exist"));
				current = this;
				model.getEntries(this.getAttribute("exist"), function(entries) {
					fileList.innerHTML = "";
					entries.forEach(function(entry) {
						var li = document.createElement("li");
						var a = document.createElement("a");
						a.textContent = "Loading";//entry.filename;
						a.href = "#";
						//a.addEventListener("click", function(event) {
							//if (!a.downloaded) {
							//	download(entry, li, a);
							//	event.preventDefault();
							//	return false;
							//}
						//}, false);
						li.appendChild(a);
						fileList.appendChild(li);
						current.appendChild(fileList);
						//a.addEventListener("click", function(event) {
							console.log(a.downloaded);
							if (!a.downloaded) {
								download(entry, li, a);
								event.preventDefault();
								return false;
							}
						//}, false);
						console.log(fileList);
					});
				});
			}, false);
		}
	})();

})(this);
