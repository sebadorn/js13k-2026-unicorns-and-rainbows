import { LevelObject } from './LevelObject.js';
import { isInside } from './MathUtils.js';
import { PaintingArea } from './PaintingArea.js';
import { Renderer } from './Renderer.js';


export class UIOverlay {


	/** @type {PaintingArea?} */
	paintingArea;

	/** @type {import('./Painting').Painting[]} */
	paintings = [];

	/** @type {LevelObject[]} */
	_objects = [];


	/**
	 *
	 * @param {import('./Level').Level} level
	 */
	constructor( level ) {
		this.level = level;

		this._objects.push(
			new UIButton(
				level,
				{ x: 100, y: 100, w: 100, h: 40, text: 'Paint' },
				() => {
					this.paintingArea?.clear();
					this.paintingArea = new PaintingArea( 400, 140, 400, 600 );
				},
			),
			new UIButton(
				level,
				{ x: 100, y: 160, w: 100, h: 40, text: 'Save' },
				() => {
					const painting = this.paintingArea?.getPainting( this.level );
					this.addPainting( painting );
					this.paintingArea?.clear();
				},
			),
			...this._getColorButtons(),
		);
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawPaintingsList( ctx ) {
		if( this.paintings.length === 0 || !this.paintingArea ) {
			return;
		}

		const xBase = 200;
		const yBase = Renderer.drawHeight - 300;

		const w = 160;
		const scale = w / this.paintingArea.w;
		const h = this.paintingArea.h * scale;

		this.paintings.forEach( ( p, i ) => {
			let x = xBase + i * ( w + 50 );
			let y = yBase;

			ctx.lineWidth = 1;
			ctx.strokeStyle = '#fff';
			ctx.strokeRect( x, y, w, h );

			const pwScale = p.w * scale;
			const phScale = p.h * scale;

			x += ( w - pwScale ) / 2;
			y += h - phScale;

			ctx.drawImage( p.canvas, x, y, pwScale, phScale );
		} );
	}


	/**
	 *
	 * @private
	 * @returns {UIButton[]}
	 */
	_getColorButtons() {
		const colors = [
			'red',
			'orange',
			'yellow',
			'green',
			'cyan',
			'blue',
			'violet',
		];
		const y = 220;

		return colors.map( ( c, i ) => {
			return new UIButton(
				this.level,
				{
					x: 100,
					y: y + i * 25,
					w: 40,
					h: 20,
					color: c,
				},
				() => this.paintingArea?.changeColor( c ),
			);
		} );
	}


	/**
	 * Add a new painting to the selection.
	 * @param {import('./Painting'.Painting)?} painting
	 */
	addPainting( painting ) {
		if( painting ) {
			this.paintings.push( painting );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		if( this.paintingArea ) {
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 2;
			ctx.strokeRect( this.paintingArea.x, this.paintingArea.y, this.paintingArea.w, this.paintingArea.h );
			this.paintingArea.drawOnParent( ctx );
		}

		this._objects.forEach( o => o.draw( ctx ) );
		this._drawPaintingsList( ctx );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		this.paintingArea?.brushUp();

		for( let i = 0; i < this._objects.length; i++ ) {
			const o = this._objects[i];

			if( isInside( pos, o ) ) {
				o.onClick?.();
				return;
			}
		}
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onMouseDrawing( pos ) {
		this.paintingArea?.brushDown( pos );
	}


	/**
	 *
	 * @param {Position} _pos
	 */
	onMouseMove( _pos ) {
		this.paintingArea?.brushUp();
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this._objects.forEach( o => o.update( dt ) );
	}


};


class UIButton extends LevelObject {


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {object} options
	 * @param {number} options.x
	 * @param {number} options.y
	 * @param {number} options.w
	 * @param {number} options.h
	 * @param {string} options.color
	 * @param {string} options.text
	 * @param {function} onClick
	 */
	constructor( level, options, onClick ) {
		super( level, options.x, options.y, options.w, options.h );
		this.text = options.text;
		this.color = options.color || '#ddd';
		this._clickEvent = onClick;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.fillStyle = this.color;
		ctx.fillRect( this.x, this.y, this.w, this.h );

		if( this.text ) {
			ctx.fillStyle = '#000';
			ctx.textAlign = 'center';
			ctx.fillText( this.text, this.x + this.w / 2, this.y + this.h / 2 );
		}
	}


	/**
	 *
	 */
	onClick() {
		this._clickEvent?.();
	}


};
