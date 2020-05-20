# ribs-file-uploader
a fileuploader that can be put where you want.

## To initialize it

Just import the class RibsFileUploader and add the css file dist/css/style.min.css to your head section.
To add a new uploader div to your page you have to add this to you html : 

```html
<input type="file" id="my-file" multiple accept="image/*" data-ribs-fileuploader>
```

In this input you can add some dataset.
Inside those dataset you must provide a json.
If you don't want to put url, delete url and retrieve url you can put in parameter with name url.
All other parameters in jsons dataset will be transformed in form data and send to url.

There is three dataset possible wich are :
- data-url-param : will be send when upload a file
- data-delete-url-param : will be send when delete a file
-data-retrieve-url-param : will be send when retrieve files

Input example : 

```html
<input type="file" id="my-file" multiple accept="image/*" data-ribs-fileuploader data-url-param='{"url":"www.example.com/upload"}' data-delete-url-param='{"project_id":12, "user_id":15}' data-retrieve-url-param='{"project_id":12, "user_id":15}'>
```

After you can import in your js file
And after that in the js linked to this page add this : 

```js
import RibsFileUploader from 'RibsFileUploader';

const fileUploader = new RibsFileUploader({
  'url': 'your-upload-url',
  'deleteUrl': 'your-delete-uploaded-file-url',
});
```

Or if you don't want to import js and just link a js file you can link this script.
If you do it like that all urls must be provider in input parameters in dataset
```html
<script src="node_modules/ribs-file-uploader/dist/main.js"></script>
```

And that's it you have the uploader running on your page :)

## Retrieve correct info for upload
### What will be sent to upload url ?
You will just receive a form with file in it. The input name you will receive is named : file.

### What your upload url must return ?
Your upload url must return a json response with those informations :
```JSON
{
  "original_filename": null,
  "new_filename": "",
  "file_path": "",
  "success": ""
}
```
- original_filename must contain the original uploaded filename or null if error on upload
- new_filename must contain the new filename (can be equal to original_filename) or null if error on upload
- file_path must contain the file path on the server or a part or null if error on upload
- success must be true or false

All those informations will be sent if you delete an uploaded file or at a parent form submission (see later).

### how to save files informations after in database if not done on upload

Each uploaded file will have upload json in an input named : input file id with an s.
For example this id "my-file" will have multiples inputs named my-files as an array so my-files[].

Each input will contain (they are created only if success upload) the success json information.

After a parent form submission you just have to get those informations and do what you want with them.

## Retrieve correct info for delete an uploaded file

### What will be sent to delete an uploaded file url ?
If you click on delete button on a file.
It will submit a form with those informations : 
- file_path that contain the file path on the server
- file_name that contain the new_filename information

### What your delete an uploaded file url must return ?
This url must return an json response with just this : 
```JSON
{
  "success": true
}
```
- success must be true or false

If it is true the file will be removed from upload div.
If error for the moment it does nothing 
