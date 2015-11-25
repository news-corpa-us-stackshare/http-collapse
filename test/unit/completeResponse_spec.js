'use strict';

var expect         = require('chai').expect,
    noop           = function () {},
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse.completeResponse', function () {

    it('should be a function', function () {
        var completeResponse = implementation().completeResponse;
        expect(completeResponse, 'a valid function').to.be.a('function');
        expect(completeResponse.length, 'has an arity of 2').to.equal(2);
    });

    it('does not send client response if already finished', function () {

        var callCount        = 0,
            completeResponse = implementation().completeResponse,
            res = {
                finished : true,
                writeHead: function () {
                    throw new Error('res.writeHead() should not be called');
                },
                write: function () {
                    throw new Error('res.write() should not be called');
                },
                end: function () {
                    throw new Error('res.end() should not be called');
                }
            };

        completeResponse(res, { writeHead: [] });

        expect(
            callCount,
            'res.writeHead(), res.write() & res.end() should not be called'
        ).to.equal(0);

    });

    describe('res.writeHead', function () {

        it('called x times if headers to write', function () {

            var callCount        = 0,
                completeResponse = implementation().completeResponse,
                res = {
                    writeHead: function () {
                        callCount++;
                        expect(
                            arguments[0],
                            'correct writeHead arguments supplied'
                        ).to.eql(200);
                    },
                    write: noop,
                    end  : noop
                };

            completeResponse(res, {
                writeHead: [[200], [200]],
                write    : [],
                end      : []
            });

            expect(callCount, 'res.writeHead()').to.equal(2);

        });

        it('not called if no headers to write', function () {

            var callCount        = 0,
                completeResponse = implementation().completeResponse,
                res = {
                    writeHead: function () {
                        throw new Error('res.writeHead should not be called');
                    },
                    write: noop,
                    end  : noop
                };

            completeResponse(res, {
                writeHead: [],
                write    : [],
                end      : []
            });

            expect(callCount, 'res.writeHead()').to.equal(0);

        });

    });

    describe('res.write', function () {

        it('called x times if body to write', function () {

            var callCount        = 0,
                completeResponse = implementation().completeResponse,
                res = {
                    writeHead: noop,
                    write: function () {
                        callCount++;
                        expect(
                            arguments[0],
                            'correct writeHead arguments supplied'
                        ).to.eql('foo');
                    },
                    end  : noop
                };

            completeResponse(res, {
                writeHead: [],
                write    : [['foo'], ['foo']],
                end      : []
            });

            expect(callCount, 'res.write()').to.equal(2);

        });

        it('not called if no body to write', function () {

            var callCount        = 0,
                completeResponse = implementation().completeResponse,
                res = {
                    writeHead: noop,
                    write: function () {
                        throw new Error('res.write should not be called');
                    },
                    end  : noop
                };

            completeResponse(res, {
                writeHead: [],
                write    : [],
                end      : []
            });

            expect(callCount, 'res.write()').to.equal(0);

        });

    });

    describe('res.end', function () {

        it('called x times if ending', function () {

            var callCount        = 0,
                completeResponse = implementation().completeResponse,
                res = {
                    writeHead: noop,
                    write    : noop,
                    end: function () {
                        callCount++;
                        expect(
                            arguments[0],
                            'correct end arguments supplied'
                        ).to.eql('foo');
                    }
                };

            completeResponse(res, {
                writeHead: [],
                write    : [],
                end      : [['foo'], ['foo']]
            });

            expect(callCount, 'res.end()').to.equal(2);

        });

        it('not called if no body to write', function () {

            var callCount        = 0,
                completeResponse = implementation().completeResponse,
                res = {
                    writeHead : noop,
                    write     : noop,
                    end       : function () {
                        throw new Error('res.end should not be called');
                    }
                };

            completeResponse(res, {
                writeHead: [],
                write    : [],
                end      : []
            });

            expect(callCount, 'res.end()').to.equal(0);

        });

    });

});
