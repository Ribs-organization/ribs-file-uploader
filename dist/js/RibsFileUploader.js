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
    this.defineOptions(options);
    this.initEventListeners();
  }

  /**
   * @param options
   */
  defineOptions(options) {
    if (!options.url) {
      options.url = '';
    }
    if (!options.deleteUrl) {
      options.deleteUrl = '';
    }
    if (!options.retrieveFilesUrl) {
      options.retrieveFilesUrl = '';
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
    this.initRetrieveFiles();
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
        element.addEventListener(eventName, (event) => {
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
        this.handleFilesUpload(event, uploaderDiv);
      }, false);
    });
  }

  /**
   * upload with click on label
   */
  initInputFileOnchange() {
    document.querySelectorAll('.ribs-fileuploader').forEach((uploaderDiv) => {
      uploaderDiv.querySelector('input[type=file]').addEventListener('change', (event) => {
        this.handleFilesUpload(event, uploaderDiv, true);
      }, false);
    });
  }

  initRetrieveFiles() {
    document.querySelectorAll('.ribs-fileuploader').forEach((uploaderDiv) => {
      const parameters = this.retrieveParameter(uploaderDiv, 'retrieveFilesUrl');
      const url = this.retrieveUrl(this.options.retrieveFilesUrl, parameters);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          const jsonResponse = JSON.parse(xhr.response);
          const fileInputId = uploaderDiv.querySelector('input[type=file').id;

          if (jsonResponse.files) {
            uploaderDiv.classList.add('has-files');

            for (const file of jsonResponse.files) {
              const fileNumberInput = uploaderDiv.querySelector('[id*="file-number"]');

              const input = document.createElement('input');
              input.type = 'hidden';
              input.value = JSON.stringify(file);
              input.name = `${fileInputId}s[]`;
              input.id = `input-uploaded-file-${file.index}`;
              uploaderDiv.append(input);

              this.appendPreviewImageDiv(uploaderDiv, file.file_path, file.index);

              const uploadedFilePreview = uploaderDiv.querySelector(`#uploaded-file-${file.index}`);
              uploadedFilePreview.classList.add('uploaded');
              uploadedFilePreview.querySelector('div').addEventListener('click', (event) => this.deleteFile(event, uploaderDiv));

              fileNumberInput.value = parseInt(fileNumberInput.value) + 1;
            }
          }
        }
        else if (xhr.readyState == 4 && xhr.status != 200) {
          console.log('error');
        }
      });

      xhr.send(this.buildFormData(parameters));
    });
  }

  /**
   * method to prepare upload file and preview with drop on change event
   * @param event
   * @param uploaderDiv
   * @param fromChangeEvent
   */
  handleFilesUpload(event, uploaderDiv, fromChangeEvent = false) {
    uploaderDiv.classList.add('has-files');
    let files;
    const dt = event.dataTransfer;

    if (fromChangeEvent) {
      files = [...event.currentTarget.files];
    } else {
      files = [...dt.files];
    }

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
   * method to retrieve a specific parameter write on input file
   * @param uploaderDiv
   * @param parameter
   * @returns {string | undefined}
   */
  retrieveParameter(uploaderDiv, parameter) {
    const inputFile = uploaderDiv.querySelector('input[type=file]');
    const parameters = inputFile.dataset[parameter];

    if (parameters) {
      try {
        return JSON.parse(parameters);
      } catch (e) {
        console.warn('Erreur in uploader JSON');
        return false;
      }
    }

    return false;
  }

  /**
   * method to retrieve url with parameters or config url
   * @param url
   * @param parameters
   * @returns {null|*}
   */
  retrieveUrl(url, parameters) {
    if (parameters && parameters.url && parameters.url !== '') {
      return parameters.url;
    } else if (url && url !== '') {
      return url;
    } else {
      return null;
    }
  }

  /**
   * method to build form data with parameters of input
   * @param parameters
   * @param file
   * @returns {FormData}
   */
  buildFormData(parameters, file = null) {
    const formData = new FormData();

    for (const tempData in parameters) {
      if (tempData !== 'url') {
        formData.append(tempData, parameters[tempData]);
      }
    }

    if (file) {
      formData.append('file', file);
    }

    return formData;
  }

  /**
   * @param file
   * @param index
   * @param progressIndex
   * @param uploaderDiv
   */
  uploadFile(file, index, progressIndex, uploaderDiv) {
    const parameters = this.retrieveParameter(uploaderDiv, 'urlParam');
    const url = this.retrieveUrl(this.options.url, parameters);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.upload.addEventListener("progress", (event) => {
      this.updateProgress(uploaderDiv, progressIndex, (event.loaded * 100.0 / event.total) || 100);
    });

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const fileInputId = uploaderDiv.querySelector('input[type=file').id;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.value = xhr.response;
        input.name = `${fileInputId}s[]`;
        input.id = `input-uploaded-file-${index}`;
        uploaderDiv.append(input);
        const uploadedFilePreview = uploaderDiv.querySelector(`#uploaded-file-${index}`);
        uploadedFilePreview.classList.add('uploaded');
        uploadedFilePreview.querySelector('div').addEventListener('click', (event) => this.deleteFile(event, uploaderDiv));
      }
      else if (xhr.readyState == 4 && xhr.status != 200) {
        console.log('error');
      }
    });

    xhr.send(this.buildFormData(parameters, file));
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
      this.appendPreviewImageDiv(uploaderDiv, reader.result, index);
    }
  }

  /**
   * method to create image element in gallery div
   * @param uploaderDiv
   * @param filePath
   * @param index
   */
  appendPreviewImageDiv(uploaderDiv, filePath, index) {
    const img = document.createElement('img');
    img.src = filePath;
    const div = document.createElement('div');
    div.id = `uploaded-file-${index}`;
    const delDiv = document.createElement('div');
    delDiv.id = `uploaded-file-delete-${index}`;
    delDiv.textContent = 'X';
    div.appendChild(delDiv);
    div.appendChild(img);
    uploaderDiv.querySelector('.ribs-fileuploader-gallery').appendChild(div);
  }

  /**
   * method to deletes uploaded files
   * @param event
   * @param uploaderDiv
   */
  deleteFile(event, uploaderDiv) {
    const parameters = this.retrieveParameter(uploaderDiv, 'deleteUrlParam');
    const url = this.retrieveUrl(this.options.deleteUrl, parameters);
    const imageDiv = event.currentTarget.parentNode;
    const inputImageInfo = uploaderDiv.querySelector(`#input-${imageDiv.id}`);
    const imageInfo = JSON.parse(inputImageInfo.value);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        const data = JSON.parse(xhr.response);
        if (data.success) {
          imageDiv.remove();
          inputImageInfo.remove();

          if (uploaderDiv.querySelector('.ribs-fileuploader-gallery').childNodes.length === 0) {
            uploaderDiv.classList.remove('has-files');
            const progressBar = uploaderDiv.querySelector('.progress > div');
            progressBar.classList.remove('uploaded');
            progressBar.style.width = '0%';
          }
        }
      }
      else if (xhr.readyState == 4 && xhr.status != 200) {
        console.log('error');
      }
    });

    const formData = this.buildFormData(parameters);
    formData.append('file_path', imageInfo.file_path);
    formData.append('file_name', imageInfo.new_filename ? imageInfo.new_filename : imageInfo.filename);
    xhr.send(formData);
  }
}

export default RibsFileUploader;
