import * as q from 'q';
import diff from '../diff';
import { Logger } from './../logger';
import { Message, MessageTypes } from './message';
let logger = new Logger('Platform');
export enum GroupTypes {
    None,
    PUBLIC,
    PRIVATE,
    PERSONAL
}

export class Platform {
    protected normalizers = [];
    protected messageTypes = {
        FILE_SHARE: 'file_share'
    };
    public defaultRecipient: string;
    public defaultMention: string;
    constructor(...args) {
        this.createNormalizers();
    }

    auth(): PromiseLike<Platform> {
        logger.warn('Method not implemented');
        return q.reject('auth: Method not implemented');
    }
    normalize(inputObj, additionalNormalizer?: (msg: any) => any) {
        this.normalizers.forEach(normalizer => {
            inputObj = normalizer(inputObj);
        });
        if (additionalNormalizer) {
            return additionalNormalizer(inputObj);
        }
        return inputObj;
    }

    normalizeTarget(target: string | any): Object {
        if (typeof target === 'string' || typeof target === 'number') {
            target = {
                text: target.toString()
            };    
        }
        target.text = target.text || '';
        target.attachments = target.attachments || [];
        return target;
    }

    compare(
        src: any,
        target: string|object,
        additionalNormalizer?: (msg: any) => any,
        skipNormalize?: boolean): any {
        if (!!skipNormalize) {
            return diff.diff(src, target);
        }
        
        let normalizedSrc = this.normalize(src, additionalNormalizer);
        target = this.normalizeTarget(target);
        return diff.diff(normalizedSrc, target);
    }

    getMessageType(message): MessageTypes {
        logger.warn('Not implemented');
        return MessageTypes.None;
    }

    //TODO(Ashish): Support Emojis/URL.    
    post(message: string, skipMention?: boolean, receiver?: string): PromiseLike<any> {
        logger.warn('Method not implemented');
        return q.reject('Post: Method not implemented');
    }

    uploadFile(absPath: string, comment?: string, receiver?: string): PromiseLike<any> {
        logger.warn('Method not implemented');
        return q.reject('Post: Method not implemented');
    }

    getLastMessage(group?: string): PromiseLike<Message> {
        logger.warn('Method not implemented');
        return q.reject('getLastMessage: Method not implemented');
    }

    protected createNormalizers() {
        logger.warn('Method not implemented');
    }
}