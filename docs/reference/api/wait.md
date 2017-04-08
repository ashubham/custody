# csty.wait

Schedules a command to wait for a condition to hold or promise to be resolved.

This function blocks Custody's control flow, not the javascript runtime. It will only delay future custody commands from being executed (e.g. it will cause Custody to wait before sending future commands to the chat platform).

This function returnes a promise, which can be used if you need to block javascript execution and not just the control flow.

Example: Suppose you have a function, startTestServer, that returns a promise for when a server is ready for requests. You can block a Custody client on this promise with:

```js
var started = startTestServer();
csty.wait(started, 'Server should start within 5 seconds', 5 * 1000);
csty.postMessage('Are you up?');
```
| Param | Type | Default | Description |
|-------|:-----:|:------:|--------|
|condition| Promise<T>|function(): T |  | The condition to wait on, defined as a promise, or a function to evaluate as a condition.|
| opt_message | string | '' | An optional message to use to denote waiting. |
| opt_timeout | number | config.defaultTimeout | How long to wait for the condition to be true. |

### Returns

| Type | Description |
| -----| :-----------|
|Promise\<T\>|A promise that will be fulfilled with the first truthy value returned by the condition function, or rejected if the condition times out.|