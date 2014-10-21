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

	// MONITOR //

	/**
	* FUNCTION: createMonitor( [plugin, plugin,...plugin] )
	*	Returns middleware to gather application metrics.
	*
	* @param {...Function} [plugin] - optional functions which can augment the gathered metrics. Each function should accept two arguments: [ metrics, next ], where `next` is a callback. `next` accepts one argument: `error`. If an `error` is provided, the middleware exits passing along the `error` to the next middleware, e.g., an error handler. 
	* @returns {Function} middleware to gather application metrics
	*/
	function createMonitor() {
		var plugins = [],
			numPlugins;
		if ( arguments.length ) {
			plugins = Array.prototype.slice.call( arguments );
		}
		numPlugins = plugins.length;
		for ( var i = 0; i < numPlugins; i++ ) {
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
			var metrics = {},
				idx = -1;

			// Run all monitor plugins...
			(function next( error ) {
				if ( error ) {
					done( error );
					return;
				}
				if ( ++idx < numPlugins ) {
					plugins[ idx ].apply( {}, [ metrics, next ] );
				} else {
					done();
				}
			})();

			/**
			* FUNCTION: done( [error] )
			*	Callback invoked once all plugins have reported back to the monitor.
			*
			* @private
			* @param {Object} [error] - error object
			*/
			function done( error ) {
				if ( error ) {
					next( error );
					return;
				}
				if ( !request.hasOwnProperty( 'locals' ) ) {
					request.locals = {};
				}
				request.locals.monitor = metrics;
				next();
			} // end FUNCTION done()
		}; // end FUNCTION monitor()
	} // end FUNCTION createMonitor()


	// EXPORTS //

	module.exports = createMonitor;

})();