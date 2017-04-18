# csty.waitForResponseToBe

A convenience method which wraps around `csty.wait` to wait until a message matching the parameter is recieved.

This function blocks Custody's control flow, not the javascript runtime. It will only delay future custody commands from being executed (e.g. it will cause Custody to wait before sending future commands to the chat platform).

Example: Suppose you post a message which asks for a specific reply from the receiver. You can block a Custody client until you get the reply with:
```js
csty.postMessage('How is the weather today ?');

csty.waitForResponseToBe({
    text: /The weather today is .*/
});
```
This method optionally accepts a normalizer to normalize the recieved message before matching. There are default normalizers already implemented, details of their operation can be found here
[here](../how/normalization.md).
```js
csty.postMessage('help');
csty.waitForResponseToBe({
    numCommands: 5
}, {
    additionalNormalizer: (src) => {
        let numCommands = src.attachments.fields.length;
        return {
            numCommands
        };
});
```
| Param | Type | Default | Description |
|-------|:-----:|:------:|--------|
|target| object\|string | '' |The target to match against |
| opts | [WaitForResponseOptions](#waitRespOptions) | | options |

### WaitForResponseOptions

| key | Type | Default |Description |
|------|:--------:|:------:| -------- |
|normalizer| function(input: T) => T | undefined | The normalizer method which returns a new object to match against.|
|skipNormalization|boolean| false |Do not do any normalization, get raw message |
| timeout | number | config.defaultTimeout | How long to wait for the message. |
|receiver |string | config.defaultReceiver |The receiver id|

### Returns
| Type | Description |
| -----| :-----------|
|Promise\<Message\>|A promise that will be fulfilled with the file share message recieved or rejected if it times out waiting.|