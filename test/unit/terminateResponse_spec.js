'use strict';

var expect         = require('chai').expect,
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse.terminateResponse', function () {

    it('should be a function', function () {
        var terminateResponse = implementation().terminateResponse;
        expect(terminateResponse, 'a valid function').to.be.a('function');
        expect(terminateResponse.length, 'has an arity of 1').to.equal(1);
    });

    it('sends client a terminated response', function () {

        var callCount         = 0,
            terminateResponse = implementation().terminateResponse;

        terminateResponse({
            writeHead: function () {
                callCount++;
                var args = [].slice.call(arguments);
                expect(
                    args,
                    'status code is 400'
                ).to.eql([400]);
            },
            end: function () {
                callCount++;
                var args = [].slice.call(arguments);
                expect(
                    args,
                    'body is correctly sent'
                ).to.eql(['client terminated request']);
            }
        });

        expect(
            callCount,
            'res.writeHead & res.end should be called once'
        ).to.equal(2);

    });

    it('does not send client a terminated response if finished', function () {

        var callCount         = 0,
            terminateResponse = implementation().terminateResponse;

        terminateResponse({
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
