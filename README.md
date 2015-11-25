# http-collapse

`http-collapse` is a http middleware which can be used to collapse duplicate requests and prevent them from being processed. Why would you want to do this? By reducing concurrent duplicate requests you only need to process a small fraction of them which means processing time can be spent elsewhere.

***Note: cookies are also collapsed so do not use for authenticated requests which require unique tokens per request.***

## usage

```
var httpCollapse = require('http-collapse'),
    express      = require('express'),
    app          = express();

app.use(httpCollapse({ timeout: 5e3 }));
```
> Example usage of http-collapse

### timeout

It is possible to specify a timeout whereby if a request has not finished all queued requests will timeout in addition to the original.

## Testing

Mocha is used for testing and a `mocha.opts` file is located in `./test`.

```bash
> npm test
```
> Running tests

## Coverage

Code coverage analysis is also available.

```bash
> npm run cover
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using `npm test`

## Release History

- **1.4.0** Initial public release
