import * as path from 'path';
import * as q from 'q';
import diff from '../diff';
import { Config } from './../config';
import { controlFlow, flowify } from './../controlFlow';
import { Logger } from './../logger';
import { Message, MessageTypes } from './../platforms/message';
import { Platform } from '../platforms/platform';
import { PostMessageOptions } from './testMethods';
import { wait } from './method-utils';
import callerPath = require('caller-path');

let _logger = new Logger('test-methods');

/**
 * Options available when posting messages.
 * 
 * @export
 * @interface PostMessageOptions
 */
export interface PostMessageOptions {
    /**
     * Do not wait for a response to the posted message.
     * 
     * @type {boolean}
     * @memberOf PostMessageOptions
     */
    skipWait?: boolean;

    /**
     * Do not tag the name of the receiver in the beginning of the message.
     * 
     * @type {boolean}
     * @memberOf PostMessageOptions
     */
    skipMention?: boolean;

    /**
     * The receiver id.
     * 
     * @type {string}
     * @memberOf PostMessageOptions
     */
    receiver?: string;
}

export interface WaitForResponseOptions {
    /**
     * The receiver id.
     * 
     * @type {string}
     * @memberOf WaitForResponseOptions
     */
    receiver?: string;
    normalizer?: (msg: any) => any;
    timeout?: number;
    skipNormalization?: boolean;
}

export interface UploadFileOptions {
    comment?: string;
    receiver?: string;
    skipWait?: boolean;
}
export class TestMethods {

    private defaultTimeout: number;    
    constructor(private platform: Platform, private config_: Config) {
        this.defaultTimeout = config_.waitTimeout;
    }

    /**
     * Posts a message to the specified/default receiver.
     *
     * This methods waits for a response from the receiver, this
     * behaviour can be turned off by setting skipWait: true in the options.
     *
     * @param message string
     * @param opts PostMessageOptions
     */    
    @flowify
    postMessage(message: string, opts: PostMessageOptions = {}) {
        if (opts.skipWait) {
            return this.platform.post(message, opts.skipMention, opts.receiver);
        }

        return this.platform.post(message, opts.skipMention, opts.receiver)
            .then((response) => {
                return this.waitForMessageAfterTs(response.ts);
            });
    }

    @flowify
    uploadFile(absPath: string, opts: UploadFileOptions = {}) {
        if (opts.skipWait) {
            return this.platform.uploadFile(absPath, opts.comment, opts.receiver);
        }

        return this.platform.uploadFile(absPath, opts.comment, opts.receiver)
            .then((response) => {
                return this.waitForMessageAfterTs(response.ts);
            });
    }    

    @flowify    
    sleep(time: number = 0) {
        return q.delay(time);
    }

    @flowify
    getLastMessage(onlyString: boolean = false, receiver?: string): PromiseLike<Message|string> {
        return this.platform.getLastMessage(receiver)
            .then((msg: Message) => {
                return (onlyString) ? msg.text : msg;
            });
    }

    @flowify    
    waitForResponseToBe(target : object|string, opts: WaitForResponseOptions = {}) {
        let latestDelta = null;
        return wait(() => {
            return this.platform.getLastMessage(opts.receiver)
                .then((message) => {
                    try {
                        latestDelta = this.platform.compare(
                            message.payload,
                            target,
                            opts.normalizer,
                            opts.skipNormalization
                        );
                    } catch (e) {
                        _logger.error(e);
                    }
                    return !latestDelta;
                });
        }, `Response match ${JSON.stringify(target)}`, opts.timeout).then(null, (err) => {
            _logger.error(`FAILED\n`, latestDelta);
            if (latestDelta) {
                diff.console.log(latestDelta);
            }
            return q.reject(err);
        });
    }

    waitForFileShare(receiver?: string, timeout?: number) {
        return wait(() => {
            return this.platform.getLastMessage(receiver).
                then((message) => {
                    if (message.type === MessageTypes.FILE_SHARE) {
                        return message;
                    }
                });
        }, 'File Upload', timeout);
    }


    @flowify
    wait(
        method: (() => any | PromiseLike<any>) | PromiseLike<any>,
        message?: string,
        timeout?: number
    ) {
        return wait(method, message, timeout);
    }
    private waitForMessageAfterTs(timestamp: number | string, receiver?: string) {
        return wait(() => {
            return this.platform.getLastMessage(receiver).then(message => {
                return message.ts > timestamp;
            });
        }, 'Message after timestamp');
    }

}
