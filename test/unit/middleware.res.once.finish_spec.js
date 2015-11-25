'use strict';

var expect = require('chai').expect,
    noop   = function() {},
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse => middleware', function () {

    describe('req.once("finish", fn)', function () {

        it('is called once for initial request request', function () {
            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                callCount    = 0,
                res = {
                    once: function (event, fn) {
                        callCount++;
                        expect(
                            event,
                            'event correctly set to "finish"'
                        ).to.equal('finish');
                        expect(
                            fn,
                            'correctly binds function'
                        ).to.be.a('function');
                    }
                };

            middleware({ url: '/foo', once: noop }, res, noop);
            middleware({ url: '/foo', once: noop }, res, noop);

            expect(
                callCount,
                'req.once called once'
            ).to.equal(1);

        });

        it('bound handler clears request cache when called', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                res = function () {

                    var events = {};

                    return {
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

            middleware({ url: '/foo', once: noop }, res, function () {
                res.emit('finish');
                expect(
                    middleware.requests['/foo'],
                    'open requests cache cleared'
                ).to.be.an('undefined');
            });

        });

        it('bound handler call self.processQueue', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                callCount    = 0,
                res = function () {

                    var events = {};

                    return {
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

            httpCollapse.processQueue = function () {
                callCount++;
            };

            middleware({ url: '/foo', once: noop }, res, function () {
                res.emit('finish');
                expect(
                    callCount,
                    'self.processQueue called once'
                ).to.equal(1);
            });

        });

        it('self.processQueue calls self.terminateResponse if terminated', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                callCount    = 0,
                res = function () {

                    var events = {};

                    return {
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

            middleware({ url: '/foo', once: noop }, res, function () {

                middleware.requests['/foo'] = {
                    responses        : [{}],
                    clientTerminated : true
                };

                res.emit('finish');
                expect(
                    callCount,
                    'self.terminateResponse called once'
                ).to.equal(1);

            });

        });

        it('self.processQueue calls self.timeoutResponse if timeout', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                callCount    = 0,
                res = function () {

                    var events = {};

                    return {
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

            httpCollapse.timeoutResponse = function () {
                callCount++;
            };

            middleware({ url: '/foo', once: noop }, res, function () {

                middleware.requests['/foo'] = {
                    responses     : [{}],
                    socketTimeout : true
                };

                res.emit('finish');
                expect(
                    callCount,
                    'self.timeoutResponse called once'
                ).to.equal(1);

            });

        });

        it('self.processQueue calls self.completeResponse if valid', function () {

            var httpCollapse = implementation(noop),
                middleware   = httpCollapse(),
                callCount    = 0,
                res = function () {

                    var events = {};

                    return {
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

            httpCollapse.completeResponse = function () {
                callCount++;
            };

            middleware({ url: '/foo', once: noop }, res, function () {

                middleware.requests['/foo'] = {
                    responses: [{}]
                };

                res.emit('finish');
                expect(
                    callCount,
                    'self.completeResponse called once'
                ).to.equal(1);

            });

        });

    });

});
