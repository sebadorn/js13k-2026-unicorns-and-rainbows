import { Animation } from '../Animation.js';
import { removeItem } from '../ArrayUtils.js';
import { Colors, fontFamilySerif } from '../Config.js';
import { Level } from '../Level.js';
import { PaintingArea } from '../PaintingArea.js';
import { Renderer } from '../Renderer.js';


export class LevelOutro extends Level {


	/** @type {import('../Painting').Painting[]} */
	_paintings = [];

	/** @type {object[]} */
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
			200, 400,
			() => {
				this._paintings[this._step] = this.paintingArea.getPainting( this );
				this.paintingArea.clear();
				this.paintingArea.visible = false;
	
				this.animations.push( new Animation(
					this,
					2,
					progress => {
						// TODO:
					},
					anim => {
						removeItem( this.animations, anim );
						this._step++;

						if( this._step < this._steps.length ) {
							const stepInfo = this._steps[this._step];

							if( stepInfo?.color ) {
								this.paintingArea.changeColor( stepInfo.color );
								this.paintingArea.visible = true;
							}
						}
					},
				) );
			},
		);
		this.paintingArea.changeColor( this._steps[0].color );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawGrass( ctx ) {
		// TODO:
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawBirds( ctx ) {
		// TODO:
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawSun( ctx ) {
		// TODO:
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawYou( ctx ) {
		// TODO:
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} _ctxUI
	 */
	draw( ctx, _ctxUI ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		ctx.fillStyle = '#000';
		ctx.fillRect( 0, 0, w, h );

		if( this.step > 0 ) {
			this._drawGrass( ctx );
		}

		if( this.step > 1 ) {
			this._drawBirds( ctx );
		}

		if( this.step > 2 ) {
			this._drawSun( ctx );
		}

		if( this.step > 3 ) {
			this._drawYou( ctx );
		}

		if( this.step < this._steps.length ) {
			const stepInfo = this._steps[this._step];

			ctx.fillStyle = '#fff';
			ctx.textAlign = 'center';
			ctx.font = `500 32px ${fontFamilySerif}`;
			ctx.fillText( stepInfo.text, w / 2, this.paintingArea.y - 32 );

			this.paintingArea.draw( ctx );
		}
	}


};
