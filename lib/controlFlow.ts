import * as Q from 'q';

export class ControlFlow {
    private commandChain = Q.resolve(null);
    constructor() { }
    
    execute(fn: () => PromiseLike<any> | any, text? : string): PromiseLike<any> {
        return this.commandChain = this.commandChain.then(fn);
    }

    promise = Q.Promise;

    reset(): void {
        this.commandChain = Q.resolve(null);
    }
}

export let controlFlow: ControlFlow = new ControlFlow();