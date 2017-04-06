# custody
<!--{h1:.massive-header.-with-tagline}-->

> Naughty chatbots, Disciplined!

E2E test framework for your conversational bot. <br>
Supports Messenger, Slack, more ?

[![Build Status](https://travis-ci.org/ashubham/appraisal.svg?branch=master)](https://travis-ci.org/ashubham/appraisal)
[![npm version](https://badge.fury.io/js/appraisal.svg)](https://badge.fury.io/js/appraisal)
[![Coverage Status](https://coveralls.io/repos/github/ashubham/appraisal/badge.svg?branch=master)](https://coveralls.io/github/ashubham/appraisal?branch=master)
[![Dependency status](http://img.shields.io/david/docpress/docpress.svg?style=flat-square)](https://david-dm.org/docpress/docpress)
[![Dev Dependencies Status](http://img.shields.io/david/dev/docpress/docpress.svg?style=flat-square)](https://david-dm.org/docpress/docpress#info=devDependencies)

## Getting Started
-------------------

Visit [Appraisal Website](http://ashubham.github.io/appraisal) for all documentation.

For a quick setup and run:
 - Follow the [Tutorial](http://ashubham.github.io/appraisal/tutorial.html)
 - [API Reference](http://ashubham.github.io/appraisal/api.html)

 ## Basic Usage

`$ npm i -g appraisal`

`$ appraisal --platform=slack --framework=jasmine --token=xoxp-123-123 
    --specs=test/**/* --defaultRecipient=C928721`

```javascript
// test/sample.tests.js
describe('This is a sample test', () => {
    it('Sample test 1', () => {
        app.postMessage('Hello?');
        app.waitForResponseToMatch('World!');
        expect(app.getLastMessage()).toEqual(
            jasmine.objectContaining({
                payload: {
                    body: 'World!'
                }
            })
        );
    });
});
```

