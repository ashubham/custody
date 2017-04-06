# Tutorial

Custody is a Node.js program. To run, you will need to have Node.js(>6) installed.

## Prerequisites


By default, Custody uses the Jasmine test framework for its testing interface. You could however use Mocha too. This tutorial assumes some familiarity with Jasmine, and we will use version 2.4.

Additional prereuisites as per the platform:

### Slack

Generate a _Slack_ user testing token. One can easily generate tester tokens using the [token generator](https://api.slack.com/custom-integrations/legacy-tokens).
Or can use an oauth token from [here](https://api.slack.com/docs/oauth).

### Messenger

_Messenger_ does not support token based messaging for users. So we need
to use a `email/password` pair to emulate a user sending mesages to the bot being
tested. 

## Setup

Use npm to install _Custody_ globally with:

```sh
npm install -g custody
```

Try running `custody --version` to make sure it's working.

## Step 0 - write a test

Custody needs two files to run, a **spec file** and a **configuration**.

Lets start with a simple test that evaluates a simple pizza delivery bot on slack.

Copy the following into spec.js:
```javascript
describe('Pizza bot test', function() {
    it('Should reply with pizza types on initial message', function() {
        csty.postMessage('Hey ssup ?');
        expect(csty.getLastMessage(true)).toMatch(/The pizzas available are.*/);
    });
});
```
The `describe` and `it` syntax is from the *Jasmine* framework. `csty` is a global created by Custody, which is used for conversational commands such as posting a message with `csty.postMessage`.

Now create the configuration file, copy the follwing into conf.js:
```javascript
exports.config = {
  framework: 'jasmine',
  platform: 'slack',
  token: $SLACK_TOKEN,
  specs: ['spec.js'],
  defaultReciever: 'C123454'
}
```
This configuration tells Custody where your test files (`specs`) are, and which messaging platform to use (`platform`). It specifies that we will be using Jasmine for the test framework. The `token` speciefies the auth token we created in the step above. The `defaultReciever` is the id of the channel where our message would be posted. It will use the defaults for all other configuration.

Now run the test with
```haskell
custody conf.js
```

You should see in your slack window, on the channel you mentioned, a message being posted `Hey ssup ?`. The bot (if working as intended) should reply with the expected response. Congratulations, you've run your first Custody test!

