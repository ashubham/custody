# csty.getLastMessage

Returns a promise resolving to the last message from the specified/default receiver.

Example
```js
csty.getLastMessage().then(message => {
    console.log(message);
});

expect(csty.getLastMessage(true, 'U123454')).toBe('Gotcha!');
```
Details

| Param | Type | Default | Description |
|-------|:-----:|:------:|--------|
|onlyString| boolean | false |return only the string part of the response |
| receiver | string | config.defaultReceiver |The receiver id |

### Returns

Promise<[Message](#message)|string>