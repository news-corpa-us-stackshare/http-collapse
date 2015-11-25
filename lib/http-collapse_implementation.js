'use strict';

/**
 * @function implementation
 * Factory for creating a the http-collapse middleware helper
 *
 * @returns {Function}
 */

module.exports = function implementation(debug) {

    var self = function (options) {

        options = options || {};

        var openRequests = {},

            /**
             * @ngdoc function
             * @name httpCollapse
             *
             * @description
             * Collapses in-bound requests reducing how many of them are processed
             * thus, deferring until the initial request finish, closes or timesout.
             *
             * @param {http.ClientRequest}      req   Incoming HTTP request
             * @param {http.ServerResponse}     res   Outgoing HTTP response
             * @param {Function}                next  Callback to execute
             *
             */

            collapse = function httpCollapse(req, res, next) {

                var url = req.url;

                // Queue requests which have the same url. These will be responded
                // to once the initial request is complete

                if (openRequests[url]) {
                    return openRequests[url].responses.push(res);
                }

                debug('x');

                openRequests[url] = {
                    writeHead : [], // caches res.writeHead arguments
                    write     : [], // caches res.write arguments
                    end       : [], // caches res.end arguments
                    responses : []  // caches queued http.ServerResponse
                };

                // we need to override the original http.ServerResponse methods
                // below since there is no nice way to get access to the response
                // body upon completion of a request
                //
                // This also permits granular control over how the queued requests
                // are responded

                res.writeHead = self.patchResponse('writeHead', res, openRequests[url]);
                res.write     = self.patchResponse('write',     res, openRequests[url]);
                res.end       = self.patchResponse('end',       res, openRequests[url]);

                // override node's default socketTimeout of 2 minutes, when
                // a timeout is specified

                if (options.timeout) {
                    res.setTimeout(options.timeout, function () {
                        openRequests[url].socketTimeout = true;
                        self.timeoutResponse(res);
                    });
                }

                // clients can sometimes terminate the connection, but this can
                // leave queued requests yet to be responded to. Upon client
                // termination the "close" event is fired, this then permits queued
                // requests to also be terminated

                req.once('close', function () {
                    openRequests[url].clientTerminated = true;
                    self.terminateResponse(res);
                });

                res.once('finish', function () {

                    var cache = openRequests[url];
                    delete openRequests[url];

                    self.processQueue(cache.responses, function (res) {
                        debug('.');
                        if (cache.clientTerminated) { return self.terminateResponse(res); }
                        if (cache.socketTimeout)    { return self.timeoutResponse(res); }
                        self.completeResponse(res, cache);
                    });

                });

                next();

            };

        collapse.requests = openRequests;

        return collapse;

    };

    /**
     * @ngdoc function
     * @name httpCollapse
     *
     * @description
     * Collapses in-bound requests reducing how many of them are processed
     * thus, deferring until the initial request finish, closes or timesout.
     *
     * @param {String}                method  The name of the method to patch
     * @param {http.ServerResponse}   res     Outgoing HTTP response
     * @param {Object}                cache   A cache for captured arguments
     *
     * @returns {Function}            The overriden method
     *
     */

    self.patchResponse = function (method, res, cache) {
        var original = res[method];
        return function () {
            cache[method].push(arguments);
            return original.apply(res, arguments);
        };
    };

    /**
     * @ngdoc function
     * @name processQueue
     *
     * @description
     * Process a queue of open requests, applying supplied iterator callback.
     * Finally clean up the openRequest queue and clear any timer
     *
     * @param {Array}     queue             open requests
     * @param {Function}  callback          callback to invokes
     *
     */

    self.processQueue = function (queue, callback) {
        if (!queue || !queue.length) { return; }
        while (queue.length) {
            callback(queue.shift());
        }
    };

    /**
     * @ngdoc function
     * @name completeResponse
     *
     * @description
     * Called upon completion of the initial request. Each set of collated method
     * caches is applied to the outgoing response's equivalent methods
     *
     * @param {http.ServerResponse}   res     Outgoing HTTP response
     * @param {Object}                cache   A cache for captured arguments
     *
     */

    self.completeResponse = function (res, cache) {

        if (res.finished) { return; }

        // iterate over each cached argument. It is intential that they
        // are cached as an Array - this is to ensure duplicate call errors
        // correctly throw exceptions and are not transparently ignored

        cache.writeHead.forEach(function (args) {
            res.writeHead.apply(res, args);
        });

        cache.write.forEach(function (args) {
            res.write.apply(res, args);
        });

        cache.end.forEach(function (args) {
            res.end.apply(res, args);
        });

    };

    /**
     * @ngdoc function
     * @name timeoutResponse
     *
     * @description
     * Send a timeout to the client
     *
     * @param {http.ServerResponse}     res   Outgoing HTTP response
     *
     */

    self.timeoutResponse = function timeoutResponse(res) {
        if (res.finished) { return; }
        res.writeHead(503);
        res.end('request timeout');
    };

    /**
     * @ngdoc function
     * @name terminateResponse
     *
     * @description
     * Terminate request
     *
     * @param {http.ServerResponse}     res   Outgoing HTTP response
     *
     */

    self.terminateResponse = function terminateResponse(res) {
        if (res.finished) { return; }
        res.writeHead(400);
        res.end('client terminated request');
    };

    return self;

};
