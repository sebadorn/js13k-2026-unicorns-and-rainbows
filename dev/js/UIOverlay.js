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

	_showPaintingArea = false;


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
					this._showPaintingArea = true;
				},
			),
			new UIButton(
				level,
				{ x: 100, y: 160, w: 100, h: 40, text: 'Save' },
				() => {
					const painting = this.paintingArea?.getPainting( this.level );
					this.addPainting( painting );
					this.paintingArea?.clear();
					this._showPaintingArea = false;
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

		const xBase = 400;
		const yBase = Renderer.drawHeight - 260;

		const w = 160;
		const scale = w / this.paintingArea.w;
		const h = this.paintingArea.h * scale;

		this.paintings.forEach( ( p, i ) => {
			let x = xBase + i * ( w + 50 );
			let y = yBase;

			ctx.lineWidth = 1;
			ctx.strokeStyle = '#fff';
			ctx.strokeRect( x, y, w, h );

			// Update painting hitBox for check in onClick()
			p.galleryHitBox.x = x;
			p.galleryHitBox.y = y;
			p.galleryHitBox.w = w;
			p.galleryHitBox.h = h;

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
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawUnicorn( ctx ) {
		const height = Renderer.drawHeight;

		// Dark circle background
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.arc( 0, height, 300, 0, Math.PI * 2 );
		ctx.closePath();
		ctx.fill();

		// Unicorn head form
		ctx.fillStyle = '#fff';

		ctx.beginPath();
		ctx.moveTo( -2, height - 140 );
		ctx.lineTo( 100, height - 290 );
		ctx.lineTo( 240, height - 200 );
		ctx.lineTo( 140, height - 100 );
		ctx.lineTo( 150, height + 2 );
		ctx.lineTo( -2, height + 2 );
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		ctx.ellipse( 220, height - 200, 150, 90, Math.PI * 0.2, 0, Math.PI * 2 );
		ctx.closePath();
		ctx.fill();
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
		this._drawUnicorn( ctx );

		if( this._showPaintingArea && this.paintingArea ) {
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

		for( let i = 0; i < this.paintings.length; i++ ) {
			const p = this.paintings[i];

			if( isInside( pos, p.galleryHitBox ) ) {
				this.level.spawnPainting( p.shallowCopy() );
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
