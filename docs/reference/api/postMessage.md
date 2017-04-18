# csty.postMessage

Posts a message to the specified/default receiver.
     
This methods waits for a response from the receiver, it blocks Custody's control flow, not the javascript runtime. It will only delay future custody commands from being executed (e.g. this method will cause Custody to wait before sending future commands to the chat platform). This
behaviour can be turned off by setting `skipWait: true` in the options.

Example
```js
csty.postMessage('Test Message!'); // Posts 'Test Message' to default Receiver.

csty.postMessage('Hello', {
    skipWait: true, // Do not wait for any response, i.e. disable implicit wait.
    receiver: 'U192929' // Send message to this user, instead of default.
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
|skipMention|boolean| false |Do not call out the bot/reciver |
|receiver |string | config.defaultReceiver |The receiver id|

### Returns
| Type | Description |
| -----| :-----------|
|Promise\<Message\>|A promise that will be fulfilled with the message recieved as confirmation from the platform.|