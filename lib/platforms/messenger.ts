import * as fs from 'fs';
import * as path from 'path';
import * as q from 'q';
import {
    createAddKeyNormalizer,
    createDeleteNullUndefinedNormalizer,
    createKeyDeleteNormalizer,
    createRenameKeyNormalizer
    } from './normalizers';
import { Logger } from './../logger';
import { Message, MessageTypes } from './message';
import { Platform } from './platform';
import login = require('facebook-chat-api');

let logger = new Logger('Messenger');

export class MessengerMessage implements Message {
    constructor(private _payload) {
    }
    get payload() {
        return this._payload;
    }      
    get ts() {
        return this._payload.timestamp;
    }

    get text() {
        return this._payload.body;
    }

    get type(): MessageTypes {
        if (this._payload.attachments.length) {
            return MessageTypes.FILE_SHARE;
        }

        return MessageTypes.TEXT;
    }
}
export class Messenger extends Platform {
    private client;
    constructor(private email: string, private password: string) {
        super();
        logger.info('Using Messenger Platform');
    }

    auth(): PromiseLike<Platform> {
        let deferred = q.defer();
        login({ email: this.email, password: this.password }, (err, api) => {
            if (err) {
                logger.error('Authentication Failed');
                return deferred.reject(this);
            }
            this.client = api;
            deferred.resolve(this);
        });
        return deferred.promise;
    }

    post(
        message: string,
        skipMention: boolean = true,
        recipient: string = this.defaultRecipient): PromiseLike<any> {
        let deferred = q.defer();
        this.client.sendMessage(message, recipient, (err, resp) => {
            if (err) {
                logger.error(err);
                return deferred.reject(err);
            }
            return deferred.resolve(new MessengerMessage(resp));
        });

        return deferred.promise;
    }

    uploadFile(
        absPath: string,
        comment: string = '',
        receiver: string = this.defaultRecipient
    ): PromiseLike<any> {
        let message = {
            attachment: fs.createReadStream(absPath),
            body: comment
        };
        return q.ninvoke(this.client.files, 'sendMessage', message)
            .then(resp => new MessengerMessage(resp));
    }

    getLastMessage(
        recipient: string = this.defaultRecipient
    ): PromiseLike<MessengerMessage> {
        let deferred = q.defer();
        this.client.getThreadHistory(recipient, 0, 1, undefined, (err, msgs) => {
            if (err) {
                logger.debug(err);
                return deferred.reject(err);
            }
            let msg = new MessengerMessage(msgs[0]);
            return deferred.resolve(msg);
        });
        return deferred.promise;
    }

    protected createNormalizers() {
        let keyDel = createKeyDeleteNormalizer(
            'type',
            'senderName',
            'timestamp',
            'senderID',
            'participantNames',
            'participantIDs',
            'threadID',
            'threadName',
            'messageID',
            'timestampAbsolute',
            'timestampRelative',
            'timestampDatetime',
            'tags',
            'isGroup'
        );
        let renameKey = createRenameKeyNormalizer({
            body: 'text'
        });
        let compact = createDeleteNullUndefinedNormalizer();
        let addKey = createAddKeyNormalizer({ attachments: [] });
        this.normalizers.push(keyDel, renameKey, compact, addKey);
    }    
}