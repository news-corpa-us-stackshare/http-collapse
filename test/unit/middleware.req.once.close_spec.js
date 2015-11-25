'use strict';

var expect = require('chai').expect,
    noop   = function() {},
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse => middleware', function () {

    describe('req.once("close", fn)', function () {

        it('is called per request', function () {
            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                callCount    = 0,
                req = {
                    url: '/foo',
                    once: function (event, fn) {
                        callCount++;
                        expect(
                            event,
                            'event correctly set to "close"'
                        ).to.equal('close');
                        expect(
                            fn,
                            'correctly binds function'
                        ).to.be.a('function');
                    }
                };

            middleware(req, { once: noop }, noop);
            req.url = '/bar';
            middleware(req, { once: noop }, noop);

            expect(
                callCount,
                'req.once called twice'
            ).to.equal(2);

        });

        it('bound handler calls self.terminateResponse', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                callCount    = 0,
                req = function () {

                    var events = {};

                    return {
                        url : '/foo',
                        once: function (event, fn) {
                            events[event] = events[event] || [];
                            events[event].push(fn);
                        },
                        emit: function (event) {
                            var handlers = events[event];
                            handlers.forEach(function (fn) {
                                fn();
                            });
                        }
                    };

                }();

            httpCollapse.terminateResponse = function () {
                callCount++;
            };

            middleware(req, { once: noop }, function () {
                req.emit('close');
                expect(
                    callCount,
                    'self.terminateResponse called once'
                ).to.equal(1);
                expect(
                    middleware.requests['/foo'].clientTerminated,
                    'flags request as terminated'
                ).to.equal(true);
            });

        });

    });

});
