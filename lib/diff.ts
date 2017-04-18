import * as jsondiffpatch from 'jsondiffpatch';

let diff = jsondiffpatch.create();

let stringMatchFilter: any = function (context) {
    let str, regex;
    if (context.left instanceof RegExp && typeof context.right === 'string') {
        str = context.right;
        regex = context.left;
    } else if (context.right instanceof RegExp && typeof context.left === 'string') {
        str = context.left;
        regex = context.right;
    }
    if (str && regex) {
        return [0, !!str.match(regex), true];
    }
};

stringMatchFilter.filterName = 'stringMatchFilter';
diff.processor.pipes.diff.before('texts', stringMatchFilter);

export default diff;