'use strict';

/* istanbul ignore next  */
var noop  = function () {},
    /* istanbul ignore next  */
    debug = process.env.DEBUG &&
    /* istanbul ignore next  */
                ~process.env.DEBUG.indexOf('http-collapse') ?
    /* istanbul ignore next  */
                    process.stdout.write.bind(process.stdout) : noop;

module.exports =
    require('./http-collapse_implementation')(debug);
