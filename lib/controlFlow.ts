import * as q from 'q';
import { EventEmitter } from 'events';
import { Logger } from './logger';
let logger = new Logger('Control-Flow');
export class ControlFlow extends EventEmitter {
    private commandChain = q.when(undefined);
    private numTasks: number = 0;
    private _isIdle: boolean = false;
    constructor() {
        super();
     }
    
    execute(fn: () => PromiseLike<any> | any, text? : string): PromiseLike<any> {
        this.numTasks++;
        this._isIdle = false;
        return this.commandChain = this.commandChain
            .then(fn)
            .then((value) => { 
                if (--this.numTasks === 0) {
                    this.emit('idle');
                    this._isIdle = true;
                }
                return undefined;
            }, err => {
                logger.debug('FAILED: ERROR OCCURRED');
                if (typeof fail === 'function') {
                    fail(err);
                } else {
                    logger.error(err);
                }
                this.emit('idle');
                this._isIdle = true;
                return q.reject(err);
            });
    }

    promise = q.Promise;

    reset(): void {
        this.commandChain = q.resolve(undefined);
    }

    isIdle(): boolean {
        return this._isIdle;
    }
}

export let controlFlow: ControlFlow = new ControlFlow();

export function flowify(target: Object, pKey: string, descriptor: PropertyDescriptor) {
    descriptor = descriptor || Object.getOwnPropertyDescriptor(target, pKey);
    let originalMethod = descriptor.value;
    descriptor.value = function () {
        let args = Array.prototype.slice.call(arguments);
        return controlFlow.execute(originalMethod.bind(this, ...args));
    };
    return descriptor;
}