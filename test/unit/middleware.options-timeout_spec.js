'use strict';

var expect = require('chai').expect,
    noop   = function() {},
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse => middleware', function () {

    describe('options.timeout', function () {

        it('when set calls res.setTimeout', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse({ timeout: 5e6 }),
                callCount    = 0,
                res = {
                    once: noop,
                    setTimeout: function (timeout, fn) {

                        expect(
                            timeout,
                            'timeout correctly set to 5e6'
                        ).to.equal(5e6);

                        expect(
                            fn,
                            'correctly binds function'
                        ).to.be.a('function');

                        callCount++;

                    }
                };

            middleware({ once: noop }, res, function () {
                expect(
                    callCount,
                    'res.setTimeout called once'
                ).to.equal(1);
            });

        });

        it('res.setTimeout handler calls self.timeoutResponse', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse({ timeout: 5e6 }),
                callCount    = 0,
                res = function () {

                    var events = {};

                    return {
                        once: noop,
                        setTimeout: function (timeout, fn) {
                            events.timeout = events.timeout || [];
                            events.timeout.push(fn);
                        },
                        emit: function (event) {
                            var handlers = events[event];
                            handlers.forEach(function (fn) {
                                fn();
                            });
                        }
                    };

                }();

            httpCollapse.timeoutResponse = function () {
                callCount++;
            };

            middleware({ url: '/foo', once: noop }, res, function () {
                res.emit('timeout');
                expect(
                    callCount,
                    'self.timeoutResponse called once'
                ).to.equal(1);
                expect(
                    middleware.requests['/foo'].socketTimeout,
                    'flags request as timeout'
                ).to.equal(true);
            });

        });

        it('does not call res.setTimeout if not set', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                callCount    = 0,
                res = function () {

                    var events = {};

                    return {
                        once: noop,
                        setTimeout: function () {
                            throw new Error('res.setTimeout should not be called');
                        },
                        emit: function (event) {
                            var handlers = events[event] || [];
                            handlers.forEach(function (fn) {
                                fn();
                            });
                        }
                    };

                }();

            httpCollapse.timeoutResponse = function () {
                callCount++;
            };

            middleware({ url: '/foo', once: noop }, res, function () {
                res.emit('close');
                expect(
                    callCount,
                    'self.timeoutResponse not called'
                ).to.equal(0);
                expect(
                    middleware.requests['/foo'].socketTimeout,
                    'does not flag request as timeout'
                ).to.be.an('undefined');
            });

        });

    });

});
