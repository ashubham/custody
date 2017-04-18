import  { expect } from 'chai';
import { ControlFlow } from '../lib/controlFlow';

describe('Control flow', function () {
    it('constructor', () => {
        let cf = new ControlFlow();
        expect(cf instanceof ControlFlow).to.be.true;
    });
});