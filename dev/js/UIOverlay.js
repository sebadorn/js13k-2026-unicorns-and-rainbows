import { LevelObject } from './LevelObject.js';
import { isInside } from './MathUtils.js';
import { PaintingArea } from './PaintingArea.js';
import { Renderer } from './Renderer.js';


export class UIOverlay {


	/** @type {PaintingArea} */
	paintingArea;

	/** @type {import('./Painting').Painting[]} */
	paintings = [];


	/**
	 *
	 * @param {import('./Level').Level} level
	 */
	constructor( level ) {
		this.level = level;

		this.paintingArea = new PaintingArea(
			Renderer.drawWidth / 2 - 250,
			Renderer.drawHeight / 2 - 250,
			500, 500,
			() => {
				const painting = this.paintingArea.getPainting( this.level );
				this.addPainting( painting );
				this.paintingArea.clear();
				this.paintingArea.visible = false;
			},
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
		this.paintingArea?.drawOnParent( ctx );
		this._drawPaintingsList( ctx );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		if(
			this.paintingArea?.visible &&
			isInside( pos, this.paintingArea )
		) {
			this.paintingArea.brushDown( pos );
			this.paintingArea?.brushUp();

			return;
		}

		this.paintingArea?.brushUp();
		this.paintingArea?.onClick( pos );

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


};


export class UIButton extends LevelObject {


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
		super( level, options.x || 0, options.y || 0, options.w, options.h );
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
