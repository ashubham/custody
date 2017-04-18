import { Config } from './config';
import { ConfigParser } from './configParser';

export class Task {
    public specs: string[];
    public taskId: number = null;

    constructor(private config: Config) {
        let excludes = ConfigParser.resolveFilePatterns(config.exclude, true, config.configDir);
        this.specs =
            ConfigParser.resolveFilePatterns(ConfigParser.getSpecs(config), false, config.configDir)
                .filter((path: string) => {
                    return excludes.indexOf(path) < 0;
                });
    }
}