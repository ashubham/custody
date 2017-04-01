var util = require('./integration-test-utils');
var Q = require('q');

var commands = Q.resolve();

function postMessage(message) {
    let userId = process.env.alternateUserId || undefined;
    if (message.includes('@user')) {
        if (!userId) {
            console.error(`Workflow: ${JSON.stringify(workflow)} includes '@user'  in text` +
                ` you need to start the process with environment variable <alternateUserId> set`);
            process.exit(1);
        }
        message = message.replace('@user', `<@${userId}|user-name>`);
    }
    let channelId = process.env.alternateChannelId || undefined;
    if (message.includes('#channel')) {
        if (!channelId) {
            console.error(`Workflow: ${JSON.stringify(workflow)} includes '#channel'  in text` +
                ` you need to start the process with environment variable <alternateChannelId> set`);
            process.exit(1);
        }
        message = message.replace('#channel', `<#${channelId}|channel-name>`);
    }
    let pvtChannelId = process.env.privateChannelId || undefined;
    if (message.includes('#self-channel')) {
        if (!pvtChannelId) {
            console.error(`Workflow: includes '#self-channel'  in text` +
                ` you need to start the process with environment variable <privateChannelId> set`);
            process.exit(1);
        }
        message = message.replace('#self-channel', `<#${pvtChannelId}|channel-name>`);
    }
    return commands = commands.then(util.post.bind(null, message));
}

function waitForImage() {
    return commands = commands.then(util.waitForFileShare);
}

function sleep() {

}

function waitForResponseToMatch(target, normalizer, timeout) {
    return commands = commands.then(() => {
        return util.waitForResponseToMatch(
            target,
            normalizer,
            timeout
        )
    });
}

function getLastMessage() {
    return commands = commands.then(util.getLastMessageFromChannel);
}

module.exports = {
    postMessage,
    waitForImage,
    sleep,
    waitForResponseToMatch,
    getLastMessage
}