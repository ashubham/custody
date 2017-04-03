import { Message, MessageTypes } from './message';
import { Logger } from './../logger';
import { WebClient } from '@slack/client';
import { createKeyDeleteNormalizer } from './normalizers';
import { Platform, GroupTypes } from './platform';
import * as q from 'q';
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

    constructor(token: string) {
        super(token);
        console.log('Using Slack Platform');
        this.client = new WebClient(token);
        this.createNormalizers();
    }

    post(message: string, skipMention?: boolean, group?: string) {
        let channel = group || this.defaultGroup;
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

    getLastMessage(
        channel: string = this.defaultGroup
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

    private createNormalizers() {
        let keyDel = createKeyDeleteNormalizer(
            'type',
            'user',
            'ts',
            'subtype'
        );
        this.normalizers.push(keyDel);
    }    
}