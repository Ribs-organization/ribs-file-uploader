class RibsFileUploader {
  /**
   * @param options
   */
  constructor(options = {}) {
    const uploaderInputs = document.querySelectorAll('[data-ribs-fileuploader]');

    uploaderInputs.forEach((element) => {
      this.initHtmlElements(element);
    });

    this.uploadProgress = [];
    this.initEventListeners();
    this.defineOptions(options);
  }

  /**
   * @param options
   */
  defineOptions(options) {
    if (!options.url) {
      console.error('url is mandatory option');
      return;
    }

    this.options = options;
  }

  /**
   * method to create all html elements of the drag file uploader
   * @param uploader
   */
  initHtmlElements(uploader) {
    const parentUploaderDiv = document.createElement('div');
    parentUploaderDiv.id = `inner-${uploader.id}`;
    parentUploaderDiv.classList.add('ribs-fileuploader');
    uploader.parentNode.insertBefore(parentUploaderDiv, uploader);
    parentUploaderDiv.appendChild(uploader);

    const selectFileButton = document.createElement('label');
    selectFileButton.textContent = 'Sélectionnez des fichiers';
    selectFileButton.setAttribute('for', uploader.id);
    parentUploaderDiv.append(selectFileButton);

    const textDiv = document.createElement('div');
    textDiv.classList.add('ribs-fileuploader-text');
    textDiv.textContent = 'Ou déposez les ici';
    parentUploaderDiv.append(textDiv);

    const progressBar = document.createElement('div');
    progressBar.classList.add('progress');
    progressBar.max = 100;
    progressBar.value = 0;
    parentUploaderDiv.append(progressBar);

    const inputFileNumber = document.createElement('input');
    inputFileNumber.type = 'hidden';
    inputFileNumber.id = `${uploader.id}-file-number`;
    inputFileNumber.value = 0;
    parentUploaderDiv.append(inputFileNumber);

    const progressBarProgress = document.createElement('div');
    progressBar.append(progressBarProgress);

    const galleryDiv = document.createElement('div');
    galleryDiv.classList.add('ribs-fileuploader-gallery');
    parentUploaderDiv.append(galleryDiv);
  }

  /**
   * method to init all events listeners on uploader divs
   */
  initEventListeners() {
    this.initPreventDefaultsEvents();
    this.initDragEnterEvents();
    this.initDragOutEvents();
    this.initDropEvents();
    this.initInputFileOnchange();
  }

  /**
   * add events prevent defaults to do not show file on drop in page
   */
  initPreventDefaultsEvents() {
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.body.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
      }, false);

      document.querySelectorAll('.ribs-fileuploader').forEach((element) => {
        element.addEventListener(eventName, event => (event) => {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
    });
  }

  /**
   * method to add class is-dragover when enter on uploader zone with files
   */
  initDragEnterEvents() {
    ;['dragenter', 'dragover'].forEach(eventName => {
      document.querySelectorAll('.ribs-fileuploader').forEach((element) => {
        element.addEventListener(eventName, () => {
          element.classList.add('is-dragover');
        }, false);
      });
    });
  }

  /**
   * method to add class is-dragover when qui drag of uploader or drop file
   */
  initDragOutEvents() {
    ;['dragleave', 'drop'].forEach(eventName => {
      document.querySelectorAll('.ribs-fileuploader').forEach((element) => {
        element.addEventListener(eventName, () => {
          element.classList.remove('is-dragover');
        }, false);
      });
    });
  }

  /**
   * method to add drops events to prepare upload and file preview
   */
  initDropEvents() {
    document.querySelectorAll('.ribs-fileuploader').forEach((uploaderDiv) => {
      uploaderDiv.addEventListener('drop', (event) => {
        uploaderDiv.classList.add('has-files');

        const dt = event.dataTransfer;
        const files = [...dt.files];
        const fileNumberInput = uploaderDiv.querySelector('[id*="file-number"]');
        let startIndex = 0;

        if (parseInt(fileNumberInput.value) === 0) {
          fileNumberInput.value = parseInt(fileNumberInput.value) + files.length;
        } else {
          fileNumberInput.value  = parseInt(fileNumberInput.value) + files.length;
          startIndex = parseInt(fileNumberInput.value) - files.length;
        }

        this.initializeProgress(uploaderDiv, files.length);
        files.forEach((file, index) => {
          this.uploadFile(file, startIndex+index, index, uploaderDiv);
        });

        files.forEach((file, index) => {
          this.previewFile(file, uploaderDiv, startIndex+index)
        });
      }, false);
    });
  }

  /**
   * upload with click on label
   */
  initInputFileOnchange() {
    document.querySelectorAll('.ribs-fileuploader').forEach((uploaderDiv) => {
      uploaderDiv.querySelector('input[type=file]').addEventListener('change', (event) => {
        uploaderDiv.classList.add('has-files');

        const dt = event.dataTransfer;
        const files = [...dt.files];
        const fileNumberInput = uploaderDiv.querySelector('[id*="file-number"]');
        let startIndex = 0;

        if (parseInt(fileNumberInput.value) === 0) {
          fileNumberInput.value = parseInt(fileNumberInput.value) + files.length;
        } else {
          fileNumberInput.value  = parseInt(fileNumberInput.value) + files.length;
          startIndex = parseInt(fileNumberInput.value) - files.length;
        }

        this.initializeProgress(uploaderDiv, files.length);
        files.forEach((file, index) => {
          this.uploadFile(file, startIndex+index, index, uploaderDiv);
        });

        files.forEach((file, index) => {
          this.previewFile(file, uploaderDiv, startIndex+index)
        });
      }, false);
    });
  }

  /**
   * @param uploaderDiv
   * @param numFiles
   */
  initializeProgress(uploaderDiv, numFiles) {
    this.uploadProgress[uploaderDiv.id] = [];

    for(let i = numFiles; i > 0; i--) {
      this.uploadProgress[uploaderDiv.id].push(0);
    }
  }

  /**
   * @param uploaderDiv
   * @param fileNumber
   * @param percent
   */
  updateProgress(uploaderDiv, fileNumber, percent) {
    const progressBar = uploaderDiv.querySelector('.progress').querySelector('div');
    this.uploadProgress[uploaderDiv.id][fileNumber] = percent;
    let total = this.uploadProgress[uploaderDiv.id].reduce((tot, curr) => tot + curr, 0) / this.uploadProgress[uploaderDiv.id].length;
    progressBar.style.width = `${total}%`;

    if (total === 100) {
      progressBar.classList.add('uploaded');
    }
  }

  /**
   * @param file
   * @param index
   * @param progressIndex
   * @param uploaderDiv
   */
  uploadFile(file, index, progressIndex, uploaderDiv) {
    var url = this.options.url;
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.upload.addEventListener("progress", (event) => {
      this.updateProgress(uploaderDiv, progressIndex, (event.loaded * 100.0 / event.total) || 100);
    });

    xhr.addEventListener('readystatechange', function(e) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const fileInputId = uploaderDiv.querySelector('input[type=file').id;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.value = xhr.response;
        input.name = `${fileInputId}s[]`;
        uploaderDiv.append(input);
        const uploadedFilePreview = uploaderDiv.querySelector(`#uploaded-file-${index}`);
        uploadedFilePreview.classList.add('uploaded');
      }
      else if (xhr.readyState == 4 && xhr.status != 200) {
        console.log('error');
      }
    });

    formData.append('file', file);
    xhr.send(formData);
  }

  /**
   * method to preview file durng upload
   * @param file
   * @param uploaderDiv
   * @param index
   */
  previewFile(file, uploaderDiv, index) {
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      const div = document.createElement('div');
      div.id = `uploaded-file-${index}`;
      const delDiv = document.createElement('div');
      delDiv.id = `uploaded-file-delete-${index}`;
      delDiv.textContent = 'X';
      div.appendChild(delDiv);
      div.appendChild(img);
      uploaderDiv.querySelector('.ribs-fileuploader-gallery').appendChild(div);
    }
  }
}

export default RibsFileUploader;
