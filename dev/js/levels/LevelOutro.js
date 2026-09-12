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
		{ text: 'What did grass look like?', color: Colors.Green, timer: 6 },
		{ text: 'A bird, flying in the sky', color: Colors.Orange },
		{ text: 'The sun smiling down', color: Colors.Yellow, timer: 4 },
		{ text: 'You', color: Colors.White, type: Painting.Tower, timer: 6 },
	];

	_translateY = 0;


	/**
	 *
	 */
	constructor() {
		super();

		this._step = 0;

		this.paintingArea = new PaintingArea(
			220, 220,
			() => {
				const stepData = this._steps[this._step];

				this._paintings[this._step] = this.paintingArea.getPainting( this, this._step === 2 );
				this.paintingArea.clear();
				this.paintingArea.visible = false;

				this._timers[this._step] = new Timer( this, stepData.timer || 0 );
	
				this.animations.push( new Animation( {
					level: this,
					duration: 3,
					onDone: a => {
						removeItem( this.animations, a );
						this._step++;

						if( this._step < this._steps.length ) {
							const stepData = this._steps[this._step];

							if( stepData?.color ) {
								this.paintingArea.changeColor( stepData.color );
								this.paintingArea.for = stepData.type || Painting.Unspecific;
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
		const [tmpCanvas, tmpCtx] = Renderer.getOffscreenCanvas( 180, 180 );
		tmpCtx.fillStyle = Colors.White.color;
		tmpCtx.fillRect( 0, 0, 180, 180 );
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
		const step = 1.5;
		const size = 80;
		const tilesX = Renderer.drawWidth / size;
		const tilesY = Renderer.drawHeight / size;

		for( let y = 0; y < tilesY; y += step ) {
			ctx.globalAlpha = Math.min( 1, progress * y / tilesY + progress );

			for( let x = 0; x < tilesX; x += step ) {
				const xi = x * size - ( y % ( step + step ) ) * size / 2;
				const yi = y * size + this._translateY;
				const c = {
					x: xi + size / 2,
					y: yi + size / 2,
				};
				const rotation = ( Math.sin( this.timer / 150 ) + 1 ) / 2 * Math.PI / 12;

				Renderer.rotateCenter( ctx, rotation, c );
				ctx.drawImage( painting.canvas, xi, yi, size, size );
				Renderer.rotateCenter( ctx, -rotation, c );
			}

			ctx.globalAlpha = 1;
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

		if( this._translateY > 0 ) {
			ctx.fillStyle = '#19c';
			ctx.fillRect( 0, 0, Renderer.drawWidth, this._translateY );
		}

		ctx.globalAlpha = this._timers[index].progress();
		ctx.drawImage( painting.canvas, Renderer.drawWidth - 220, 0, 220, 220 );
		ctx.globalAlpha = 1;
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

		const x = ( Renderer.drawWidth - painting.w ) / 2;
		const y = this._translateY - painting.h;

		ctx.lineWidth = 24;

		// Rainbow
		Object.values( Colors ).reverse().forEach( ( c, i ) => {
			if( c.hidden ) {
				return;
			}

			ctx.strokeStyle = c.color;
			ctx.beginPath();
			ctx.arc( Renderer.drawWidth / 2, this._translateY, 220 + i * 23, Math.PI, 0 );
			ctx.stroke();
		} );

		ctx.fillStyle = Colors.White.color;
		ctx.font = `600 italic 56px ${fontFamilySerif}`;
		ctx.textAlign = 'center';
		ctx.shadowColor = Colors.Black.color;
		ctx.shadowBlur = 16;
		ctx.fillText(
			'Thanks for playing!',
			Renderer.drawWidth / 2,
			y - 100 + Math.sin( this.timer / 50 ) * 5
		);
		ctx.shadowBlur = 0;

		// You
		ctx.drawImage( painting.canvas, x, y, painting.w, painting.h );

		if( this._timers[3] ) {
			const progress = this._timers[3].progress();
			this.unicornPainting.x = progress * x - this.unicornPainting.w;
			this.unicornPainting.y = this._translateY - this.unicornPainting.h;
			this.unicornPainting.draw( ctx );
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

		ctx.fillStyle = Colors.Black.color;
		ctx.fillRect( 0, 0, w, h );

		if( this._step === 0 && !this._timers[0] ) {
			const texts = [
				'An emptiness to fill',
				'An old world to recreate',
				'A clean canvas to paint',
			];
			const index = Math.round( this.timer / 400 ) % texts.length;

			ctx.font = `500 26px ${fontFamilySerif}`;
			ctx.textAlign = 'center';
			ctx.fillStyle = '#777';
			ctx.fillText( texts[index], Renderer.drawWidth / 2, Renderer.drawHeight * 0.8 );
		}

		this._drawGrass( ctx );
		this._drawSun( ctx );
		this._drawYou( ctx );

		if( this._step < this._steps.length ) {
			const stepInfo = this._steps[this._step];

			if( !this._paintings[this._step] ) {
				this.paintingArea.title = stepInfo.text;
			}

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

		// Workaround for bg color not being set due to level transition
		if( this._step === 0 ) {
			const color = this._steps[0].color;

			if( !document.body.classList.contains( 'c_' + color.id ) ) {
				Renderer.changeBgColor( color );
			}
		}

		if( this._paintings[1] && this._timers[1]?.elapsed() ) {
			const bird = this._paintings[1];
			const yStart = randInt( 0, Renderer.drawHeight );
			let x = 0;
			let y = yStart;

			this._timers[1].set( 4 );

			this.animations.push( new Animation( {
				level: this,
				duration: 4,
				onDraw: ctx => {
					ctx.drawImage( bird.canvas, x, y, 100, 100 );
				},
				onUpdate: progress => {
					x = progress * Renderer.drawWidth;
					y = yStart + Math.sin( progress * Math.PI * 6 ) * 30;
				},
				onDone: a => {
					removeItem( this.animations, a );
				},
			} ) );
		}

		if( this._timers[3] ) {
			this._translateY = this._timers[3].progress() * Renderer.drawHeight * 0.4;
		}

		this.animations.forEach( a => a.update( dt ) );
		this.unicornPainting.update( dt );
	}


};
