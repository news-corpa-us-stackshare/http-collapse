'use strict';

var expect         = require('chai').expect,
    implementation = require('../../lib/http-collapse_implementation');

describe('http-collapse', function () {

    it('should be a function', function () {
        var httpCollapse = implementation();
        expect(httpCollapse, 'a valid function').to.be.a('function');
        expect(httpCollapse.length, 'has an arity of 1').to.equal(1);
    });

    it('return a valid middleware', function () {
        var httpCollapse = implementation(),
            middleware   = httpCollapse();

        expect(middleware, 'a valid function').to.be.a('function');
        expect(middleware.length, 'has an arity of 3').to.equal(3);
        expect(middleware.requests, 'a valid object').to.be.an('object');
    });

});
