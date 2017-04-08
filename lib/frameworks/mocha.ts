import * as q from 'q';

declare let global: any;

/**
 * Execute the Runner's test cases through Mocha.
 *
 * @param {Runner} runner The current Custody Runner.
 * @param {Array} specs Array of Directory Path Strings.
 * @return {q.Promise} Promise resolved with the test results
 */
exports.run = function (runner, specs) {
    let Mocha = require('mocha'),
        mocha = new Mocha(runner.getConfig().mochaOpts);

    let deferred = q.defer();

    // Mocha doesn't set up the ui until the pre-require event, so
    // wait until then to load mocha-webdriver adapters as well.
    mocha.suite.on('pre-require', function () {
        try {
            let sAdapter = require('./mocha-wrappers');

            // Save unwrapped version
            let unwrappedFns = {};
            ['after', 'afterEach', 'before', 'beforeEach', 'it', 'xit', 'iit'].forEach(function (fnName) {
                unwrappedFns[fnName] = global[fnName] || Mocha[fnName];
            });

            let wrapFn = function (sWrappedFn, opt_fnName?: string) {
                // This does not work on functions that can be nested (e.g. `describe`)
                return function () {
                    // Set globals to unwrapped version to avoid circular reference
                    let wrappedFns = {};
                    for (let fnName in unwrappedFns) {
                        wrappedFns[fnName] = global[fnName];
                        global[fnName] = unwrappedFns[fnName];
                    }

                    let args = arguments;
                    // Allow before/after hooks to use names
                    if (opt_fnName && (arguments.length > 1) && (sWrappedFn.length < 2)) {
                        global[opt_fnName] = global[opt_fnName].bind(this, args[0]);
                        args = Array.prototype.slice.call(arguments, 1);
                    }

                    try {
                        sWrappedFn.apply(this, args);
                    } finally {
                        // Restore wrapped version
                        for (let fnName in wrappedFns) {
                            global[fnName] = wrappedFns[fnName];
                        }
                    }
                };
            };

            // Wrap functions
            global.after = wrapFn(sAdapter.after, 'after');
            global.afterEach = wrapFn(sAdapter.afterEach, 'afterEach');
            global.before = wrapFn(sAdapter.before, 'before');
            global.beforeEach = wrapFn(sAdapter.beforeEach, 'beforeEach');

            global.it = wrapFn(sAdapter.it);
            global.iit = wrapFn(sAdapter.it.only);
            global.xit = wrapFn(sAdapter.xit);
            global.it.only = wrapFn(sAdapter.it.only);
            global.it.skip = wrapFn(sAdapter.it.skip);
        } catch (err) {
            deferred.reject(err);
        }
    });

    mocha.loadFiles();

    runner.runTestPreparer().then(function () {
        specs.forEach(function (file) {
            mocha.addFile(file);
        });

        let testResult = [];

        let mochaRunner = mocha.run(function (failures) {
            try {
                let completed = q();
                if (runner.getConfig().onComplete) {
                    completed = q(runner.getConfig().onComplete());
                }
                completed.then(function () {
                    deferred.resolve({
                        failedCount: failures,
                        specResults: testResult
                    });
                });
            } catch (err) {
                deferred.reject(err);
            }
        });

        mochaRunner.on('pass', function (test) {
            let testInfo = {
                name: test.title,
                category: test.fullTitle().slice(0, -test.title.length).trim()
            };
            runner.emit('testPass', testInfo);
            testResult.push({
                description: test.title,
                assertions: [{
                    passed: true
                }],
                duration: test.duration
            });
        });

        mochaRunner.on('fail', function (test) {
            let testInfo = {
                name: test.title,
                category: test.fullTitle().slice(0, -test.title.length).trim()
            };
            runner.emit('testFail', testInfo);
            testResult.push({
                description: test.title,
                assertions: [{
                    passed: false,
                    errorMsg: test.err.message,
                    stackTrace: test.err.stack
                }],
                duration: test.duration
            });
        });
    }).catch(function (reason) {
        deferred.reject(reason);
    });

    return deferred.promise;
};
