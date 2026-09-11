import { fontFamilySans, fontFamilySerif } from './Config.js';
import { Colors } from './MagicColors.js';
import { euclidDistance, isInside } from './MathUtils.js';
import { Painting } from './Painting.js';
import { Renderer } from './Renderer.js';
import { Timer } from './Timer.js';
import { UIButton } from './UIButton.js';


export class PaintingArea {


	/** @type {HTMLCanvasElement} */
	canvas;

	/** @type {CanvasRenderingContext2D} */
	ctx;


	/**
	 *
	 * @param {number} w
	 * @param {number} h
	 * @param {Function} onDone
	 */
	constructor( w, h, onDone ) {
		this.x = 0;
		this.y = 0;
		this.w = w;
		this.h = h;
		this.onDone = onDone;

		this.brushSize = 5;
		this.for = Painting.Unspecific;
		this.offsetY = 0;
		this.showColorSelection = true;
		this.showLabels = true;
		this.title = null;
		this.titleGap = 150;

		this._color = Colors.Red;
		this._history = [];
		this._lastPos = null;
		this._visible = true;

		this._random = Math.random();
		this._updateTimer = null;

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
			() => {
				this.clear();
				return true;
			},
		);

		this._doneButton = new UIButton(
			{
				w: 100,
				h: 40,
				text: 'Done',
			},
			() => {
				this.onDone();
				return true;
			},
		);

		this._colorButtons = Object.values( Colors )
			.filter( c => !c.hidden )
			.map( c => {
				return new UIButton(
					{
						w: 50,
						h: 50,
						magicColor: c,
					},
					() => {
						if( c.hasUsesLeft() ) {
							this.changeColor( c );
							return true;
						}

						return false;
					},
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
	 * @returns {boolean}
	 */
	get visible() {
		return this._visible;
	}


	/**
	 *
	 * @param {boolean} v
	 */
	set visible( v ) {
		this._visible = !!v;
		this._colorCheck();

		if( !this._visible ) {
			document.body.classList.remove( 'c_' + this._color.id );
		}
		else {
			document.body.classList.add( 'c_' + this._color.id );
		}
	}


	// If current color has no uses left, select
	// the first one that still has some.
	_colorCheck() {
		if( !this._color.hasUsesLeft() ) {
			this._color = Object.values( Colors ).find( c => c.hasUsesLeft() );
		}
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawColorButtons( ctx ) {
		const isForItem = this.for === Painting.FighterItem || this.for === Painting.TowerItem;

		const getLabelText = c => {
			let text = null;

			if( c === Colors.Red ) {
				text = 'Fire';
			}
			else if( c === Colors.Orange ) {
				text = isForItem ? 'Stun' : 'Taunt';
			}
			else if( c === Colors.Yellow ) {
				text = isForItem ? 'Lightning' : 'Speed';
			}
			else if( c === Colors.Green ) {
				text = 'Healing';
			}
			else if( c === Colors.Cyan ) {
				text = 'Cold';
			}
			else if( c === Colors.Blue ) {
				text = isForItem ? 'Weakening' : 'Strengthening';
			}
			else if( c === Colors.Violet ) {
				text = 'Random';
			}

			return text;
		};

		const gap = 5;
		const offsetY = ( this.h - this._colorButtons.length * ( this._colorButtons[0].h + gap ) ) / 2;

		this._colorButtons.forEach( ( btn, i ) => {
			btn.x = this.x - btn.w - 15;
			btn.y = this.y + i * ( btn.h + gap ) + offsetY;
			btn.draw( ctx );

			if( btn.magicColor === this._color || btn.isHovered ) {
				const text = getLabelText( btn.magicColor );

				if( text ) {
					ctx.font = `500 26px ${fontFamilySerif}`;
					ctx.fillStyle = btn.magicColor.color;
					ctx.textAlign = 'right';
					ctx.textBaseline = 'middle';
					ctx.fillText( text, btn.x - 10, btn.y + btn.h / 2 );
				}
			}
		} );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawLabels( ctx ) {
		let top = '— top';
		let bottom = '— bottom';
		let direction = '→ orientation';

		ctx.font = `500 14px ${fontFamilySans}`;
		ctx.fillStyle = Colors.White.color;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';

		const x = this.x + this.w + 5;

		ctx.fillText( top, x, this.y );
		ctx.fillText( bottom, x, this.y + this.h );
		ctx.fillText( direction, x, this.y + this.h / 2 );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawTitle( ctx ) {
		if( this.title === null && this.for === Painting.Unspecific ) {
			return;
		}

		let text = this.title;
		let suggestion = null;

		// Allow empty string
		if( text === null ) {
			if( this.for === Painting.Fighter ) {
				text = 'Paint a fighter';
			}
			else if( this.for === Painting.FighterItem ) {
				text = 'Paint a weapon for your fighter';
			}
			else if( this.for === Painting.Tower ) {
				text = 'Paint a tower';
			}
			else if( this.for === Painting.TowerItem ) {
				text = 'Paint a projectile for your tower';
			}

			if( text ) {
				suggestion = this._getDrawSuggestion();
			}
		}

		const offsetY = Math.sin( Renderer.level.timer / 50 ) * 5;

		ctx.font = `500 italic 46px ${fontFamilySerif}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = Colors.White.color;
		ctx.fillText( text, Renderer.drawWidth / 2, this.y - this.titleGap + offsetY );

		if( suggestion ) {
			ctx.font = `500 italic 20px ${fontFamilySerif}`;
			ctx.fillText( `How about ${suggestion}?`, Renderer.drawWidth / 2, this.y - this.titleGap + 40 );
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
	 * @private
	 * @returns {string?}
	 */
	_getDrawSuggestion() {
		let list = null;

		if( this.for === Painting.Fighter ) {
			list = [
				'a ball with legs',
				'a dancer',
				'a goblin',
				'a gorilla',
				'a spider',
				'a suspicious box',
				'a teapot on legs',
				'a tree with arms',
				'a viking',
				'another unicorn',
			];
		}
		else if( this.for === Painting.FighterItem ) {
			list = [
				'a banana',
				'a dagger',
				'a fist',
				'a flute',
				'a pitchfork',
				'a rapier',
				'a scepter',
				'a shoe',
				'a shoespoon',
				'a spoon',
				'a sword',
				'a wing',
			];
		}
		else if( this.for === Painting.Tower ) {
			list = [
				'a cactus',
				'a cucumber on legs',
				'a fir tree',
				'a giant horn',
				'a mushroom',
				'a skyscraper',
				'a slim giant',
				'a stack of stones',
				'a tall barn',
				'a wizard tower',
			];
		}
		else if( this.for === Painting.TowerItem ) {
			list = [
				'a berry',
				'a bolt',
				'a boomerang',
				'a cannon ball',
				'a flame',
				'an ice cube',
				'a music note',
				'a potato',
				'a round little guy',
				'a tomato',
				'an arrow',
			];
		}

		if( !list ) {
			return list;
		}

		const index = Math.round( this._random * ( list.length - 1 ) );

		return list[index];
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
		if( !this.visible && !isFromHistory ) {
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
		if( !this.visible && !isFromHistory ) {
			return;
		}

		if( this._lastPos ) {
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

		if( this._visible ) {
			document.body.classList.remove( 'c_' + oldColor.id );
			document.body.classList.add( 'c_' + newColor.id );
		}

		// No point adding a color change to an empty painting
		if( this._history.length > 0 ) {
			this.repaintFromHistory();

			this._history.push( oldColor );
			this._history.push( null );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( !this.visible ) {
			return;
		}

		if( !this._updateTimer ) {
			this._updateTimer = new Timer( Renderer.level, 5 );
		}

		if( this._updateTimer.elapsed() ) {
			this._random = Math.random();
			this._updateTimer.restart();
		}

		ctx.fillStyle = '#000a';
		ctx.fillRect( 0, 0, Renderer.drawWidth, Renderer.drawHeight );

		this.x = ( Renderer.drawWidth - this.w ) / 2;
		this.y = ( Renderer.drawHeight - this.h ) / 2 + this.offsetY;

		// background
		ctx.fillStyle = '#000';
		ctx.fillRect( this.x, this.y, this.w, this.h );

		this._drawTitle( ctx );

		// border
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.roundRect( this.x, this.y, this.w, this.h, 4 );
		ctx.closePath();
		ctx.stroke();

		if( this.showColorSelection ) {
			this._drawColorButtons( ctx );
		}

		if( this.showLabels ) {
			this._drawLabels( ctx );
		}

		this._undoButton.x = this.x + this.w / 2 - this._undoButton.w - 10;
		this._undoButton.y = this.y - this._undoButton.h - 15;
		this._undoButton.draw( ctx );

		this._clearButton.x = this.x + this.w / 2 + 10;
		this._clearButton.y = this.y - this._clearButton.h - 15;
		this._clearButton.draw( ctx );

		if( this._history.length > 2 ) {
			this._doneButton.x = this.x + ( this.w - this._doneButton.w ) / 2;
			this._doneButton.y = this.y + this.h + 15;
			this._doneButton.draw( ctx );
		}

		ctx.drawImage( this.canvas, this.x, this.y );
	}


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {boolean} [flipX = false]
	 * @returns {Painting}
	 */
	getPainting( level, flipX = false ) {
		const [trimCanvas, _trimCtx] = Renderer.getTrimmedCanvasCopy( this.canvas );
		this._color.used++;

		const [copyCanvas, copyCtx] = Renderer.getOffscreenCanvas( this.w, this.h );
		const trimW = trimCanvas.width;
		const trimH = trimCanvas.height;

		// Painting.TowerItem and Painting.Unspecific
		const pos = {
			x: ( this.w - trimW ) / 2, // x: center
			y: ( this.h - trimH ) / 2, // y: center
		};

		if( this.for === Painting.Tower ) {
			pos.y = this.h - trimH; // y: bottom
		}
		else if( this.for === Painting.Fighter ) {
			pos.x = this.w - trimW; // x: right
			pos.y = this.h - trimH; // y: bottom
		}
		else if( this.for === Painting.FighterItem ) {
			pos.x = 0; // x: left
			pos.y = this.h - trimH; // y: bottom
		}

		if( flipX ) {
			Renderer.scaleCenter( copyCtx, -1, 1, { x: this.w / 2, y: this.h / 2 } );
		}

		copyCtx.drawImage(
			trimCanvas, 0, 0, trimW, trimH,
			pos.x, pos.y, trimW, trimH
		);

		return new Painting( level, copyCanvas, this._color, this._history.slice() );
	}


	/**
	 *
	 * @param {Painting?} painting
	 */
	loadPainting( painting ) {
		if( !painting ) {
			return;
		}

		this._color = painting.color;
		this._history = painting.history;
		this.repaintFromHistory();
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
		this.x = ( Renderer.drawWidth - this.w ) / 2;
		this.y = ( Renderer.drawHeight - this.h ) / 2;

		this._colorCheck();
	}


	/**
	 * Undo the last brush stroke.
	 * @returns {boolean} True if history length changed.
	 */
	undo() {
		const lenAtStart = this._history.length;
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

		return lenAtStart !== this._history.length;
	}


};
