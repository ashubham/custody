import {Slack} from '../../lib/platforms/slack';
import * as slackClient from '@slack/client';
import * as sinon from 'sinon';
import {expect } from 'chai';

describe('Slack platform', () => {
    describe('Contstructor', () => {
        it('contructor should create a new slack webClient', () => {
            let stub = sinon.stub(slackClient, 'WebClient');
            let slack = new Slack('abc');
            expect(stub.calledWith('abc')).to.be.true;
            stub.restore();
        });
    });

    describe('Methods', () => {
        let webClient = {
            chat: {
                postMessage: sinon.stub().resolves({
                    message: {}
                })
            },
            files: {
                upload: sinon.stub().resolves({})
            }
        }, slack, webClientStub;
        beforeEach(() => {
            webClientStub = sinon.stub(slackClient, 'WebClient').callsFake(function() {
                Object.assign(this, webClient);
            });
            slack = new Slack('abc');
            slack.defaultRecipient = 'u1';
        });

        afterEach(() => {
            webClientStub.restore();
        });

        it('post method should postmessage to slack', () => {
            slack.post('Test');
            sinon.assert.calledWith(webClient.chat.postMessage,
                'u1', 'Test', {as_user: true}
            );

            slack.post('Test', false, 'u2');
            sinon.assert.calledWith(webClient.chat.postMessage, 
                'u2', 'Test', {as_user: true}
            );
        });

        it('uploadfiles method should upload file', () => {
            slack.uploadFile(__dirname + '/slack.tests.ts');
            sinon.assert.calledWith(webClient.files.upload,
                'slack.tests.ts'
            );
        });
    });
});
