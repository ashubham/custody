export enum SupportedPlatforms {
    None,
    SLACK,
    MESSENGER
}

export let platformNameToPlatform = {
    slack: SupportedPlatforms.SLACK,
    messenger: SupportedPlatforms.MESSENGER
};

export interface Config {
    [key: string]: any;
    /**
     * The platform to test the bot on. Currently supports Facebook/Slack.
     * 
     * @type {SupportedPlatforms}
     * @memberOf Config
     */
    platform?: SupportedPlatforms;
    /**
     * The auth token to be used to test slack.
     * 
     * @type {string}
     * @memberOf Config
     */
    token?: string;
    /**
     * Required. Spec patterns are relative to the location of this config.
     *
     * Example:
     * specs: [
     *   'spec/*_spec.js'
     * ]
     */
    specs?: string[];
    /**
     * Patterns to exclude specs.
     */
    exclude?: string[];
    /**
     * The params object will be passed directly to the Custody instance,
     * and can be accessed from your test as csty.params. It is an arbitrary
     * object and can contain anything you may need in your test.
     * This can be changed via the command line as:
     *   --params.login.user "Joe"
     *
     * Example:
     * params: {
     *   login: {
     *     user: 'Jane',
     *     password: '1234'
     *   }
     * }
     */
    params?: any;
    /**
     * A map of substitutions to be made on the messages sent.
     * 
     * @type {{
     *         [key: string]: string
     *     }}
     * @memberOf Config
     */
    substitutions?: {
        [key: string]: string
    };
    /**
     * The identifier for the default recipient of any message sent from the test.
     * 
     * @type {string}
     * @memberOf Config
     */
    defaultRecipient?: string;
    /**
     * The id of the bot to be tested. This is used for call outs.
     * 
     * @type {string}
     * @memberOf Config
     */
    botId?: string;

    /**
     * The timeout in milliseconds for each script run on the browser. This
     * should be longer than the maximum time your application needs to
     * stabilize between tasks.
     */
    allScriptsTimeout?: number;

    /**
     * A callback function called once configs are read but before any
     * environment setup. This will only run once and before onPrepare.
     *
     * You can specify a file containing code to run by setting beforeLaunch to
     * the filename string.
     *
     * At this point global variable 'custody' object will NOT be set up,
     * and globals from the test framework will NOT be available. The main
     * purpose of this function should be to bring up test dependencies.
     */
    beforeLaunch?: () => void;

    /**
     * A callback function called once custody is ready and available, and
     * before the specs are executed. If multiple capabilities are being run,
     * this will run once per capability.
     *
     * You can specify a file containing code to run by setting onPrepare to
     * the filename string. onPrepare can optionally return a promise, which
     * Custody will wait for before continuing execution. This can be used if
     * the preparation involves any asynchronous calls, e.g. interacting with
     * the browser. Otherwise Custody cannot guarantee order of execution
     * and may start the tests before preparation finishes.
     *
     * At this point, global variable 'custody' object will be set up, and
     * globals from the test framework will be available. For example, if you
     * are using Jasmine, you can add a reporter with:
     *
     *    jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter(
     *      'outputdir/', true, true));
     *
     * If you need access back to the current configuration object,
     * use a pattern like the following:
     *
     *    return browser.getProcessedConfig().then(function(config) {
     *      // config.capabilities is the CURRENT capability being run, if
     *      // you are using multiCapabilities.
     *      console.log('Executing capability', config.capabilities);
     *    });
     */
    onPrepare?: () => void;

    /**
     * A callback function called once tests are finished. onComplete can
     * optionally return a promise, which Custody will wait for before
     * shutting down webdriver.
     *
     * At this point, tests will be done but global objects will still be
     * available.
     */
    onComplete?: () => void;

    /**
     * A callback function called once the tests have finished running and
     * the WebDriver instance has been shut down. It is passed the exit code
     * (0 if the tests passed). This is called once per capability.
     */
    onCleanUp?: (exitCode: number) => void;

    /**
     * Test framework to use. This may be one of: jasmine or mocha.
     * Default value is 'jasmine'
     *
     * Jasmine is fully supported as test and assertion frameworks.
     * Mocha has limited support. You will need to include your
     * own assertion framework (such as Chai) if working with Mocha.
     */
    framework?: string;

    /**
     * Options to be passed to jasmine.
     *
     * See https://github.com/jasmine/jasmine-npm/blob/master/lib/jasmine.js
     * for the exact options available.
     */
    jasmineNodeOpts?: {
        [key: string]: any;
        /**
         * If true, print colors to the terminal.
         */
        showColors?: boolean;
        /**
         * Default time to wait in ms before a test fails.
         */
        defaultTimeoutInterval?: number;
        /**
         * Function called to print jasmine results.
         */
        print?: () => void;
        /**
         * If set, only execute specs whose names match the pattern, which is
         * internally compiled to a RegExp.
         */
        grep?: string;
        /**
         * Inverts 'grep' matches
         */
        invertGrep?: boolean;
        /**
         * If true, run specs in semi-random order
         */
        random?: boolean,
        /**
         * Set the randomization seed if randomization is turned on
         */
        seed?: string,
    };

    /**
     * Options to be passed to Mocha.
     *
     * See the full list at http://mochajs.org/
     */
    mochaOpts?: { [key: string]: any; ui?: string; reporter?: string; };

}   