import {init} from '../lib/launcher';
import  { expect } from 'chai';

describe('launcher', () => {
    it('The init exposed should be a function', () => {
        expect(typeof init).to.equal('function');
    });
});