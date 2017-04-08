import { resolve } from 'path';
import { Promise, when, defer } from 'q';

/**
 * Internal helper for abstraction of polymorphic filenameOrFn properties.
 * @param {object} filenameOrFn The filename or function that we will execute.
 * @param {Array.<object>}} args The args to pass into filenameOrFn.
 * @return {q.Promise} A promise that will resolve when filenameOrFn completes.
 */
export function runFilenameOrFn_(configDir: string, filenameOrFn: any, args?: any[]): Promise<any> {
    return Promise((resolvePromise) => {
        if (filenameOrFn && !(typeof filenameOrFn === 'string' || typeof filenameOrFn === 'function')) {
            throw new Error('filenameOrFn must be a string or function');
        }

        if (typeof filenameOrFn === 'string') {
            filenameOrFn = require(resolve(configDir, filenameOrFn));
        }
        if (typeof filenameOrFn === 'function') {
            let results = when(filenameOrFn.apply(null, args), null, (err) => {
                if (typeof err === 'string') {
                    err = new Error(err);
                } else {
                    err = err as Error;
                    if (!err.stack) {
                        err.stack = new Error().stack;
                    }
                }
                err.stack = exports.filterStackTrace(err.stack);
                throw err;
            });
            resolvePromise(results);
        } else {
            resolvePromise(undefined);
        }
    });
}

export function promisify(target: Object, pKey: string, descriptor: PropertyDescriptor) {
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, pKey);
    let originalMethod = descriptor.value;
    descriptor.value = function () {
        let deferred = defer();
        let args = [...arguments, (err, response) => {
            if (err) {
                return deferred.reject(err);
            }
            return deferred.resolve(response);
        }];
        return originalMethod(...args);
    };
    return descriptor;
}
