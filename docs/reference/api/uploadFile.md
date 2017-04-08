# csty.postMessage

Uploads a file to the specified/default reciever.
     
This methods waits for a response from the reciever, this
behaviour can be turned off by setting `skipWait: true` in the options.

Example
```js
csty.uploadFile('./images/me.png'); // Uploads 'me.png' to default Reciever.

csty.postMessage('./images/me.png', { 
    skipWait: false, // Do not wait for a response before continuing.
    reciever: 'U192929' // Send file to this user, instead of default.
});
```
| Param | Type | Default | Description |
|-------|:-----:|:------:|--------|
|path| string | '' | Path to the file, relative to the script cwd. |
| opts | [UploadFileOptions](#uploadFileOpts) | | options |

### UploadFileOptions

| key | Type | Default |Description |
|------|:--------:|:------:| -------- |
|comment|string| '' | Initial comment to be attached to the uploaded file. |
|skipWait|boolean| false |Do not wait for any response |
|reciever |string | config.defaultReciever |The reciever id|

### Returns

| Type | Description |
| -----| :-----------|
|Promise\<Message\>|A promise that will be fulfilled with the message recieved as confirmation from the platform.|