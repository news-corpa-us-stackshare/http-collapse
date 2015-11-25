'use strict';

var collapse = require('../lib/http-collapse'),
    http     = require('http'),
    timeout  = 0,

    respond = function (req, res) {

        if (req.url.indexOf('collapse') === -1) {
            process.stdout.write('x');
        }

        timeout = timeout >= 6000 ? 1000 : timeout;

        setTimeout(function(res) {
            res.writeHead(200);
            res.end('Hello World');
            process.stdout.write('.');
        }.bind(null, res), timeout);

        timeout += 1000;

    },

    middleware = {
        collapse        : collapse(),
        collapseTimeout : collapse({ timeout: 5e3 })
    };

http.createServer(function (req, res) {

    res.locals = {};

    var next = respond.bind(this, req, res);

    if (req.url === '/favicon.ico') { return res.end(); }

    if (req.url === '/collapse/timeout') {
        middleware.collapseTimeout(req, res, next);
    } else if (req.url === '/collapse') {
        middleware.collapse(req, res, next);
    } else {
        next();
    }

}).listen(3000, function () {
    console.log('Server running at http://0.0.0.0:3000');
});
