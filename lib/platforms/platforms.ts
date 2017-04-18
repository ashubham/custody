import { Config, SupportedPlatforms } from '../config';
import { Logger } from './../logger';
import { Messenger } from './messenger';
import { Platform } from './platform';
import { Slack } from './slack';

let logger = new Logger('getPlatform');

interface PlatformClass {
    ctor: typeof Platform;
    args: string[];
}

const platformToPlatformClass: { [key: number]: PlatformClass } = {
    [SupportedPlatforms.MESSENGER]: {
        ctor: Messenger,
        args: ['email', 'password']
    },
    [SupportedPlatforms.SLACK]: {
        ctor: Slack,
        args: ['token']
    }
};

export function getPlatform(config: Config): Platform {
    let platformName = config.platform;
    let platform = platformToPlatformClass[platformName];
    if (platform) {
        let args = platform.args.map(arg => config[arg]);
        return new platform.ctor(...args);
    } else {
        logger.error("Unsupported Platform", platformName);
    }
    return null;
}