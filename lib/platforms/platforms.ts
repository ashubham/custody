import { SupportedPlatforms, Config } from '../config';
import { Platform } from './platform';
import { Logger } from './../logger';
import { Slack } from './slack';
import { Messenger } from './messenger';

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