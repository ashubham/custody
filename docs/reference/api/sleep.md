# csty.sleep

Explicitly waits for `n` miliseconds to pass before continuing.

Use this  method for debugging purposes only as using explicit waits in your 
tests is not a good practice and may make your tests flaky. Custody has implicit
waits built in the api methods.

Example
```js
csty.postMessage('Post a message', {
    skipWait: true // Do not wait for any response, i.e. disable implicit wait.
});
csty.sleep(1000); // Wait for 1000ms.
csty.getLastMessage().then(message => {
    console.log(message);
});
```
Details

| Param | Type | Default | Description |
|-------|:-----:|:------:|--------|
|timeout| number | 0 | The timeout value in ms to wait for. |

### Returns

Promise<>