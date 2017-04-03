import { SupportedPlatforms } from '../config';
import { Platform } from './platform';
import { Logger } from './../logger';
import { Slack } from './slack';
import { Messenger } from './messenger';

let logger = new Logger('getPlatform');

const platformToPlatformClass = {
    [SupportedPlatforms.MESSENGER]: Messenger,
    [SupportedPlatforms.SLACK]: Slack
};

export function getPlatform(platformName: SupportedPlatforms) : typeof Platform {
    let PlatformConstructor = platformToPlatformClass[platformName];
    if (PlatformConstructor) {
        return PlatformConstructor;
    } else {
        logger.error("Unsupported Platform", platformName);
    }
    return null;
}