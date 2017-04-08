# csty.waitForFileShare

A convenience method which wraps around `csty.wait` to wait until a file is shared
from the reciever.

This function blocks Custody's control flow, not the javascript runtime. It will only delay future custody commands from being executed (e.g. it will cause Custody to wait before sending future commands to the chat platform).

Example: Suppose you post a message which asks for a file to be shared from the reciever. You can block a Custody client until it shared with:
```js
var started = startTestServer();
csty.postMessage('Get me a cat picture.');
csty.waitForFileShare();
expect(csty.getLastMessage(true)).toBe('here\'s your cat');
```
| Param | Type | Default | Description |
|-------|:-----:|:------:|--------|
|opt_reciever |string | config.defaultReciever |The reciever id|
| opt_timeout | number | config.defaultTimeout | How long to wait for the file. |

### Returns

| Type | Description |
| -----| :-----------|
|Promise\<Message\>|A promise that will be fulfilled with the file share message recieved, or rejected if it times out waiting.|