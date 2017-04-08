import * as fs from 'fs';
import * as optimist from 'optimist';
import * as path from 'path';

/**
 * The command line interface for interacting with the Custody runner.
 * It takes care of parsing command line options.
 *
 * Values from command line options override values from the config.
 */

let args: Array<string> = [];

process.argv.slice(2).forEach(function (arg: string) {
    let flag: string = arg.split('=')[0];
    args.push(arg);
});


let allowedNames = [
    'platform',
    'token',
    'email',
    'password',
    'defaultRecipient',
    'botId',
    'specs',
    'exclude',
    'suites',
    'suite',
    'jasmineNodeOpts',
    'mochaOpts'
];

let optimistOptions: any = {
    describes: {
        help: 'Print Custody help menu',
        version: 'Print Custody version',
        platform: 'Platform, e.g. slack or messenger',
        token: 'API token',
        email: 'User email to send messages as (Messenger only)',
        password: 'User password of the email provided (Messenger only).' +
        ' PS: Messenger does not provide token based user messages yet.',
        defaultRecipient: 'The default channel/group/user where the test messages would' +
        ' be posted.',
        botId: 'The identification for the bot to be tested (for mentions etc.)',
        specs: 'Comma-separated list of files to test',
        exclude: 'Comma-separated list of files to exclude',
        verbose: 'Print full spec names',
        stackTrace: 'Print stack trace on error',
        params: 'Param object to be passed to the tests',
        framework: 'Test framework to use: jasmine, mocha, or custom',
        resultJsonOutputFile: 'Path to save JSON test result',
    },
    aliases: {
        grep: 'jasmineNodeOpts.grep',
        'invert-grep': 'jasmineNodeOpts.invertGrep'
    }
};

optimist.usage(
    'Usage: custody [configFile] [options]\n' +
    'configFile defaults to custody.conf.js\n' +
    'The [options] object will override values from the config file.\n' +
    'See the reference config for a full list of options.');
for (let key of Object.keys(optimistOptions.describes)) {
    optimist.describe(key, optimistOptions.describes[key]);
}
for (let key of Object.keys(optimistOptions.aliases)) {
    optimist.alias(key, optimistOptions.aliases[key]);
}
optimist.check(function (arg: any) {
    if (arg._.length > 1) {
        throw new Error('Error: more than one config file specified');
    }
});

let argv: any = optimist.parse(args);

if (argv.help) {
    optimist.showHelp();
    process.exit(0);
}

if (argv.version) {
    console.log('Version ' + require(path.resolve(__dirname, '../package.json')).version);
    process.exit(0);
}

// Check to see if additional flags were used.
argv.unknownFlags_ = Object.keys(argv).filter((element: string) => {
    return element !== '$0' && element !== '_' && allowedNames.indexOf(element) === -1;
});

/**
 * Helper to resolve comma separated lists of file pattern strings relative to
 * the cwd.
 *
 * @private
 * @param {Array} list
 */
function processFilePatterns_(list: string): Array<string> {
    return list.split(',').map(function (spec) {
        return path.resolve(process.cwd(), spec);
    });
}

if (argv.specs) {
    argv.specs = processFilePatterns_(<string>argv.specs);
}
if (argv.exclude) {
    argv.exclude = processFilePatterns_(<string>argv.exclude);
}

// Use default configuration, if it exists.
let configFile: string = argv._[0];
if (!configFile) {
    if (fs.existsSync('./custody.conf.js')) {
        configFile = './custody.conf.js';
    }
}

if (!configFile && !argv.elementExplorer && args.length < 3) {
    console.log(
        '**you must either specify a configuration file ' +
        'or at least the required options. See below for the options:\n');
    optimist.showHelp();
    process.exit(1);
}

// Run the launcher
import * as launcher from './launcher';
launcher.init(configFile, argv);
