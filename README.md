Monitor
=======
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependencies][dependencies-image]][dependencies-url]

> Connect middleware to monitor an application process.


## Installation

``` bash
$ npm install connect-middleware-monitor
```

## Usage

To use the module,

``` javascript
var createMonitor = require( 'connect-middleware-monitor' );
```

#### createMonitor( [...plugin] )

The middleware generator accepts monitor plugins which append to a common metrics `object`. 

``` javascript
var // Plugin which reports system metrics:
	sPlugin = require( 'monitor-plugin-os' ),

	// Plugin which reports current process metrics:
	pPlugin = require( 'monitor-plugin-process' );

// Create the monitor middleware:
var monitor = createMonitor( sPlugin, pPlugin );
```

Note: plugins are executed in the same order as they are provided to the middleware generator.

Each plugin should be a single method which accepts two input arguments: [`object`, `clbk`]. The `object` is a shared `object` among all plugins; hence, when choosing plugins, ensure that they are properly namespaced when appending to the `object`.

The callback should be invoked once the plugin finishes appending metrics. The callback takes an optional `error` argument. Any errors are bubbled up through the middleware.

See [monitor-plugin-os](https://github.com/kgryte/monitor-plugin-os) and [monitor-plugin-process](https://github.com/kgryte/monitor-plugin-process) for plugin examples.


#### monitor( request, response, next )

The generated middleware follows the [connect](https://github.com/senchalabs/connect) middleware pattern. Monitor metrics are appended to the `request` object via a `locals` property. Hence, downstream middleware consumers may access the metrics via

``` javascript
var metrics = request.locals.monitor;
```

See the examples below.




## Examples

``` javascript
var express = require( 'express' ),
	request = require( 'request' ),
	sPlugin = require( 'monitor-plugin-os' ),
	pPlugin = require( 'monitor-plugin-process' ),
	createMonitor = require( 'connect-middleware-monitor' );

// Define a port:
var PORT = 7331;

// Create a new monitor:
var monitor = createMonitor( sPlugin, pPlugin );

// Create a new application:
var app = express();

// Bind a route using the monitor middleware:
app.get( '/', [ monitor, sendJSON ] );

// Spin up a new server:
var server = app.listen( PORT, onListen );


function onListen() {
	request({
		'method': 'GET',
		'uri': 'http://127.0.0.1:' + PORT
	}, onResponse );
}

function onResponse( error, response, body ) {
	if ( error ) {
		throw new Error( error );
	}
	console.log( body );
}

function sendJSON( request, response, next ) {
	response
		.status( 200 )
		.send( JSON.stringify( request.locals.monitor ) );
}
```

To run an example from the top-level application directory,

``` bash
$ node ./examples/index.js
```


## Plugins

List of monitor plugins:

*	[monitor-plugin-os](https://github.com/kgryte/monitor-plugin-os): system-level metrics
*	[monitor-plugin-process](https://github.com/kgryte/monitor-plugin-process): current process metrics


## Tests

### Unit

Unit tests use the [Mocha](http://visionmedia.github.io/mocha) test framework with [Chai](http://chaijs.com) assertions. To run the tests, execute the following command in the top-level application directory:

``` bash
$ make test
```

All new feature development should have corresponding unit tests to validate correct functionality.


### Test Coverage

This repository uses [Istanbul](https://github.com/gotwarlost/istanbul) as its code coverage tool. To generate a test coverage report, execute the following command in the top-level application directory:

``` bash
$ make test-cov
```

Istanbul creates a `./reports/coverage` directory. To access an HTML version of the report,

``` bash
$ make view-cov
```



## License

[MIT license](http://opensource.org/licenses/MIT). 


---
## Copyright

Copyright &copy; 2014. Athan Reines.


[npm-image]: http://img.shields.io/npm/v/connect-middleware-monitor.svg
[npm-url]: https://npmjs.org/package/connect-middleware-monitor

[travis-image]: http://img.shields.io/travis/kgryte/connect-middleware-monitor/master.svg
[travis-url]: https://travis-ci.org/kgryte/connect-middleware-monitor

[coveralls-image]: https://img.shields.io/coveralls/kgryte/connect-middleware-monitor/master.svg
[coveralls-url]: https://coveralls.io/r/kgryte/connect-middleware-monitor?branch=master

[dependencies-image]: http://img.shields.io/david/kgryte/connect-middleware-monitor.svg
[dependencies-url]: https://david-dm.org/kgryte/connect-middleware-monitor

[dev-dependencies-image]: http://img.shields.io/david/dev/kgryte/connect-middleware-monitor.svg
[dev-dependencies-url]: https://david-dm.org/dev/kgryte/connect-middleware-monitor

[github-issues-image]: http://img.shields.io/github/issues/kgryte/connect-middleware-monitor.svg
[github-issues-url]: https://github.com/kgryte/connect-middleware-monitor/issues