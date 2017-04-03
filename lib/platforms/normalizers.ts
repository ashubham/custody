import * as _ from 'lodash';
export function createKeyDeleteNormalizer(...keys) {
    return function (inputObj) {
        return _.omit(inputObj, keys);
    }
}