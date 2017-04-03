export enum SupportedPlatforms {
    None,
    SLACK,
    MESSENGER
}

export let platformNameToPlatform = {
    slack: SupportedPlatforms.SLACK,
    messenger: SupportedPlatforms.MESSENGER
}

export interface Config {
    [key: string]: any;
    platform?: SupportedPlatforms;
    token?: string;
    specs?: string[];
    exclude?: string[];
    params?: any;
    substitutions?: {
        [key: string]: string
    };
    defaultGroup?: string;
    framework?: string;
    botId?: string;

    /**
     * The timeout in milliseconds for each script run on the browser. This
     * should be longer than the maximum time your application needs to
     * stabilize between tasks.
     */
    allScriptsTimeout?: number;

    /**
     * A callback function called once configs are read but before any
     * environment setup. This will only run once, and before onPrepare.
     *
     * You can specify a file containing code to run by setting beforeLaunch to
     * the filename string.
     *
     * At this point, global variable 'protractor' object will NOT be set up,
     * and globals from the test framework will NOT be available. The main
     * purpose of this function should be to bring up test dependencies.
     */
    beforeLaunch?: () => void;

    /**
     * A callback function called once protractor is ready and available, and
     * before the specs are executed. If multiple capabilities are being run,
     * this will run once per capability.
     *
     * You can specify a file containing code to run by setting onPrepare to
     * the filename string. onPrepare can optionally return a promise, which
     * Protractor will wait for before continuing execution. This can be used if
     * the preparation involves any asynchronous calls, e.g. interacting with
     * the browser. Otherwise Protractor cannot guarantee order of execution
     * and may start the tests before preparation finishes.
     *
     * At this point, global variable 'protractor' object will be set up, and
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
     * optionally return a promise, which Protractor will wait for before
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