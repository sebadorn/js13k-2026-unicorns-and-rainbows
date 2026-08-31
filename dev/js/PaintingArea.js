import { euclidDistance, isInside } from './MathUtils.js';
import { Painting } from './Painting.js';
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
		this._color = 'red';
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.brushSize = 5;

		this._history = [];
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
		this._history = [];
		this._lastPos = null;
	}


	/**
	 *
	 * @param {Position} pos
	 * @param {boolean} isFromHistory
	 */
	brushDown( pos, isFromHistory ) {
		let isLine = false;

		if( this._lastPos ) {
			const dist = euclidDistance( pos, this._lastPos );

			if( dist > this.brushSize * 0.5 ) {
				isLine = true;

				this.ctx.strokeStyle = this._color;
				this.ctx.beginPath();
				this.ctx.moveTo(
					this._lastPos.x - this.x,
					this._lastPos.y - this.y
				);
				this.ctx.lineTo(
					pos.x - this.x,
					pos.y - this.y
				);
				this.ctx.closePath();
				this.ctx.stroke();
			}
		}
		else if( !isFromHistory && !isInside( pos, this ) ) {
			return;
		}

		if( !isLine ) {
			const offset = Math.floor( this.brushSize / 2 );
			const x = pos.x - this.x - offset;
			const y = pos.y - this.y - offset;

			this.ctx.fillStyle = this._color;
			this.ctx.fillRect( x, y, this.brushSize, this.brushSize );
		}

		this._lastPos = pos;

		if( !isFromHistory ) {
			this._history.push( [this.brushDown.bind( this ), pos] );
		}
	}


	/**
	 *
	 * @param {any} _
	 * @param {boolean} isFromHistory
	 */
	brushUp( _, isFromHistory ) {
		if( this._lastPos ) {
			this._lastPos = null;

			if( !isFromHistory ) {
				this._history.push( [this.brushUp.bind( this ), null] );
			}
		}
	}


	/**
	 *
	 * @param {string} newColor
	 */
	changeColor( newColor ) {
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );

		this._color = newColor;
		this._history.forEach( h => h[0]( h[1], true ) );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawOnParent( ctx ) {
		ctx.drawImage( this.canvas, this.x, this.y );
	}


	/**
	 *
	 * @returns {Painting}
	 */
	getPainting( level ) {
		const [copyCanvas, _copyCtx] = Renderer.getTrimmedCanvasCopy( this.canvas );

		return new Painting( level, copyCanvas );
	}


};
