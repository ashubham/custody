import * as _ from 'lodash';
export function createKeyDeleteNormalizer(...keys) {
    return function (inputObj) {
        return _.omit(inputObj, keys);
    }
}

export function createRenameKeyNormalizer(renameMap: { [key: string]: string }) {
    return function (inputObj) {
        return _.mapKeys(inputObj, (value, key) => {
            return renameMap[key] || key;
        });
    }
}

export function createDeleteNullUndefinedNormalizer() {
    return function (inputObj) {
        let copy = Object.assign({}, inputObj);
        _.each(inputObj, (v, k) => {
            if (v === undefined || v === null) {
                delete copy[k];
            }
        });
        return copy;
    };
}

export function createAddKeyNormalizer(addKeyMap: { [key: string]: any }) {
    return function (inputObj) {
        return Object.assign({}, addKeyMap, inputObj);
    };
}