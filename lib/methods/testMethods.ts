import { Logger } from './../logger';
import { controlFlow, flowify } from './../controlFlow';
import { PostMessageOptions } from './testMethods';
import { Message, MessageTypes } from './../platforms/message';
import { Config } from './../config';
import { Platform } from '../platforms/platform';
import diff from '../diff';
import * as q from 'q';
import * as path from 'path';
import callerPath = require('caller-path');
import { wait } from './method-utils';

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
     * Do not tag the name of the reciever in the beginning of the message.
     * 
     * @type {boolean}
     * @memberOf PostMessageOptions
     */
    skipMention?: boolean;

    /**
     * The reciever id.
     * 
     * @type {string}
     * @memberOf PostMessageOptions
     */
    reciever?: string;
}

export interface WaitForResponseOptions {
    /**
     * The reciever id.
     * 
     * @type {string}
     * @memberOf WaitForResponseOptions
     */
    reciever?: string;
    normalizer?: (msg: any) => any;
    timeout?: number;
    skipNormalization?: boolean;
}

export interface UploadFileOptions {
    comment?: string;
    reciever?: string;
    skipWait?: boolean;
}
export class TestMethods {

    private defaultTimeout: number;    
    constructor(private platform: Platform, private config_: Config) {
        this.defaultTimeout = config_.waitTimeout;
    }

    /**
     * Posts a message to the specified/default reciever.
     *
     * This methods waits for a response from the reciever, this
     * behaviour can be turned off by setting skipWait: true in the options.
     *
     * @param message string
     * @param opts PostMessageOptions
     */    
    @flowify
    postMessage(message: string, opts: PostMessageOptions = {}) {
        if (opts.skipWait) {
            return this.platform.post(message, opts.skipMention, opts.reciever);
        }

        return this.platform.post(message, opts.skipMention, opts.reciever)
            .then((response) => {
                return this.waitForMessageAfterTs(response.ts);
            });
    }

    @flowify
    uploadFile(filepath: string, opts: UploadFileOptions = {}) {
        let callerDir = path.dirname(callerPath());
        let absPath = path.resolve(callerDir, filepath);
        if (opts.skipWait) {
            return this.platform.uploadFile(absPath, opts.comment, opts.reciever);
        }

        return this.platform.uploadFile(absPath, opts.comment, opts.reciever)
            .then((response) => {
                return this.waitForMessageAfterTs(response.ts);
            });
    }    

    @flowify    
    sleep(time: number = 0) {
        return q.delay(time);
    }

    @flowify
    getLastMessage(onlyString: boolean = false, reciever?: string): PromiseLike<Message|string> {
        return this.platform.getLastMessage(reciever)
            .then((msg: Message) => {
                return (onlyString) ? msg.text : msg;
            });
    }

    @flowify    
    waitForResponseToBe(target : object|string, opts: WaitForResponseOptions = {}) {
        let latestDelta = null;
        return wait(() => {
            return this.platform.getLastMessage(opts.reciever)
                .then((message) => {
                    try {
                        latestDelta = this.platform.compare(
                            message.payload,
                            target,
                            opts.normalizer,
                            opts.skipNormalization
                        );
                        //console.log(latestDelta, message);
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

    waitForFileShare(reciever?: string, timeout?: number) {
        return wait(() => {
            return this.platform.getLastMessage(reciever).
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
    private waitForMessageAfterTs(timestamp: number | string, reciever?: string) {
        return wait(() => {
            return this.platform.getLastMessage(reciever).then(message => {
                return message.ts > timestamp;
            });
        }, 'Message after timestamp');
    }

}
