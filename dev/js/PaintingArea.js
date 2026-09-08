import { fontFamilySans } from './Config.js';
import { LevelObject } from './LevelObject.js';
import { Colors } from './MagicColors.js';
import { euclidDistance, isInside, numAsSignedStr } from './MathUtils.js';
import { Painting } from './Painting.js';
import { Renderer } from './Renderer.js';
import { UIButton } from './UIButton.js';


export class PaintingArea {


	/** @type {HTMLCanvasElement} */
	canvas;

	/** @type {CanvasRenderingContext2D} */
	ctx;

	/** @type {import('./MagicColors').MagicColor} */
	_color;


	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {Function} onDone
	 */
	constructor( x, y, w, h, onDone ) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.onDone = onDone;

		this.brushSize = 5;
		this.for = Painting.Unspecific;
		this.visible = true;
		this.showColorSelection = true;

		this._color = Colors.Red;
		this._history = [];
		this._lastPos = null;

		[this.canvas, this.ctx] = Renderer.getOffscreenCanvas( w, h );
		this.ctx.lineWidth = this.brushSize - 0.5;
		this.ctx.lineCap = 'butt';
		this.clear();

		this._undoButton = new UIButton(
			{
				w: 100,
				h: 40,
				text: '↶ undo',
			},
			() => this.undo(),
		);

		this._clearButton = new UIButton(
			{
				w: 100,
				h: 40,
				text: '✕ clear',
			},
			() => this.clear(),
		);

		this._doneButton = new UIButton(
			{
				w: 100,
				h: 40,
				text: 'Done',
			},
			() => this.onDone(),
		);

		this._colorButtons = Object.values( Colors )
			.filter( c => !c.hidden )
			.map( ( c, _i ) => {
				return new UIButton(
					{
						w: 50,
						h: 50,
						magicColor: c,
					},
					() => this.changeColor( c ),
				);
			} );

		this._allButtons = [
			...this._colorButtons,
			this._clearButton,
			this._doneButton,
			this._undoButton,
		];
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawColorButtons( ctx ) {
		this._colorButtons.forEach( ( btn, i ) => {
			btn.x = this.x - btn.w - 10;
			btn.y = this.y + i * ( btn.h + 5 );
			btn.draw( ctx );
		} );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawColorMods( ctx ) {
		const x = this.x + this.w + 20;
		let y = this.y;
		let text;

		const addMod = mod => {
			ctx.fillStyle = '#fff';

			if( mod ) {
				ctx.fillStyle = this._color.color;
				text += numAsSignedStr( mod );
			}

			ctx.fillText( text, x, y += 30 );
		};

		ctx.textAlign = 'left';
		ctx.font = `500 18px ${fontFamilySans}`;

		if( this.for === Painting.FighterItem || this.for === Painting.TowerItem ) {
			text = `Attack Dmg ${LevelObject.baseAttackDamage} `;
			addMod( this._color.modAttackDamage );
		}

		if( this.for === Painting.Fighter || this.for === Painting.Tower ) {
			const baseRange = this.for === Painting.Tower
				? LevelObject.baseAttackRangeTower
				: LevelObject.baseAttackRange;
			text = `Attack Range ${baseRange} `;
			addMod( this._color.modAttackRange );

			text = `Attack Speed ${LevelObject.baseAttackSpeed} `;
			addMod( this._color.modAttackSpeed );

			text = `Health ${LevelObject.baseHealthMax} `;
			addMod( this._color.modHealth );
		}

		if( this.for === Painting.Fighter ) {
			text = `Move Speed ${LevelObject.baseMoveSpeed} `;
			addMod( this._color.modMoveSpeed );
		}
	}


	/**
	 *
	 * @private
	 * @param {Position} pos
	 * @returns {UIButton?}
	 */
	_getButtonAtPos( pos ) {
		let hit = null;

		for( let i = 0; i < this._allButtons.length; i++ ) {
			const btn = this._allButtons[i];

			if( isInside( pos, btn ) ) {
				hit = btn;
				break;
			}
		}

		if(
			!this.showColorSelection &&
			this._colorButtons.includes( hit )
		) {
			return null;
		}

		return hit;
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

				this.ctx.lineWidth = this.brushSize;
				this.ctx.strokeStyle = this._color.color;
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

			this.ctx.fillStyle = this._color.color;
			this.ctx.fillRect( x, y, this.brushSize, this.brushSize );
		}

		this._lastPos = pos;

		if( !isFromHistory ) {
			this._history.push( pos );
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
				this._history.push( null );
			}
		}
	}


	/**
	 *
	 * @param {import('./MagicColors').MagicColor} newColor
	 */
	changeColor( newColor ) {
		const oldColor = this._color;
		this._color = newColor;

		this.repaintFromHistory();
		this._history.push( oldColor );
		this._history.push( null );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( !this.visible ) {
			return;
		}

		// background
		ctx.fillStyle = '#000';
		ctx.fillRect( this.x, this.y, this.w, this.h );

		// border
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.roundRect( this.x, this.y, this.w, this.h, 4 );
		ctx.closePath();
		ctx.stroke();

		if( this.showColorSelection ) {
			this._drawColorButtons( ctx );
			this._drawColorMods( ctx );
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
	 * @param {import('./Level').Level} level
	 * @returns {Painting}
	 */
	getPainting( level ) {
		const [copyCanvas, _copyCtx] = Renderer.getTrimmedCanvasCopy( this.canvas );
		this._color.used++;

		return new Painting( level, copyCanvas, this._color );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		if( !this.visible ) {
			return;
		}

		if( isInside( pos, this ) ) {
			this.brushDown( pos );
		}
		else {
			const btn = this._getButtonAtPos( pos );
			btn?.onClick();
		}
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		if( !this.visible ) {
			return false;
		}

		this.brushUp();

		this._allButtons.forEach( btn => btn.isHovered = false );

		const btn = this._getButtonAtPos( pos );

		if( btn ) {
			btn.isHovered = true;
		}

		return !!btn;
	}


	/**
	 * Repaint the painting from history.
	 */
	repaintFromHistory() {
		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );

		this._history.forEach( h => {
			if( h && !h.color ) {
				this.brushDown( h, true );
			}
			else {
				this.brushUp( h, true );
			}
		} );
	}


	/**
	 * Resize the painting area. This will also clear its contents.
	 * @param {number} w
	 * @param {number} h
	 */
	resize( w, h ) {
		this.canvas.width = w;
		this.canvas.height = h;
		this.w = w;
		this.h = h;
	}


	/**
	 * Undo the last brush stroke.
	 */
	undo() {
		let index = -1;
		let color = null;

		// We are searching for the last interval between two "brushUp" actions to undo.
		for( let i = this._history.length - 1; i >= 0; i-- ) {
			const action = this._history[i];

			if( action?.color ) {
				color = action;
				index = i;
				break;
			}

			if( i < this._history.length - 1 && !action ) {
				index = i;
				break;
			}
		}

		if( color ) {
			this.changeColor( color );
			this._history.splice( index );
		}
		else {
			this._history.splice( index >= 0 ? index : 0 );				
			this.repaintFromHistory();
		}

		// Even with an empty history it just returns
		// undefined which evaluates as falsy.
		// We want the history to end on a brushUp().
		if( this._history[this._history.length - 1] ) {
			this._history.push( null );
		}

		this._lastPos = null;
	}


};
