var express = require( 'express' ),
	request = require( 'request' ),
	sPlugin = require( 'monitor-plugin-os' ),
	pPlugin = require( 'monitor-plugin-process' ),
	createMonitor = require( './../lib' );

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
	server.close();
	process.exit( -1 );
}

function sendJSON( request, response, next ) {
	response
		.status( 200 )
		.send( JSON.stringify( request.locals.monitor ) );
}