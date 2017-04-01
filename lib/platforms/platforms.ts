import { Platform } from './platform';
import { Logger } from './../logger';
import { Slack } from './slack';
import { Messenger } from './messenger';

let logger = new Logger('getPlatform');
export const supportedPlatforms = {
    SLACK: 'slack',
    MESSENGER: 'messenger'
};

const platformNameToPlatform = {
    [supportedPlatforms.MESSENGER]: Messenger,
    [supportedPlatforms.SLACK]: Slack
};

export function getPlatform(platformName: string) : Platform {
    let PlatformConstructor = platformNameToPlatform[platformName];
    if (PlatformConstructor) {
        return new PlatformConstructor();
    } else {
        logger.error("Unsupported Platform", platformName);
    }
    return null;
}