import * as fs from 'fs';
import { Logger } from './logger';

let logger = new Logger('task-results');

/**
 * Keeps track of a list of task results. Provides method to add a new
 * result, aggregate the results into a summary, count failures,
 * and save results into a JSON file.
 */
export class TaskResults {
    // TODO: set a type for result
    results_: any[] = [];

    add(result: any): void {
        this.results_.push(result);
    }

    totalSpecFailures(): number {
        return this.results_.reduce((specFailures, result) => {
            return specFailures + result.failedCount;
        }, 0);
    }

    saveResults(filepath: string): void {
        let jsonOutput = this.results_.reduce((jsonOutput, result) => {
            return jsonOutput.concat(result.specResults);
        }, []);

        let json = JSON.stringify(jsonOutput, null, '  ');
        fs.writeFileSync(filepath, json);
    }

    reportSummary(): void {
        let specFailures = this.totalSpecFailures();
        this.results_.forEach((result: any) => {
            let shortName = [
                result.platformName,
                result.tasId
            ].join('#');

            if (result.failedCount) {
                logger.info(shortName + ' failed ' + result.failedCount + ' test(s)');
            } else if (result.exitCode !== 0) {
                logger.info(shortName + ' failed with exit code: ' + result.exitCode);
            } else {
                logger.info(shortName + ' passed');
            }
        });

        if (specFailures) {
            logger.info(
                'overall: ' + specFailures + ' failed spec(s)'
            );
        }
    }
}