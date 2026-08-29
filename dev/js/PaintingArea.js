import { Painting } from './Painting.js';
import { euclidDistance } from './MathUtils.js';
import { Renderer } from './Renderer.js';


export class PaintingArea {


	/** @type {HTMLCanvasElement} */
	canvas;

	/** @type {CanvasRenderingContext2D} */
	ctx;


	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor( x, y, w, h ) {
		this.color = '#fff';
		this.pos = { x, y };
		this.w = w;
		this.h = h;
		this.brushSize = 5;

		this._lastPos = null;

		[this.canvas, this.ctx] = Renderer.getOffscreenCanvas( w, h );
		this.ctx.lineWidth = this.brushSize - 0.5;
		this.ctx.lineCap = 'butt';
	}


	/**
	 *
	 */
	clear() {
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
		this._lastPos = null;
	}


	/**
	 *
	 * @param {Position} pos
	 */
	brushDown( pos ) {
		let isLine = false;

		if( this._lastPos ) {
			const dist = euclidDistance( pos, this._lastPos );

			if( dist > this.brushSize * 0.5 ) {
				isLine = true;

				this.ctx.strokeStyle = this.color;
				this.ctx.beginPath();
				this.ctx.moveTo(
					this._lastPos.x - this.pos.x,
					this._lastPos.y - this.pos.y
				);
				this.ctx.lineTo(
					pos.x - this.pos.x,
					pos.y - this.pos.y
				);
				this.ctx.closePath();
				this.ctx.stroke();
			}
		}

		if( !isLine ) {
			const offset = Math.floor( this.brushSize / 2 );
			const x = pos.x - this.pos.x - offset;
			const y = pos.y - this.pos.y - offset;

			this.ctx.fillStyle = this.color;
			this.ctx.fillRect( x, y, this.brushSize, this.brushSize );
		}

		this._lastPos = pos;
	}


	/**
	 *
	 */
	brushUp() {
		this._lastPos = null;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawOnParent( ctx ) {
		ctx.drawImage( this.canvas, this.pos.x, this.pos.y );
	}


	/**
	 *
	 * @returns {Painting}
	 */
	getPainting( level ) {
		const [copyCanvas, copyCtx] = Renderer.getTrimmedCanvasCopy( this.canvas );

		return new Painting( level, copyCanvas, copyCtx );
	}


};
