# csty.postMessage

Uploads a file to the specified/default receiver.
     
This methods waits for a response from the receiver, this
behaviour can be turned off by setting `skipWait: true` in the options.

Example
```js
csty.uploadFile(__dirname + '/images/me.png'); // Uploads 'me.png' to default Receiver.

csty.postMessage(__dirname + '/images/me.png', { 
    skipWait: true, // Do not wait for any response, i.e. disable implicit wait.
    receiver: 'U192929' // Send file to this user, instead of default.
});
```
| Param | Type | Default | Description |
|-------|:-----:|:------:|--------|
|path| string | '' | Absolute Path to the file. |
| opts | [UploadFileOptions](#uploadFileOpts) | | options |

### UploadFileOptions

| key | Type | Default |Description |
|------|:--------:|:------:| -------- |
|comment|string| '' | Initial comment to be attached to the uploaded file. |
|skipWait|boolean| false |Do not wait for any response |
|receiver |string | config.defaultReceiver |The receiver id|

### Returns

| Type | Description |
| -----| :-----------|
|Promise\<Message\>|A promise that will be fulfilled with the message recieved as confirmation from the platform.|