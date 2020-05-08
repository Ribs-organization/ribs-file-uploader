class RibsFileUploader {
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
    parentUploaderDiv.classList.add('ribs-fileuploader');
    uploader.parentNode.insertBefore(parentUploaderDiv, uploader);
    parentUploaderDiv.appendChild(uploader);

    const selectFileButton = document.createElement('button');
    selectFileButton.textContent = 'Sélectionnez des fichiers';
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
    document.querySelectorAll('.ribs-fileuploader').forEach((element) => {
      element.addEventListener('drop', (event) => {
        element.classList.add('has-files');

        const dt = event.dataTransfer;
        const files = [...dt.files];

        this.initializeProgress(element, files.length);
        files.forEach((file, index) => {
          this.uploadFile(file, index, element);
        });

        files.forEach((file) => {
          this.previewFile(file, element)
        });
      }, false);
    });
  }

  /**
   * @param element
   * @param numFiles
   * @param progressBar
   */
  initializeProgress(element, numFiles) {
    this.uploadProgress[element.id] = [];

    for(let i = numFiles; i > 0; i--) {
      this.uploadProgress[element.id].push(0);
    }
  }

  /**
   * @param element
   * @param fileNumber
   * @param percent
   */
  updateProgress(element, fileNumber, percent) {
    const progressBar = element.querySelector('.progress').querySelector('div');
    this.uploadProgress[element.id][fileNumber] = percent;
    let total = this.uploadProgress[element.id].reduce((tot, curr) => tot + curr, 0) / this.uploadProgress[element.id].length;
    progressBar.style.width = `${total}%`;
  }

  /**
   * @param file
   * @param index
   * @param element
   */
  uploadFile(file, index, element) {
    var url = this.options.url;
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.upload.addEventListener("progress", (event) => {
      this.updateProgress(element, index, (event.loaded * 100.0 / event.total) || 100);
    });

    formData.append('upload_preset', 'ujpu6gyk');
    formData.append('file', file);
    xhr.send(formData);
  }

  /**
   * method to preview file durng upload
   * @param file
   * @param uploaderDiv
   */
  previewFile(file, uploaderDiv) {
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      let img = document.createElement('img');
      img.src = reader.result;
      uploaderDiv.querySelector('.ribs-fileuploader-gallery').appendChild(img);
    }
  }
}

export default RibsFileUploader;
