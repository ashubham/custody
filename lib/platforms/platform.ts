import { Message, MessageTypes } from './message';
import { Logger } from './../logger';
import * as jsondiffpatch from 'jsondiffpatch';
import * as q from 'q';
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
    public defaultGroup: string;
    public defaultMention: string;
    constructor(token: string) {

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

    convertStringTargetToJson(target: string | any): Object {
        if (typeof target === 'string' || typeof target === 'number') {
            return {
                text: target.toString()
            };    
        }
        return target;
    }

    compare(
        src: any,
        target: any,
        additionalNormalizer?: (msg: any) => any,
        skipNormalize?: boolean) : any {
        let normalizedSrc = this.normalize(src, additionalNormalizer);
        target = this.convertStringTargetToJson(target);
        return jsondiffpatch.diff(normalizedSrc, target);
    }

    getMessageType(message): MessageTypes {
        logger.warn('Not implemented');
        return MessageTypes.None;
    }

    post(message: string, skipMention?: boolean, group?: string): PromiseLike<any> {
        logger.warn('Method not implemented');
        return q.reject('Method not implemented');
    }

    getLastMessage(group?: string): PromiseLike<Message> {
        logger.warn('Method not implemented');
        return q.reject('Method not implemented');
    }


}