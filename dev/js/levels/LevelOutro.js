import { Animation } from '../Animation.js';
import { removeItem } from '../ArrayUtils.js';
import { fontFamilySerif } from '../Config.js';
import { Level } from '../Level.js';
import { Colors } from '../MagicColors.js';
import { randInt } from '../MathUtils.js';
import { Painting } from '../Painting.js';
import { PaintingArea } from '../PaintingArea.js';
import { Renderer } from '../Renderer.js';
import { Timer } from '../Timer.js';


export class LevelOutro extends Level {


	/** @type {Animation[]} */
	animations = [];

	/** @type {import('../Painting').Painting[]} */
	_paintings = [];

	/** @type {Timer[]} */
	_timers = [];

	/** @type {Object[]} */
	_steps = [
		{ text: 'What did grass look like?', color: Colors.Green },
		{ text: 'A bird, flying in the sky.', color: Colors.Blue },
		{ text: 'The sun shedding warmth.', color: Colors.Yellow },
		{ text: 'You', color: Colors.White },
	];


	/**
	 *
	 */
	constructor() {
		super();

		this._step = 0;

		this.paintingArea = new PaintingArea(
			Renderer.drawWidth / 2 - 100,
			Renderer.drawHeight / 2 - 200,
			200, 200,
			() => {
				this._paintings[this._step] = this.paintingArea.getPainting( this );
				this.paintingArea.clear();
				this.paintingArea.visible = false;

				this._timers[this._step] = new Timer( this, 6 );
	
				this.animations.push( new Animation( {
					level: this,
					duration: 2,
					onDone: a => {
						removeItem( this.animations, a );
						this._step++;

						if( this._step < this._steps.length ) {
							const stepInfo = this._steps[this._step];

							if( stepInfo?.color ) {
								this.paintingArea.changeColor( stepInfo.color );
								this.paintingArea.visible = true;
							}
						}
					},
				} ) );
			},
		);
		this.paintingArea.showColorSelection = false;
		this.paintingArea.changeColor( this._steps[0].color );

		// TODO: remove, only used as shortcut in development
		const [tmpCanvas, tmpCtx] = Renderer.getOffscreenCanvas( 80, 80 );
		tmpCtx.fillStyle = Colors.White.color;
		tmpCtx.fillRect( 0, 0, 80, 80 );
		this.unicornPainting = new Painting( this, tmpCanvas, Colors.White );
		this.unicornPainting.isOnMap = true;
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawGrass( ctx ) {
		const index = 0;
		const painting = this._paintings[index];

		if( !painting ) {
			return;
		}

		const progress = this._timers[index].progress();
		const step = 6;
		const size = 40;
		const tilesX = Renderer.drawWidth / size;
		const tilesY = Renderer.drawHeight / size;

		for( let y = 0; y < tilesY; y += step ) {
			ctx.globalAlpha = Math.min( 1, progress * y / tilesY + progress );

			for( let x = 0; x < tilesX; x += step ) {
				const xi = x * size - ( y % ( step + step ) ) * size / 2;
				const yi = y * size;

				ctx.drawImage(
					painting.canvas,
					xi, yi,
					size, size
				);
			}

			ctx.globalAlpha = 1;
		}
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawBirds( ctx ) {
		const index = 1;
		const painting = this._paintings[index];

		if( !painting ) {
			return;
		}
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawSun( ctx ) {
		const index = 2;
		const painting = this._paintings[index];

		if( !painting ) {
			return;
		}
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawYou( ctx ) {
		const index = 3;
		const painting = this._paintings[index];

		if( !painting ) {
			return;
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} _ctxUI
	 */
	draw( ctx, ctxUI ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		ctx.fillStyle = '#000';
		ctx.fillRect( 0, 0, w, h );

		this._drawGrass( ctx );
		this._drawBirds( ctx );
		this._drawSun( ctx );
		this._drawYou( ctx );

		if( this._step < this._steps.length ) {
			const stepInfo = this._steps[this._step];

			ctx.fillStyle = '#fff';
			ctx.textAlign = 'center';
			ctx.font = `500 32px ${fontFamilySerif}`;
			ctx.fillText( stepInfo.text, w / 2, this.paintingArea.y - 32 );

			this.paintingArea.draw( ctxUI );
		}

		this.animations.forEach( a => a.draw( ctx ) );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		this.paintingArea.onClick( pos );
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		return this.paintingArea.onMouseMove( pos );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );

		this.animations.forEach( a => a.update( dt ) );
		this.unicornPainting.update( dt );
	}


};
