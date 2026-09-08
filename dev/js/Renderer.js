import { fontFamilySerif, targetFPS } from './Config.js';
import { Input } from './Input.js';
import { Colors } from './MagicColors.js';
import { clamp } from './MathUtils.js';


export const Renderer = {


	/** @type {HTMLCanvasElement?} */
	cnv: null,
	/** @type {HTMLCanvasElement?} */
	cnvUI: null,

	/** @type {CanvasRenderingContext2D?} */
	ctx: null,
	/** @type {CanvasRenderingContext2D?} */
	ctxUI: null,

	/** @type {import('./Level').Level} */
	level: null,

	/** @type {Animation} */
	animTransition: null,

	isPaused: false,
	last: 0,
	timer: 0,

	/**
	 * Last known cursor position as position on the canvas.
	 * @type {Position}
	 */
	cursor: { x: -1, y: -1 },

	/** @type {Position} */
	center: { x: 0, y: 0 },
	/** @type {Position} */
	offset: { x: 0, y: 0 },

	scale: 1,
	zoom: 0,

	/** @type {number} */
	drawHeight: 0,
	/** @type {number} */
	drawWidth: 0,


	/**
	 *
	 * @param {import('./Level').Level} newLevel
	 */
	changeLevel( newLevel ) {
		if( newLevel === this.level ) {
			return;
		}

		// const [snapshotCnv, snapshotCtx] = this.getOffscreenCanvas( this.cnv.width, this.cnv.height );
		// snapshotCtx.drawImage( this.cnv, 0, 0 );

		this.level = newLevel;

		// this.animTransition = new Animation(
		// 	newLevel, 2,
		// 	progress => {
		// 		progress = 1 - progress * progress;
		// 		this.ctx.drawImage( snapshotCnv, 0, 0, progress * this.drawWidth, this.drawHeight );
		// 	},
		// 	_ => this.animTransition = null,
		// );
	},


	/**
	 * Clear the canvas.
	 */
	clear() {
		this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		this.ctx.clearRect( 0, 0, this.cnv.width, this.cnv.height );

		this.ctxUI.setTransform( 1, 0, 0, 1, 0, 0 );
		this.ctxUI.clearRect( 0, 0, this.cnvUI.width, this.cnvUI.height );
	},


	/**
	 * Draw to the canvas.
	 */
	draw() {
		this.clear();

		this.ctx.font = `500 32px ${fontFamilySerif}`;
		this.ctx.shadowBlur = 0;
		this.ctx.textAlign = 'left';
		this.ctx.textBaseline = 'top';

		this.ctxUI.font = `500 24px ${fontFamilySerif}`;
		this.ctxUI.shadowBlur = 0;
		this.ctxUI.textAlign = 'left';
		this.ctxUI.textBaseline = 'middle';

		this.resetTransform();

		this.level?.draw( this.ctx, this.ctxUI );
		this.ctx.drawImage( this.cnvUI, 0, 0 );
	},


	/**
	 * Draw the pause screen.
	 */
	drawPause() {
		this.ctxUI.fillStyle = '#000a';
		this.ctxUI.fillRect( 0, 0, this.drawWidth, this.drawHeight );

		this.ctxUI.fillStyle = Colors.White.color;
		this.ctxUI.font = `600 56px ${fontFamilySerif}`;
		this.ctxUI.textAlign = 'center';
		this.ctxUI.textBaseline = 'top';
		this.ctxUI.fillText( 'PAUSED', this.drawWidth / 2, this.drawHeight / 2 - 56 );

		this.ctx.drawImage( this.cnvUI, 0, 0 );
	},


	/**
	 * Get an offscreen canvas and its context.
	 * @param {number?} w
	 * @param {number?} h
	 * @returns {[HTMLCanvasElement, CanvasRenderingContext2D]}
	 */
	getOffscreenCanvas( w, h ) {
		const canvas = document.createElement( 'canvas' );
		canvas.width = w;
		canvas.height = h;

		const ctx = canvas.getContext( '2d', { alpha: true } );

		return [canvas, ctx];
	},


	/**
	 *
	 * @returns {Position}
	 */
	getScaledCursor() {
		return {
			x: this.cursor.x / ( this.scale + this.zoom ),
			y: this.cursor.y / ( this.scale + this.zoom ),
		};
	},


	/**
	 * Trim the given canvas down to the area with drawings.
	 * Assumes a transparent background.
	 * @param {HTMLCanvasElement} canvas
	 * @returns {[HTMLCanvasElement, CanvasRenderingContext2D]}
	 */
	getTrimmedCanvasCopy( canvas ) {
		let left = canvas.width;
		let top = canvas.height;
		let right = 0;
		let bottom = 0;

		const ctx = canvas.getContext( '2d', { alpha: true } );
		const imageData = ctx.getImageData( 0, 0, left, top );

		for( let y = 0; y < imageData.height; y++ ) {
			for( let x = 0; x < imageData.width; x++ ) {
				const pxIndex = ( y * imageData.width + x ) * 4;
				const pxAlpha = imageData.data[pxIndex + 3];

				if( pxAlpha === 0 ) {
					continue;
				}

				left = left > x ? x : left;
				right = right < x ? x : right;
				top = top > y ? y : top;
				bottom = bottom < y ? y : bottom;
			}
		}

		const newWidth = right - left;
		const newHeight = bottom - top;

		const [copyCnv, copyCtx] = this.getOffscreenCanvas( newWidth, newHeight );
		copyCtx.drawImage(
			canvas,
			left, top, newWidth, newHeight,
			0, 0, newWidth, newHeight,
		);

		return [copyCnv, copyCtx];
	},


	/**
	 *
	 */
	init() {
		[this.cnv, this.ctx] = this.getOffscreenCanvas();
		document.body.append( this.cnv );

		[this.cnvUI, this.ctxUI] = this.getOffscreenCanvas();

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
			this.animTransition?.do( dt );

			// Draw FPS info
			this.ctx.setTransform( this.scale, 0, 0, this.scale, 0, 0 );
			this.ctx.fillStyle = '#fff';
			this.ctx.font = '600 12px ' + fontFamilySerif;
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

		let timeoutMove = null;

		this.cnv.addEventListener( 'mouseleave', _ev => {
			this.cursor.x = -1;
		} );

		this.cnv.addEventListener( 'mousemove', ev => {
			this.cursor.x = ev.clientX - this.offset.x;
			this.cursor.y = ev.clientY - this.offset.y;

			if( this.isPaused ) {
				return;
			}

			// Drawing with the mouse.
			if( ev.buttons === 1 ) {
				clearTimeout( timeoutMove );
				timeoutMove = null;

				this.level?.onMouseDrawing( this.getScaledCursor() );
			}
			// Slow down mousemove event related actions for better performance.
			else if( !timeoutMove ) {
				timeoutMove = setTimeout( () => {
					const foundClickable = this.level?.onMouseMove( this.getScaledCursor() );
					timeoutMove = null;

					if( foundClickable ) {
						this.cnv.classList.add( 'p' );
					}
					else {
						this.cnv.classList.remove( 'p' );
					}
				}, 33 );
			}
		} );

		this.cnv.addEventListener( 'click', ev => {
			this.cursor.x = ev.clientX - this.offset.x;
			this.cursor.y = ev.clientY - this.offset.y;

			if( !this.isPaused ) {
				this.level?.onClick( this.getScaledCursor() );
			}
		} );
	},


	/**
	 *
	 */
	resetTransform() {
		this.ctx.setTransform( this.scale + this.zoom, 0, 0, this.scale + this.zoom, 0, 0 );
	},


	/**
	 * Resize the canvas.
	 */
	resize() {
		const targetRatio = 9 / 6;

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

		this.cnvUI.width = width;
		this.cnvUI.height = height;

		this.drawHeight = height / ( this.scale + this.zoom );
		this.drawWidth = width / ( this.scale + this.zoom );

		if( this.isPaused ) {
			clearTimeout( this._timeoutDrawPause );
			this._timeoutDrawPause = setTimeout( () => this.drawPause(), 100 );
		}
	},


	/**
	 * Rotate around a given coordinate.
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} rad - Rotation in radians.
	 * @param {Position} c
	 */
	rotateCenter( ctx, rad, c ) {
		ctx.translate( c.x, c.y );
		ctx.rotate( rad );
		ctx.translate( -c.x, -c.y );
	},



	/**
	 * Scale around a given coordinate.
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} sx
	 * @param {number} sy
	 * @param {Position} c
	 */
	scaleCenter( ctx, sx, sy, c ) {
		ctx.translate( c.x, c.y );
		ctx.scale( sx, sy );
		ctx.translate( -c.x, -c.y );
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
