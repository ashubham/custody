// An example configuration file.
exports.config = {
    // platform to test slack/messenger are supported
    platform: "slack",

    // API token used to hit slack
    token: process.env.slackAPIToken,

    // Default recipient to whom all messages would be sent.
    defaultRecipient: 'C4R7LDGFP',

    // Framework to use. Jasmine is recommended.
    framework: 'jasmine',

    // Spec patterns are relative to the current working directory when
    // custody is called.
    specs: ['example.test.js'],

    // Options to be passed to Jasmine.
    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
