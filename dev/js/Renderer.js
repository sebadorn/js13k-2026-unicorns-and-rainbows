'use strict';


js13k.Renderer = {


	/** @type {HTMLCanvasElement?} */
	cnv: null,

	/** @type {CanvasRenderingContext2D?} */
	ctx: null,

	/** @type {js13k.Level?} */
	level: null,

	// Last known cursor position as position on the canvas.
	cursor: [-1, -1],

	isPaused: false,
	last: 0,
	timer: 0,

	center: [0, 0],
	offset: [0, 0],
	scale: 1,


	/**
	 * Clear the canvas.
	 */
	clear() {
		this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		this.ctx.clearRect( 0, 0, this.cnv.width, this.cnv.height );
	},


	/**
	 * Draw to the canvas.
	 */
	draw() {
		this.clear();
		this.ctx.setTransform( this.scale, 0, 0, this.scale, 0, 0 );

		this.level?.draw( this.ctx );
	},


	/**
	 * Draw the pause screen.
	 */
	drawPause() {
		this.ctx.setTransform( this.scale, 0, 0, this.scale, 0, 0 );
		this.ctx.fillStyle = '#0006';
		this.ctx.fillRect( 0, 0, this.cnv.width / this.scale, this.cnv.height / this.scale );

		this.ctx.fillStyle = '#fff';
		this.ctx.font = '600 56px ' + js13k.FONT_SANS;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'top';
		this.ctx.fillText( 'PAUSED', this.center.x, this.center.y - 56 );
	},


	/**
	 * Get an offset canvas and its context.
	 * @param  {number?} w
	 * @param  {number?} h
	 * @return {[HTMLCanvasElement, CanvasRenderingContext2D]}
	 */
	getOffscreenCanvas( w, h ) {
		const canvas = document.createElement( 'canvas' );
		canvas.width = w;
		canvas.height = h;

		const ctx = canvas.getContext( '2d', { alpha: true } );
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		return [canvas, ctx];
	},


	/**
	 *
	 * @returns {number[]}
	 */
	getScaledCursor() {
		return [
			this.cursor[0] / this.scale,
			this.cursor[1] / this.scale,
		];
	},


	/**
	 *
	 */
	init() {
		[this.cnv, this.ctx] = this.getOffscreenCanvas();
		document.body.append( this.cnv );

		this.registerEvents();
		this.resize();
	},


	/**
	 * Start the main loop. Update logic, render to the canvas.
	 * @param {number} [timestamp = 0]
	 */
	mainLoop( timestamp = 0 ) {
		if( timestamp && this.last ) {
			const timeElapsed = timestamp - this.last; // Time that passed between frames. [ms]

			// Target speed of 60 FPS (=> 1000 / 60 ~= 16.667 [ms]).
			const dt = timeElapsed / ( 1000 / js13k.TARGET_FPS );

			if( this.isPaused ) {
				this.drawPause();
				return; // Stop the loop.
			}

			this.timer += dt;

			this.level.update( dt );
			this.draw();

			// // Draw FPS info
			// this.ctx.fillStyle = '#fff';
			// this.ctx.font = '600 12px ' + js13k.FONT_MONO;
			// this.ctx.textAlign = 'left';
			// this.ctx.fillText(
			// 	String( Math.round( js13k.TARGET_FPS / dt ) ).padStart( 3, '0' ) + ' FPS, ' + this.scale.toFixed( 5 ),
			// 	10, 20
			// );
		}

		this.last = timestamp;

		requestAnimationFrame( t => this.mainLoop( t ) );
	},


	/**
	 *
	 */
	pause() {
		this.isPaused = true;
	},


	/**
	 *
	 */
	registerEvents() {
		window.addEventListener( 'resize', _ev => this.resize() );
		this.resize();

		js13k.Input.onKeyUp( 'Escape', () => this.togglePause() );

		let timeoutMove = null;

		this.cnv.addEventListener( 'mouseleave', _ev => {
			this.cursor[0] = -1;
		} );

		this.cnv.addEventListener( 'mousemove', ev => {
			this.cursor[0] = ev.clientX - this.offset[0];
			this.cursor[1] = ev.clientY - this.offset[1];

			// Slow down mousemove event related actions for better performance.
			if( !timeoutMove && !this.isPaused ) {
				timeoutMove = setTimeout( () => {
					const foundClickable = this.level?.onMouseMove( this.getScaledCursor() );
					timeoutMove = null;

					if( foundClickable ) {
						this.cnv.classList.add( 'p' );
					}
					else {
						this.cnv.classList.remove( 'p' );
					}
				}, 66 );
			}
		} );

		this.cnv.addEventListener( 'click', ev => {
			this.cursor[0] = ev.clientX - this.offset[0];
			this.cursor[1] = ev.clientY - this.offset[1];

			if( !this.isPaused ) {
				this.level?.onClick( this.getScaledCursor() );
			}
		} );
	},


	/**
	 * Resize the canvas.
	 */
	resize() {
		const targetRatio = 1920 / 1080;

		let height = window.innerHeight;
		let width = Math.round( height * targetRatio );

		if( width > window.innerWidth ) {
			width = window.innerWidth;
			height = width / targetRatio;
		}

		this.scale = height / 1080;

		this.center.x = width / 2 / this.scale;
		this.center.y = height / 2 / this.scale;

		this.offset[0] = ( window.innerWidth - width ) / 2;
		this.offset[1] = ( window.innerHeight - height ) / 2;

		this.cnv.width = width;
		this.cnv.height = height;

		if( this.isPaused ) {
			clearTimeout( this._timeoutDrawPause );
			this._timeoutDrawPause = setTimeout( () => this.drawPause(), 100 );
		}
	},


	/**
	 *
	 */
	togglePause() {
		this.isPaused ? this.unpause() : this.pause();
	},


	/**
	 *
	 */
	unpause() {
		if( this.isPaused ) {
			this.isPaused = false;
			this.mainLoop();
		}
	},


};