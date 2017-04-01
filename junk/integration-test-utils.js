var _ = require('lodash');
var Logger = require('log4js');
var Q = require('q');
var fs = require('fs');
var Slack = require('slack-node');
var path = require('path');
var equal = require('deep-equal');
var jsondiffpatch = require('jsondiffpatch');
var _logger = Logger.getLogger('integration-test');
_logger.setLevel('INFO');

let channel = process.env.privateChannelId;
let botId = process.env.botId;
let slack = new Slack(process.env.testerToken);
let overwriteGoldens = (process.env.overwriteGoldens || 'false') == 'true';
let RETRY_WAIT = 1000;
let WAIT_TIMEOUT = 30000;

function normalize(obj, customNormalization) {
    if (customNormalization) {
        customNormalization(obj);
    }
    // Remove bot_id.
    if (obj.bot_id) {
        delete obj.bot_id;
    }
    // Remove time stamp.
    if (obj.ts) {
        delete obj.ts;
    }
    if (obj.attachments) {
        let last = obj.attachments[obj.attachments.length - 1];
        if (last.ts) {
           delete last.ts;
        }
    }
    if (obj.file) {
        delete obj.file;
    }
    if (obj.username) {
        delete obj.username;
    }
    if (obj.user) {
        delete obj.user;
    }

    let stringified = JSON.stringify(obj);
    stringified = stringified.replace(new RegExp("<@.*>"), "<@UserId|UserName>");
    stringified = stringified.replace(new RegExp("<#.*>"), "<#ChannelId|ChannelName>");
    
    return JSON.parse(stringified);
}

function compareResponse(actual, golden, customNormalization) {
    actual = normalize(actual, customNormalization);
    var delta = jsondiffpatch.diff(actual, golden);
    if (delta) {
        return delta;
    }
    return null;
}

function waitForFileShare() {
    return wait(() => {
        return getLastMessageFromChannel().
            then((message) => {
                return message.subtype === 'file_share';
            });
    }, 'File Upload');
}

function waitForResponseToMatch(target, customNormalization, timeout) {
    var latestDelta = null;
    return wait(() => {
        return getLastMessageFromChannel()
            .then((message) => {
                latestDelta = compareResponse(
                    message, target, customNormalization
                );
                return !latestDelta || overwriteGoldens;
            });
    }, `Response match ${JSON.stringify(target)}`, timeout).then(null, (err) => {
        _logger.error(`FAILED\n`);
        if (latestDelta) {
            jsondiffpatch.console.log(latestDelta);
        }
        return Q.reject(err);
    });
}



function post(message) {
    let deferred = Q.defer();
    slack.api("chat.postMessage", {
        text: `<@${botId}> ${message}`,
        channel: channel,
        as_user: true
    }, function (error, response) {
        if (error) {
            _logger.error('chat.postMessage: ', error);
            process.exit(1);
        }
        deferred.resolve(response);
    });
    return deferred.promise;
}

function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t)
    });
}

function getLastMessageFromChannel() {
    let deferred = Q.defer();
    let apiName = channel.match(/^G/)
        ? 'groups.history' : 'channels.history';
    slack.api(apiName, {
        channel: channel,
        count: 1
    }, function (error, response) {
        if (error) {
            _logger.error(apiName, error);
            process.exit(1);
        }
        if (!response.ok) {
            _logger.error(apiName, response);
            process.exit(1);
        }
        let message = response.messages[0];
        //logger.info(JSON.stringify(message));
        deferred.resolve(message);
    });
    return deferred.promise;
}

function waitForMessageAfterTs(timestamp) {
    return wait(() => {
        return getLastMessageFromChannel().then(message => {
            return message.ts > timestamp;
        });
    }, 'Message after input');
}

function postAndWaitForResponse(message) {
    return post(message)
        .then((response) => {
            return waitForMessageAfterTs(response.ts);
        });
}

function wait(method, message, timeout) {
    message = message || '';
    timeout = timeout || WAIT_TIMEOUT;
    var deferred = Q.defer();
    let runCount = timeout / RETRY_WAIT;
    _logger.info(`Waiting for ${message}`);
    function run() {
        if (runCount-- < 0) {
            _logger.error(`Timed out after waiting for ${timeout}s: ${message}`);
            return deferred.reject();
        }
        let methodPromise = (typeof method === 'function')
            ? Promise.resolve().then(method)
            : method;
        
        methodPromise.then((resolution => {
            if (!!resolution) {
                return deferred.resolve(resolution);
            }
            setTimeout(run, RETRY_WAIT);
        }), err => {
            setTimeout(run, RETRY_WAIT);
        });
    }
    run();
    return deferred.promise;
} 

module.exports = {
    getLastMessageFromChannel,
    compareResponse,
    waitForResponseToMatch,
    waitForFileShare,
    post: postAndWaitForResponse,
};
