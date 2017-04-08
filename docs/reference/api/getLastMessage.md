# csty.getLastMessage

Returns a promise resolving to the last message from the specified/default reciever.

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
| reciever | string | config.defaultReciever |The reciever id |

### Returns

Promise<[Message](#message)|string>