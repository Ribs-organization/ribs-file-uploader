class RibsFileUploader {
  constructor() {
    const uploaderInputs = document.querySelectorAll('[data-ribs-fileuploader]');

    uploaderInputs.forEach((element) => {
      this.initHtmlElements(element);
    });
  }

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

    parentUploaderDiv.append(document.createElement('div'));
  }
}

export default RibsFileUploader;
