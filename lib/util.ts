import { resolve } from 'path';
import { Promise, when } from 'q';

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