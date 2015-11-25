'use strict';

var expect         = require('chai').expect,
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse.processQueue', function () {

    it('should be a function', function () {
        var processQueue = implementation().processQueue;
        expect(processQueue, 'a valid function').to.be.a('function');
        expect(processQueue.length, 'has an arity of 2').to.equal(2);
    });

    it('process a queue of open requests and callback', function () {

        var callCount    = 0,
            processQueue = implementation().processQueue,
            res = {
                end: function () {
                    callCount++;
                }
            },
            openRequests = {
                '/foo': {
                    queue: [res, res]
                }
            };

        processQueue(openRequests['/foo'].queue, function (res) {
            res.end();
        });

        expect(
            callCount,
            'res.end called twice each'
        ).to.equal(2);

    });

});
