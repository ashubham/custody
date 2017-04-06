# csty.postMessage

Posts a message to the specified/default reciever.
     
This methods waits for a response from the reciever, this
behaviour can be turned off by setting `skipWait: true` in the options.

Example
```js
csty.postMessage('Test Message!'); // Posts 'Test Message' to default Reciever.

csty.postMessage('Hello', {
    skipWait: false, // Do not wait for a response before continuing.
    reciever: 'U192929' // Send message to this user, instead of default.
});
```
| Param | Type | Description |
|-------|:-----:|--------|
|message| string | The text message to send |
| opts | [PostMessageOptions](#postMesgOpts) | options |

### PostMessageOptions

| key | Type | Description |
|------|:--------:| -------- |
|skipWait|boolean| Do not wait for any response |
|skipMention|boolean| Do not callout the bot/reciver |
|reciever |string | The reciever id|
