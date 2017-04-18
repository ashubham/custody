import * as fs from 'fs';
import * as path from 'path';
import * as q from 'q';
import { createAddKeyNormalizer, createKeyDeleteNormalizer } from './normalizers';
import { GroupTypes, Platform } from './platform';
import { Logger } from './../logger';
import { Message, MessageTypes } from './message';
import { WebClient } from '@slack/client';

let logger = new Logger('slack');

export class SlackMessage implements Message {

    static slackMessageTypeToMessageTypes = {
        'file_share': MessageTypes.FILE_SHARE
    };

    constructor(private _payload) {

    }

    get payload() {
        return this._payload;
    }    
    get ts() {
        return this._payload.ts;
    }

    get text() {
        return this._payload.text;
    }

    get type(): MessageTypes {
        let msgType = [this.payload.type, this.payload.subtype].join('|');
        return SlackMessage.slackMessageTypeToMessageTypes[msgType];
    }
}

export class Slack extends Platform {
    private client: WebClient;
    static prefixToGroupTypes = {
        D: GroupTypes.PERSONAL,
        U: GroupTypes.PERSONAL,
        G: GroupTypes.PRIVATE,
        C: GroupTypes.PUBLIC
    };

    static groupTypeToAPIMethod = {
        [GroupTypes.PERSONAL]: 'im',
        [GroupTypes.PRIVATE]: 'groups',
        [GroupTypes.PUBLIC]: 'channels'
    };

    constructor(private token: string) {
        super();
        logger.info('Using Slack Platform');
        this.client = new WebClient(token);
    }

    auth(): PromiseLike<any> {
        return q.resolve(this);
    }

    post(message: string, skipMention?: boolean, group?: string): PromiseLike<any> {
        let channel = group || this.defaultRecipient;
        return this.client.chat.postMessage(channel, message, {
            as_user: true
        })
            .then(response => {
                return new SlackMessage(response.message);
            })
            .catch(err => {
                logger.debug(err);
                return q.reject(err);
            });
    }

    uploadFile(
        absPath: string,
        comment?: string,
        receiver: string = this.defaultRecipient
    ) {
        let filename = path.basename(absPath);
        let file = fs.createReadStream(absPath);
        return this.client.files.upload(filename, {
            file: file,
            initial_comment: comment,
            channels: receiver
        });
    }
    
    getLastMessage(
        channel: string = this.defaultRecipient
    ): PromiseLike<SlackMessage> {
        let groupType = this.getGroupType(channel);
        let apiMethod = Slack.groupTypeToAPIMethod[groupType];
        return this.client[apiMethod].history(channel, {
            count: 1
        }).then(response => { 
            return new SlackMessage(response.messages[0]);
        }, err => {
            logger.error(err.stack);
        });
    }

    getGroupType(group: string) {
        let prefix = group.match(/^G|C|D|U/)[0];
        return Slack.prefixToGroupTypes[prefix];
    }

    protected createNormalizers() {
        let keyDel = createKeyDeleteNormalizer(
            'type',
            'user',
            'ts',
            'subtype'
        );
        let addKey = createAddKeyNormalizer({ attachments: [] });
        this.normalizers.push(keyDel, addKey);
    }    
}