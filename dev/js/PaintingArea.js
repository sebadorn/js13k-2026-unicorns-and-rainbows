import { Colors } from './Config.js';
import { euclidDistance, isInside } from './MathUtils.js';
import { Painting } from './Painting.js';
import { Renderer } from './Renderer.js';
import { UIButton } from './UIOverlay.js';


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
	 * @param {function} onDone
	 */
	constructor( x, y, w, h, onDone ) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.onDone = onDone;

		this.brushSize = 5;
		this.colorMode = 'single';
		this.visible = true;
		this.showColorSelection = true;

		this._color = Colors.Red;
		this._history = [];
		this._lastPos = null;

		[this.canvas, this.ctx] = Renderer.getOffscreenCanvas( w, h );
		this.ctx.lineWidth = this.brushSize - 0.5;
		this.ctx.lineCap = 'butt';

		this._undoButton = new UIButton(
			Renderer.level,
			{
				w: 100,
				h: 40,
				text: '↶ undo',
			},
			() => this.undo(),
		);

		this._clearButton = new UIButton(
			Renderer.level,
			{
				w: 100,
				h: 40,
				text: '✕ clear',
			},
			() => this.clear(),
		);

		this._doneButton = new UIButton(
			Renderer.level,
			{
				w: 100,
				h: 40,
				text: 'Done',
			},
			() => this.onDone(),
		);

		this._colorButtons = Object.values( Colors ).map( ( c, _i ) => {
			return new UIButton(
				Renderer.level,
				{
					w: 40,
					h: 20,
					color: c,
				},
				() => this.changeColor( c ),
			);
		} );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawColorButtons( ctx ) {
		this._colorButtons.forEach( ( btn, i ) => {
			btn.x = this.x - btn.w - 10;
			btn.y = this.y + i * ( btn.h + 10 );
			btn.draw( ctx );
		} );
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
		if( !this.visible ) {
			return;
		}

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
		if( this.visible && this._lastPos ) {
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
		this._color = newColor;

		// In "single" color mode repaint everything in the new color.
		// In "multi" color mode we just continue with the new color from on.
		if( this.colorMode === 'single' ) {
			this.repaintFromHistory();
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawOnParent( ctx ) {
		if( !this.visible ) {
			return;
		}

		// border
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		ctx.strokeRect( this.x, this.y, this.w, this.h );

		if( this.showColorSelection ) {
			this._drawColorButtons( ctx );
		}

		this._undoButton.x = this.x + this.w / 2 - this._undoButton.w - 10;
		this._undoButton.y = this.y - this._undoButton.h - 10;
		this._undoButton.draw( ctx );

		this._clearButton.x = this.x + this.w / 2 + 10;
		this._clearButton.y = this.y - this._clearButton.h - 10;
		this._clearButton.draw( ctx );

		this._doneButton.x = this.x + ( this.w - this._doneButton.w ) / 2;
		this._doneButton.y = this.y + this.h + 10;
		this._doneButton.draw( ctx );

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


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		for( let i = 0; i < this._colorButtons.length; i++ ) {
			const btn = this._colorButtons[i];

			if( isInside( pos, btn ) ) {
				btn.onClick();
				return;
			}
		}

		if( isInside( pos, this._doneButton ) ) {
			this._doneButton.onClick();
		}
		else if( isInside( pos, this._undoButton ) ) {
			this._undoButton.onClick();
		}
		else if( isInside( pos, this._clearButton ) ) {
			this._clearButton.onClick();
		}
	}


	/**
	 * Repaint the painting from history.
	 */
	repaintFromHistory() {
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
		this._history.forEach( h => h[0]( h[1], true ) );
	}


	/**
	 * Undo the last brush stroke.
	 */
	undo() {
		let index = -1;

		for( let i = this._history.length - 1; i >= 0; i-- ) {
			const action = this._history[i];

			// Skip brushUp() actions, undo everything starting
			// from the latest brushDown() action
			if( action[1] ) {
				index = i;
				break;
			}
		}

		if( index >= 0 ) {
			this._history.splice( index );
			this.repaintFromHistory();
		}
	}


};
