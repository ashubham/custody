import { Logger } from './../logger';
import { controlFlow, flowify } from './../controlFlow';
import { PostMessageOptions } from './testMethods';
import { Message, MessageTypes } from './../platforms/message';
import { Config } from './../config';
import { Platform } from '../platforms/platform';
import * as jsondiffpatch from 'jsondiffpatch';
import * as q from 'q';
import { wait } from './method-utils';

let _logger = new Logger('test-methods');
export interface PostMessageOptions {
    skipWait?: boolean;
    skipMention?: boolean;
    group?: string;
}

export interface WaitForResponseOptions {
    group?: string;
    additionalNormalizer?: (msg: any) => any;
    timeout?: number;
    skipNormalization?: boolean;
}
export class TestMethods {

    private defaultTimeout: number;    
    constructor(private platform: Platform, private config_: Config) {
        this.defaultTimeout = config_.waitTimeout;
    }

    @flowify
    postMessage(message: string, opts: PostMessageOptions = {}) {
        if (opts.skipWait) {
            return this.platform.post(message, opts.skipMention, opts.group);
        }

        return this.platform.post(message, opts.skipMention, opts.group)
            .then((response) => {
                return this.waitForMessageAfterTs(response.ts);
            });
    }

    sleep() {

    }

    @flowify
    getLastMessage(group?: string): PromiseLike<Message> {
        return this.platform.getLastMessage(group);
    }

    @flowify    
    waitForResponseToMatch(target : object|string, opts: WaitForResponseOptions = {}) {
        let latestDelta = null;
        return wait(() => {
            return this.platform.getLastMessage(opts.group)
                .then((message) => {
                    try {
                        latestDelta = this.platform.compare(
                            message.payload,
                            target,
                            opts.additionalNormalizer,
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
                jsondiffpatch.console.log(latestDelta);
            }
            return q.reject(err);
        });
    }

    waitForFileShare(group?: string) {
        return wait(() => {
            return this.platform.getLastMessage(group).
                then((message) => {
                    return message.type === MessageTypes.FILE_SHARE;
                });
        }, 'File Upload');
    }


    @flowify
    wait(
        method: (() => any | PromiseLike<any>) | PromiseLike<any>,
        message?: string,
        timeout?: number
    ) {
        return wait(method, message, timeout);
    }
    private waitForMessageAfterTs(timestamp: number | string, group?: string) {
        return wait(() => {
            return this.platform.getLastMessage(group).then(message => {
                return message.ts > timestamp;
            });
        }, 'Message after timestamp');
    }

}
