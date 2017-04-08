# csty.postMessage

Posts a message to the specified/default reciever.
     
This methods waits for a response from the reciever, it blocks Custody's control flow, not the javascript runtime. It will only delay future custody commands from being executed (e.g. it will cause Custody to wait before sending future commands to the chat platform). This
behaviour can be turned off by setting `skipWait: true` in the options.

Example
```js
csty.postMessage('Test Message!'); // Posts 'Test Message' to default Reciever.

csty.postMessage('Hello', {
    skipWait: false, // Do not wait for a response before continuing.
    reciever: 'U192929' // Send message to this user, instead of default.
});
```
| Param | Type | Default | Description |
|-------|:-----:|:------:|--------|
|message| string | '' |The text message to send |
| opts | [PostMessageOptions](#postMesgOpts) | | options |

### PostMessageOptions

| key | Type | Default |Description |
|------|:--------:|:------:| -------- |
|skipWait|boolean| false |Do not wait for any response |
|skipMention|boolean| false |Do not callout the bot/reciver |
|reciever |string | config.defaultReciever |The reciever id|

### Returns
| Type | Description |
| -----| :-----------|
|Promise\<Message\>|A promise that will be fulfilled with the message recieved as confirmation from the platform.|