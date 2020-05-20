import RibsFileUploader from '../../dist/js/RibsFileUploader';

const fileUploader = new RibsFileUploader({
  'url': 'https://ribs-sf4.anthony-pilloud.fr/ribs-admin/upload',
  'deleteUrl': 'https://ribs-sf4.anthony-pilloud.fr/ribs-admin/delete-uploaded-file',
  'retrieveFilesUrl': 'https://ribs-sf4.anthony-pilloud.fr/ribs-admin/retrieve-uploaded-files'
});
