import { Task } from './task';
import { TestMethods } from './methods/testMethods';
import { Platform } from './platforms/platform';
import { EventEmitter } from 'events';
import * as q from 'q';
import * as util from 'util';

import { Config } from './config';
import { ConfigError } from './exitCodes';
import { Logger } from './logger';
import * as helper from './util';
import * as platforms from './platforms/platforms';

declare let global: any;
declare let process: any;

let logger = new Logger('runner');

export interface RunResults {
    taskId: number;
    specs: Array<string>;
    failedCount: number;
    exitCode: number;
    specResults: Array<any>;
}

/*
 * Runner is responsible for starting the execution of a test run and triggering
 * setup, teardown, managing config, etc through its various dependencies.
 *
 * The Custody Runner is a node EventEmitter with the following events:
 * - testPass
 * - testFail
 * - testsDone
 *
 * @param {Object} config
 * @constructor
 */
export class Runner extends EventEmitter {
    config_: Config;
    preparer_: any;
    frameworkUsesAfterEach: boolean;

    constructor(config: Config, private task: Task) {
        super();
        this.config_ = config;

        this.setTestPreparer(config.onPrepare);

    }

    /**
     * Registrar for testPreparers - executed right before tests run.
     * @public
     * @param {string/Fn} filenameOrFn
     */
    setTestPreparer(filenameOrFn: string | Function): void {
        this.preparer_ = filenameOrFn;
    }

    /**
     * Executor of testPreparer
     * @public
     * @param {string[]=} An optional list of command line arguments the framework will accept.
     * @return {q.Promise} A promise that will resolve when the test preparers
     *     are finished.
     */
    runTestPreparer(extraFlags?: string[]): q.Promise<any> {
        let unknownFlags = this.config_.unknownFlags_ || [];
        if (extraFlags) {
            unknownFlags = unknownFlags.filter((f) => extraFlags.indexOf(f) === -1);
        }
        if (unknownFlags.length > 0 && !this.config_.disableChecks) {
            // TODO: Make this throw a ConfigError in Custody 6.
            logger.warn(
                'Ignoring unknown extra flags: ' + unknownFlags.join(', ') + '. This will be' +
                ' an error in future versions, please use --disableChecks flag to disable the ' +
                ' Custody CLI flag checks. ');
        }
        return helper.runFilenameOrFn_(this.config_.configDir, this.preparer_);
    }

    /**
     * Responsible for cleaning up test run and exiting the process.
     * @private
     * @param {int} Standard unix exit code
     */
    exit_ = function (exitCode: number): any {
        return helper.runFilenameOrFn_(this.config_.configDir, this.config_.onCleanUp, [exitCode])
            .then((returned): number | any => {
                if (typeof returned === 'number') {
                    return returned;
                } else {
                    return exitCode;
                }
            });
    };

    /**
     * Getter for the Runner config object
     * @public
     * @return {Object} config
     */
    getConfig(): Config {
        return this.config_;
    }

    getPlatform(): Platform {
        return platforms.getPlatform(this.config_);
    }

    /**
     * Sets up convenience globals for test specs
     * @param platform 
     */    
    setupGlobals(platform: Platform) {
        let testMethods = new TestMethods(platform, this.config_);
        if (this.config_.defaultRecipient) {
            platform.defaultRecipient = this.config_.defaultRecipient;
        }
        if (this.config_.botId) {
            platform.defaultMention = this.config_.botId;
        }
        global.app = testMethods;
    }

    run(): q.Promise<any> {
        let testPassed: boolean;
        let results: any;
        this.config_.specs = this.task.specs;

        return q.resolve(null)
            .then(() => {
                let platform = this.getPlatform();
                return platform.auth();
            })
            .then(this.setupGlobals.bind(this))
            .then(() => {
                // Do the framework setup here so that jasmine and mocha globals are
                // available to the onPrepare function.
                let frameworkPath = '';
                if (this.config_.framework === 'jasmine' || this.config_.framework === 'jasmine2') {
                    frameworkPath = './frameworks/jasmine.js';
                } else if (this.config_.framework === 'mocha') {
                    frameworkPath = './frameworks/mocha.js';
                } else if (this.config_.framework === 'custom') {
                    if (!this.config_.frameworkPath) {
                        throw new Error(
                            'When config.framework is custom, ' +
                            'config.frameworkPath is required.');
                    }
                    frameworkPath = this.config_.frameworkPath;
                } else {
                    throw new Error(
                        'config.framework (' + this.config_.framework + ') is not a valid framework.');
                }

                logger.debug('Running with spec files ' + this.config_.specs);

                return require(frameworkPath).run(this, this.config_.specs);
            })
            .then((results: RunResults) => {
                results.taskId = this.task.taskId;
                results.specs = this.task.specs;
                testPassed = results.failedCount === 0;
                let exitCode = testPassed ? 0 : 1;
                results.exitCode = exitCode;

                this.emit('testsDone', results);
                return this.exit_(exitCode);
            });
    }
}