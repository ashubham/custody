# Custody
<!--{h1:.massive-header.-with-tagline}-->
> of naughty chatbots!

<a href="http://ashubham.github.io/custody">
    <img class="logo" src="https://raw.githubusercontent.com/ashubham/custody/master/img/handcuffs.png" align="right" height="80px" alt="Custody logo" />
</a>

E2E test framework for your conversational bot. <br>
Supports Messenger, Slack, more ? Bots are everywhere, and they need to behave!

[![Build Status](https://travis-ci.org/ashubham/custody.svg?branch=master)](https://travis-ci.org/ashubham/custody)
[![npm version](https://badge.fury.io/js/custody.svg)](https://badge.fury.io/js/custody)
[![Coverage Status](https://coveralls.io/repos/github/ashubham/custody/badge.svg?branch=master)](https://coveralls.io/github/ashubham/custody?branch=master)
[![Dependency status](http://img.shields.io/david/docpress/docpress.svg?style=flat-square)](https://david-dm.org/docpress/docpress)
[![Dev Dependencies Status](http://img.shields.io/david/dev/docpress/docpress.svg?style=flat-square)](https://david-dm.org/docpress/docpress#info=devDependencies)

## Getting Started
-------------------

Visit [Custody Website](http://ashubham.github.io/custody) for all documentation.

For a quick setup and run:
 - Follow the [Tutorial](http://ashubham.github.io/custody/start/tutorial.html)
 - [API Reference](https://ashubham.github.io/custody/reference/api/postMessage.html)


## Installation

`$ npm i -g custody`

 ## Basic Usage
 -------------------

`$ custody --platform=slack --framework=jasmine --token=xoxp-123-123 
    --specs=test/**/* --defaultRecipient=C928721`

```javascript
// test/sample.tests.js
describe('This is a sample test', () => {
    it('Sample test 1', () => {
        csty.postMessage('Hello?');
        csty.waitForResponseToBe('World!');
        expect(csty.getLastMessage()).toEqual(
            jasmine.objectContaining({
                payload: {
                    body: 'World!'
                }
            })
        );
    });
});
```

