'use strict';

var expect = require('chai').expect,
    noop   = function() {},
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse => middleware', function () {

    it('calls next if there are no open requests', function (done) {

        var httpCollapse = implementation(noop),
            middleware   = httpCollapse();

        middleware(
            { once: noop }, // req
            { once: noop }, // res
            done
        );

    });

    it('does not call next if there are open requests', function () {

        var httpCollapse = implementation(noop),
            middleware   = httpCollapse(),
            callCount    = 0;

        middleware({ url: '/foo', once: noop }, { once: noop }, function () {
            callCount++;
        });

        middleware({ url: '/foo', once: noop }, { once: noop }, function () {
            throw new Error('next should not have been called');
        });

        expect(callCount, 'next called once').to.equal(1);

    });

    it('queues open requests', function () {

        var httpCollapse = implementation(noop),
            middleware   = httpCollapse(),
            callCount    = 0;

        middleware({ url: '/foo', once: noop }, { once: noop }, function () {
            callCount++;
        });

        middleware({ url: '/foo', once: noop }, { once: noop }, function () {
            throw new Error('next should not have been called');
        });

        middleware({ url: '/foo', once: noop }, { once: noop }, function () {
            throw new Error('next should not have been called');
        });

        expect(callCount, 'next called once').to.equal(1);

        expect(
            middleware.requests['/foo'],
            'creates a request queue object'
        ).to.be.an('object');

        expect(
            Object.keys(middleware.requests['/foo']),
            'queued request object has properties, writeHead, write, end & queue'
        ).to.eql(['writeHead', 'write', 'end', 'responses']);

        expect(
            middleware.requests['/foo'].responses.length,
            'caches 2 open requests'
        ).to.equal(2);

    });

    describe('self.patchResponse', function () {

        it('called for res.( writeHead, write, end )', function (done) {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                results      = [];

            httpCollapse.patchResponse = function (method) {
                results.push(method);
            };

            middleware(
                { url: '/foo', once: noop },
                { once: noop }
            , function () {

                var methods = ['writeHead', 'write', 'end'];

                expect(
                    results,
                    'writeHead, write, end overridden'
                ).to.eql(methods);

                done();

            });

        });

    });

});
