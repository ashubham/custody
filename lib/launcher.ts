import * as fs from 'fs';
import * as q from 'q';

import { Config } from './config';
import { ConfigParser } from './configParser';
import { ConfigError, ErrorHandler, AppraisalError } from './exitCodes';
import { Logger } from './logger';
import { Runner } from './runner';
import { TaskResults } from './taskResults';
import { Task } from './task';
import * as util from './util';

let logger = new Logger('launcher');
let RUNNERS_FAILED_EXIT_CODE = 100;


process.on('uncaughtException', (exc: (Error | string)) => {
    let e = (exc instanceof Error) ? exc : new Error(exc);

    let errorCode = ErrorHandler.parseError(e);
    if (errorCode) {
        let appraisalError = e as AppraisalError;
        AppraisalError.log(logger, errorCode, appraisalError.message, appraisalError.stack);
        process.exit(errorCode);
    } else {
        logger.error(e.message);
        logger.error(e.stack);
        process.exit(AppraisalError.CODE);
    }
});

process.on('exit', (code: number) => {
    if (code) {
        logger.error('Process exited with error code ' + code);
    }
});

// Run afterlaunch and exit
let cleanUpAndExit = (config: Config, exitCode: number) => {
    return util.runFilenameOrFn_(config.configDir, config.afterLaunch, [exitCode])
        .then(
        (returned) => {
            if (typeof returned === 'number') {
                process.exit(returned);
            } else {
                process.exit(exitCode);
            }
        },
        (err: Error) => {
            logger.error('Error:', err);
            process.exit(1);
        });
};

let taskResults_ = new TaskResults();

/**
 * Initialize and run the tests.
 * Exits with 1 on test failure, and RUNNERS_FAILED_EXIT_CODE on unexpected
 * failures.
 *
 * @param {string=} configFile
 * @param {Object=} additionalConfig
 */
let initFn = function (configFile: string, additionalConfig: Config) {
    let configParser = new ConfigParser();
    if (configFile) {
        configParser.addFileConfig(configFile);
    }
    if (additionalConfig) {
        configParser.addConfig(additionalConfig);
    }
    let config = configParser.getConfig();
    Logger.set(config);
    logger.debug('Running with --troubleshoot');
    logger.debug('Appraisal version: ' + require('../package.json').version);

    // Run beforeLaunch
    util.runFilenameOrFn_(config.configDir, config.beforeLaunch)
        .then(() => {
            let task = new Task(config);
            let taskRunner = new Runner(config, task);
            taskRunner.run()
                .then((result) => {
                    if (result.exitCode && !result.failedCount) {
                        logger.error(
                            'Runner process exited unexpectedly with error code: ' + result.exitCode);
                    }
                    taskResults_.add(result);
                })
                .then(function () {
                    // Save results if desired
                    if (config.resultJsonOutputFile) {
                        taskResults_.saveResults(config.resultJsonOutputFile);
                    }

                    taskResults_.reportSummary();
                    let exitCode = (taskResults_.totalSpecFailures() > 0)
                        ? 1 : 0;
                    cleanUpAndExit(config, exitCode);
                })
                .catch((err: Error) => {
                    logger.error('Error:', (err as any).stack || err.message || err);
                })
                .done();
        })
        .done();
};

export let init = initFn;
