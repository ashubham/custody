let options = require('./lib/options');

let defaults = {
    platform: options.Platforms.SLACK,
    slackOpts: {
        token: null,
        botId: null
    }
}

module.exports = function(opts) {
    process.env.opts = Object.assign({}, defaults, opts);
}
