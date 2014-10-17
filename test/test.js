
// MODULES //

var // Expectation library:
	chai = require( 'chai' ),

	// Module to be tested:
	createMonitor = require( './../lib' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'connect-middleware-monitor', function tests() {
	'use strict';

	// SETUP //

	var request, response;

	beforeEach( function() {
		request = {
			'locals': {}
		};
	});


	// TESTS //

	it( 'should export a function', function test() {
		expect( createMonitor ).to.be.a( 'function' );
	});

	it( 'should throw an error if provided something other than a function', function test() {
		var values = [
				5,
				'5',
				true,
				null,
				undefined,
				NaN,
				{},
				[]
			];

		for ( var i = 0; i < values.length; i++ ) {
			expect( badValue( values[i] ) ).to.throw( TypeError );
		}

		function badValue( value ) {
			return function() {
				createMonitor( value );
			};
		}
	});

	it( 'should return a function', function test() {
		expect( createMonitor() ).to.be.a( 'function' );
	});

	it( 'should have an arity of 3', function test() {
		assert.strictEqual( createMonitor().length, 3 );
	});

	it( 'should append a locals field to the request object', function test() {
		var monitor = createMonitor();
		delete request.locals;
		monitor( request, response, next );
		function next() {
			expect( request.locals ).to.be.an( 'object' );
		}
	});

	it( 'should append metrics to the request object', function test() {
		var monitor = createMonitor();
		monitor( request, response, next );
		function next() {
			expect( request.locals.monitor ).to.be.an( 'object' );
		}
	});

	it( 'should invoke plugins', function test() {
		var monitor = createMonitor( plugin );
		monitor( request, response, next );
		function plugin( metrics, next ) {
			if ( arguments.length !== 2 ) {
				assert.notOk( true );
			}
			expect( metrics ).to.be.an( 'object' );
			expect( next ).to.be.a( 'function' );
		}
		function next() {
			assert.ok( true );
		}
	});

	it( 'should bubble up plugin errors', function test() {
		var monitor = createMonitor( plugin );
		monitor( request, response, next );
		function plugin( metrics, next ) {
			next( new Error( 'mock error' ) );
		}
		function next( error ) {
			if ( !error ) {
				assert.notOk( true );
				return;
			}
			assert.ok( true );
		}
	});

});