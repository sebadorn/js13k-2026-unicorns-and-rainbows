import { targetFPS } from './Config.js';
import { Input } from './Input.js';
import { clamp } from './MathUtils.js';


const fontFamily = 'Arial, sans-serif';


export const Renderer = {


	/** @type {HTMLCanvasElement?} */
	cnv: null,

	/** @type {CanvasRenderingContext2D?} */
	ctx: null,

	/** @type {import('./Level').Level} */
	level: null,

	isPaused: false,
	last: 0,
	timer: 0,

	center: { x: 0, y: 0 },
	offset: { x: 0, y: 0 },
	scale: 1,
	zoom: 0.5,


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
		this.ctx.font = `500 32px ${fontFamily}`;
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'alphabetic';
		this.ctx.setTransform( this.scale + this.zoom, 0, 0, this.scale + this.zoom, 0, 0 );

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
		this.ctx.font = '600 56px ' + fontFamily;
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
			const dt = timeElapsed / ( 1000 / targetFPS );

			if( this.isPaused ) {
				this.drawPause();
				return; // Stop the loop.
			}

			this.timer += dt;

			this.level.update( dt );
			this.draw();

			// Draw FPS info
			this.ctx.setTransform( this.scale, 0, 0, this.scale, 0, 0 );
			this.ctx.fillStyle = '#fff';
			this.ctx.font = '600 12px ' + fontFamily;
			this.ctx.textAlign = 'left';
			this.ctx.fillText(
				String( Math.round( targetFPS / dt ) ).padStart( 3, '0' ) + ' FPS, ' + this.scale.toFixed( 5 ),
				10, 20
			);
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

		Input.onKeyUp( 'Escape', () => this.togglePause() );
	},


	/**
	 * Resize the canvas.
	 */
	resize() {
		const targetRatio = 4 / 3;

		let height = window.innerHeight;
		let width = Math.round( height * targetRatio );

		if( width > window.innerWidth ) {
			width = window.innerWidth;
			height = width / targetRatio;
		}

		this.scale = height / 1080;

		this.center.x = width / 2 / ( this.scale + this.zoom );
		this.center.y = height / 2 / ( this.scale + this.zoom );

		this.offset.x = ( window.innerWidth - width ) / 2;
		this.offset.y = ( window.innerHeight - height ) / 2;

		this.cnv.width = width;
		this.cnv.height = height;

		if( this.isPaused ) {
			clearTimeout( this._timeoutDrawPause );
			this._timeoutDrawPause = setTimeout( () => this.drawPause(), 100 );
		}
	},


	/**
	 *
	 * @param {number} newZoom
	 */
	setZoom( newZoom ) {
		this.zoom = clamp( newZoom, -0.5, 2.5 );
		this.resize();
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
