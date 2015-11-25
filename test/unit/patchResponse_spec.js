'use strict';

var expect = require('chai').expect,
    noop   = function() {},
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse.patchResponse', function () {

    it('should be a function', function () {
        var patchResponse = implementation().patchResponse;
        expect(patchResponse, 'a valid function').to.be.a('function');
        expect(patchResponse.length, 'has an arity of 2').to.equal(3);
    });

    it('returns a function', function () {
        var patchResponse = implementation().patchResponse,
            result        = patchResponse('foo', {}, {});
        expect(result, 'a valid function').to.be.a('function');
        expect(result.length, 'has an arity of 0').to.equal(0);
    });

    it('patches a method', function (done) {
        var patchResponse = implementation().patchResponse,
            res           = {
                end: function () {
                    done();
                }
            };
        res.end = patchResponse('end', res, { end: [] });
        res.end();
    });

    it('patched method caches called arguments', function (done) {
        var patchResponse = implementation().patchResponse,
            cache         = { end: [] },
            res           = {
                end: function () {
                    expect(
                        [].slice.call(cache.end[0])
                    ).to.eql([1, 2, 3, 4, 5]);
                    done();
                }
            };
        res.end = patchResponse('end', res, cache);
        res.end(1, 2, 3, 4, 5);
    });

    describe('patched method', function () {
        it('throws error if cannot set cache', function () {
            var patchResponse = implementation().patchResponse,
                res           = {};

            res.end = patchResponse('end', { end : noop }, {});

            expect(
                res.end.bind(null, 1, 2, 3, 4, 5),
                'error thrown for non-cacheable arguments'
            ).to.throw();

        });
        it('throws error if cannot call original method', function () {
            var patchResponse = implementation().patchResponse,
                res           = {};

            res.end = patchResponse('end', {}, { cache: [] });

            expect(
                res.end.bind(null, 1, 2, 3, 4, 5),
                'error thrown for missing original method'
            ).to.throw();

        });
    });

});
