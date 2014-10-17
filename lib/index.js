/**
*
*	MIDDLEWARE: monitor
*
*
*	DESCRIPTION:
*		- Connect middleware to monitor an application process.
*
*
*	NOTES:
*		[1] 
*
*
*	TODO:
*		[1] 
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com.
*
*/

(function() {
	'use strict';

	// MODULES //

	var // OS module:
		os = require( 'os' ),

		// Module which monitors the Node.js event loop and keeps track of 'lag' (i.e., how long requests wait in Node's event queue before being processed):
		toobusy = require( 'toobusy' );


	// MONITOR //

	/**
	* FUNCTION: createMonitor( [plugin, plugin,...plugin] )
	*	Returns middleware to gather application metrics.
	*
	* @param {...Function} [plugin] - optional functions which can augment the gathered metrics. Each function should accept two arguments: [ metrics, next ], where `next` is a callback. `next` accepts one argument: `error`. If an `error` is provided, the middleware exits passing along the `error` to the next middleware, e.g., an error handler. 
	* @returns {Function} middleware to gather application metrics
	*/
	function createMonitor() {
		var plugins = [];
		if ( arguments.length ) {
			plugins = Array.prototype.slice.call( arguments );
		}
		for ( var i = 0; i < plugins.length; i++ ) {
			if ( typeof plugins[ i ] !== 'function' ) {
				throw new TypeError( 'monitor()::invalid input argument. A plugin must be a function.' );
			}
		}
		/**
		* FUNCTION: monitor( request, response, next )
		*	Middleware to gather application metrics.
		*
		* @param {Object} request - HTTP request object
		* @param {Object} response - HTTP response object
		* @param {Function} next - callback to invoke after gathering application metrics
		*/
		return function monitor( request, response, next ) {
			var sys = {},
				proc = {},
				total,
				free,
				memUsage,
				metrics,
				error;


			// SYSTEM METRICS //

			// [1] Get the number of seconds the system has been running:
			sys.uptime = os.uptime();

			// [2] Get the 1, 5, and 15 minute load averages (does not work on Windows platforms):
			sys.loadavg = os.loadavg(); // [...]

			// [3] Get the total amount of system memory and the amount of free system memory in bytes:
			total = os.totalmem();
			free = os.freemem();

			sys.memory = {
				'total': total,
				'free': free,
				'utilization': ( total-free ) / total
			};

			// [4] Get individual CPU metrics:
			sys.cpus = os.cpus(); // [...]


			// PROCESS METRICS //

			// [5] Get the process id:
			proc.pid = process.pid;

			// [6] Get the number of seconds the process has been running:
			proc.uptime = process.uptime();
			
			// [7] Extract process memory usage:
			memUsage = process.memoryUsage();
			proc.memory = {
				'rss': memUsage.rss,
				'heapUsed': memUsage.heapUsed,
				'heapTotal': memUsage.heapTotal
			};

			// [8] Get the average amount of time requests have to wait in Node's event queue before being processed:
			proc.lag = toobusy.lag();


			// METRICS //

			metrics = {
				'system': sys,
				'process': proc
			};

			// PLUGINS //

			(function next( err ) {
				if ( err ) {
					error = err;
					return;
				}
				if ( plugins.length > 0 ) {
					plugins.shift().apply( {}, [ metrics, next ] );
				}
			})();

			if ( error ) {
				next( error );
				return;
			}

			// LOCALS //

			if ( !request.hasOwnProperty( 'locals' ) ) {
				request.locals = {};
			}
			request.locals.monitor = metrics;

			// Proceed to next middleware:
			next();
		}; // end FUNCTION monitor()

	} // end FUNCTION createMonitor()


	// EXPORTS //

	module.exports = createMonitor;

})();