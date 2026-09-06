import { Level } from '../Level.js';
import { isInside } from '../MathUtils.js';
import { PaintingArea } from '../PaintingArea.js';
import { Renderer } from '../Renderer.js';
import { Wave } from '../Wave';
import { Waves } from '../Waves.js';
import { LevelOutro } from './LevelOutro.js';


export class LevelMain extends Level {


	/** @type {import('../Painting').Painting[]} */
	fighters = [];

	/** @type {import('../Painting').Painting[]} */
	towers = [];

	/** @type {import('../Painting').Painting} */
	unicornPainting;

	unicornHealth = 100;

	/** @type {import('../Wave').Wave} */
	wave;


	/**
	 *
	 */
	constructor() {
		super();

		this.isGameOver = false;

		this.wave = Waves.getWave( this, 0 );
		this.numMaxTowers = this.wave.newTowers;
		this.numMaxFighters = this.wave.newFighters;

		this.paintingArea = new PaintingArea(
			Renderer.drawWidth / 2 - 250,
			Renderer.drawHeight / 2 - 250,
			500, 500,
			() => {},
		);
		this.paintingArea.visible = false;

		const dw = Renderer.drawWidth;
		const dh = Renderer.drawHeight;
		const tbaW = 100;
		const tbaH = 100;

		/** @type {Area[]} */
		this.towerBuildAreas = [
			{
				x: dw / 2 - tbaW - 100,
				y: dh / 2 - tbaH - 100,
				w: tbaW,
				h: tbaH,
			},
			{
				x: dw / 2 + 100,
				y: dh / 2 - tbaH - 100,
				w: tbaW,
				h: tbaH,
			},
			{
				x: dw / 2 - tbaW - 100,
				y: dh / 2 + 100,
				w: tbaW,
				h: tbaH,
			},
			{
				x: dw / 2 + 100,
				y: dh / 2 + 100,
				w: tbaW,
				h: tbaH,
			},
		];

		/** @type {Area[]} */
		this.fighterStartAreas = [
			// TODO:
		];
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	_drawGameOver( ctxUI ) {
		// TODO: "Game Over" text, e.g. "Darkness consumed all"
		// TODO: button to try again from the beginning of the last wave
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawMap( ctx ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		ctx.fillStyle = '#000';
		ctx.fillRect( 0, 0, w, h );

		if( this.wave.phase === Wave.PhasePrepare ) {
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#fff';

			if( this.numMaxTowers > 0 ) {
				this.towerBuildAreas.forEach( tba => {
					ctx.beginPath();
					ctx.roundRect( tba.x, tba.y, tba.w, tba.h, tba.h / 4 );
					ctx.closePath();
				} );
			}

			if( this.numMaxFighters > 0 ) {
				this.fighterStartAreas.forEach( fsa => {
					ctx.beginPath();
					ctx.arc( fsa.x + fsa.w / 2, fsa.y + fsa.h / 2, 0, Math.PI * 2 );
					ctx.closePath();
				} );
			}

			ctx.stroke();
		}

		if( this.unicornPainting ) {
			this.unicornPainting.x = ( w - this.unicornPainting.w ) / 2;
			this.unicornPainting.y = ( h - this.unicornPainting.h ) / 2;
			this.unicornPainting.draw( ctx );
		}
		// Fallback if there is no unicorn painting which should
		// only happen in development when skipping the intro.
		else {
			ctx.fillStyle = '#fff';
			ctx.fillRect( w / 2 - 50, h / 2 - 50, 100, 100 );
		}

		this.towers.forEach( p => p.draw( ctx ) );
		this.fighters.forEach( p => p.draw( ctx ) );
		this.wave.draw( ctx );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( ctx, ctxUI ) {
		this._drawMap( ctx );

		if( this.isGameOver ) {
			this._drawGameOver( ctxUI );
			return;
		}

		this.paintingArea.draw( ctxUI );
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onClick( pos ) {
		if( this.wave.phase === Wave.PhasePrepare ) {
			this.paintingArea.onClick( pos );

			if( !this.paintingArea.visible ) {
				const tba = this.towerBuildAreas.find( tba => isInside( pos, tba ) );

				if( tba ) {
					if( this.towers.length < this.numMaxTowers ) {
						this.paintingArea.onDone = () => {
							const painting = this.paintingArea.getPainting( this );
							this.addTower( painting, tba );

							this.paintingArea.clear();
							this.paintingArea.visible = false;
						};

						this.paintingArea.visible = true;
					}
				}
				else {
					const fsa = this.fighterStartAreas.find( fsa => isInside( pos, fsa ) );

					if( fsa ) {
						if( this.fighters.length < this.numMaxFighters ) {
							this.paintingArea.onDone = () => {
								const painting = this.paintingArea.getPainting( this );
								this.addFighter( painting );

								this.paintingArea.clear();
								this.paintingArea.visible = false;
							};

							this.paintingArea.visible = true;
						}
					}
				}
			}
		}
	}


	/**
	 *
	 * @param {Position} pos
	 */
	onMouseDrawing( pos ) {
		this.paintingArea.onMouseDrawing( pos );
	}


	/**
	 * Mouse move event, but only if button:1 is **not** pressed.
	 * If button:1 is pressed, onMouseDrawing is instead called.
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		if( this.wave.phase === Wave.PhasePrepare ) {
			if( this.paintingArea.visible ) {
				return this.paintingArea.onMouseMove( pos );
			}

			for( let i = 0; i < this.towerBuildAreas.length; i++ ) {
				const tba = this.towerBuildAreas[i];

				if( isInside( pos, tba ) ) {
					return true;
				}
			}

			for( let i = 0; i < this.fighterStartAreas.length; i++ ) {
				const fsa = this.fighterStartAreas[i];

				if( isInside( pos, fsa ) ) {
					return true;
				}
			}
		}

		return false;
	}


	/**
	 *
	 * @param {import('../Painting').Painting} painting
	 * @param {Area} area
	 */
	addFighter( painting, area ) {
		painting.isOnMap = true;
		painting.isTower = false;

		const scale = 80 / painting.w;
		painting.w = 80;
		painting.h *= scale;

		painting.x = area.x;
		painting.y = area.y;

		this.fighters.push( painting );
	}


	/**
	 *
	 * @param {import('../Painting').Painting} painting
	 * @param {Area} area
	 */
	addTower( painting, area ) {
		painting.isOnMap = true;
		painting.isTower = true;

		const scale = area.w / painting.w;
		painting.w = area.w;
		painting.h *= scale;

		painting.x = area.x;
		painting.y = area.y + area.h - painting.h;

		this.towers.push( painting );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );

		this.towers.forEach( o => o.update( dt ) );
		this.fighters.forEach( o => o.update( dt ) );
		this.wave.update( dt );

		// Game Over: Either the unicorn lost all health or all units have been destroyed
		if(
			this.unicornHealth <= 0 ||
			( this.towers.length === 0 && this.fighters.length === 0 )
		) {
			this.isGameOver = true;
			return;
		}

		if( this.wave.isDone() ) {
			this.wave = Waves.getWave( this, this.wave.index + 1 );

			// TODO: reset health of all surviving towers and fighters?
			// TODO: reset position of all fighters

			// Last wave done, proceed to outro
			if( !this.wave ) {
				const outro = new LevelOutro();
				outro.unicornPainting = this.unicornPainting;

				Renderer.changeLevel( outro );
			}
		}
	}


};
