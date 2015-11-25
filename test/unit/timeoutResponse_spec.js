'use strict';

var expect         = require('chai').expect,
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse.timeoutResponse', function () {

    it('should be a function', function () {
        var timeoutResponse = implementation().timeoutResponse;
        expect(timeoutResponse, 'a valid function').to.be.a('function');
        expect(timeoutResponse.length, 'has an arity of 1').to.equal(1);
    });

    it('sends client a timeout response', function () {

        var callCount       = 0,
            timeoutResponse = implementation().timeoutResponse;

        timeoutResponse({
            writeHead: function () {
                callCount++;
                var args = [].slice.call(arguments);
                expect(
                    args,
                    'status code is 503'
                ).to.eql([503]);
            },
            end: function () {
                callCount++;
                var args = [].slice.call(arguments);
                expect(
                    args,
                    'body is correctly sent'
                ).to.eql(['request timeout']);
            }
        });

        expect(
            callCount,
            'res.writeHead & res.end should be called once'
        ).to.equal(2);

    });

    it('does not send client a timeout response if finished', function () {

        var callCount       = 0,
            timeoutResponse = implementation().timeoutResponse;

        timeoutResponse({
            finished : true,
            writeHead: function () {
                throw new Error('res.writeHead() should not be called');
            },
            end: function () {
                throw new Error('res.end() should not be called');
            }
        });

        expect(
            callCount,
            'res.writeHead() & res.end() should not be called'
        ).to.equal(0);

    });

});
