import * as q from 'q';
import { Logger } from './../logger';
let waitLogger = new Logger('Wait');

const DEFAULT_WAIT_TIMEOUT = 10000;
const RETRY_WAIT = 100;

export function wait(
    method: (() => any|PromiseLike<any>)|PromiseLike<any>, 
    message: string = '',
    timeout: number = DEFAULT_WAIT_TIMEOUT
) : Q.Promise<any> {
    let deferred = q.defer();
    let runCount = timeout / RETRY_WAIT;
    waitLogger.info(`Waiting for ${message}`);
    function run() {
        if (runCount-- < 0) {
            waitLogger.error(`Timed out after waiting for ${timeout}s: ${message}`);
            return deferred.reject('Timed out');
        }
        let methodPromise = (typeof method === 'function')
            ? Promise.resolve().then(method)
            : method;

        methodPromise.then((resolution => {
            if (!!resolution) {
                return deferred.resolve(resolution);
            }
            setTimeout(run, RETRY_WAIT);
        }), err => {
            setTimeout(run, RETRY_WAIT);
        });
    }
    run();
    return deferred.promise;
}
