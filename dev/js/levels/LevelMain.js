import { Colors, fontFamilySerif } from '../Config.js';
import { Level } from '../Level.js';
import { isInside } from '../MathUtils.js';
import { PaintingArea } from '../PaintingArea.js';
import { Renderer } from '../Renderer.js';
import { UIButton } from '../UIButton.js';
import { Wave } from '../Wave.js';
import { Waves } from '../Waves.js';
import { LevelOutro } from './LevelOutro.js';


export class LevelMain extends Level {


	/** @type {import('../Painting').Painting[]} */
	fighters = [];

	/** @type {import('../Painting').Painting[]} */
	towers = [];

	/** @type {import('../Painting').Painting} */
	unicornPainting;

	/** @type {import('../Wave').Wave} */
	wave;


	/**
	 *
	 */
	constructor() {
		super();

		this.isGameOver = false;

		this.wave = Waves.getWave( this, 0 );
		this.numMaxFighters = this.wave.newFighters;
		this.numMaxTowers = this.wave.newTowers;

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
			// TODO: available fighter start areas
		];

		this._btnTryAgain = new UIButton(
			this,
			{
				w: 100,
				h: 40,
				text: 'Again',
			},
			() => {
				this.unicornPainting.health = 100;
				this.towers.forEach( t => t.reset() );
				this.fighters.forEach( f => f.reset() );
				this.wave.restart();

				// TODO: update MagicColor usages

				this.isGameOver = false;
			},
		);

		// TODO: remove, only used as shortcut in development
		this.unicornPainting = {
			health: 100,
			w: 80,
			h: 80,
			draw( ctx ) {
				ctx.fillStyle = Colors.White.color;
				ctx.fillRect( this.x, this.y, this.w, this.h );
			},
		};
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawGameOver( ctx ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		ctx.fillStyle = '#0000007f';
		ctx.fillRect( 0, 0, w, h );

		ctx.fillStyle = Colors.White.color;
		ctx.font = `500 56px ${fontFamilySerif}`;
		ctx.textAlign = 'center';
		ctx.fillText( 'Darkness covers all again', w / 2, h / 2 );

		this._btnTryAgain.x = ( w - this._btnTryAgain.w ) / 2;
		this._btnTryAgain.y = h / 2 + 122;
		this._btnTryAgain.draw( ctx );
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
			this._drawStartAreas( ctx );
		}

		this.unicornPainting.x = ( w - this.unicornPainting.w ) / 2;
		this.unicornPainting.y = ( h - this.unicornPainting.h ) / 2;
		this.unicornPainting.draw( ctx );

		this.towers.forEach( p => p.draw( ctx ) );
		this.fighters.forEach( p => p.draw( ctx ) );
		this.wave.draw( ctx );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawStartAreas( ctx ) {
		ctx.lineWidth = 2;
		ctx.strokeStyle = Colors.White.color;
		ctx.setLineDash( [5, 10] );

		if( this.numMaxTowers > 0 ) {
			this.towerBuildAreas.forEach( tba => {
				ctx.beginPath();
				ctx.roundRect( tba.x, tba.y, tba.w, tba.h, tba.h / 4 );
				ctx.closePath();
				ctx.stroke();
			} );
		}

		if( this.numMaxFighters > 0 ) {
			this.fighterStartAreas.forEach( fsa => {
				ctx.beginPath();
				ctx.arc( fsa.x + fsa.w / 2, fsa.y + fsa.h / 2, 0, Math.PI * 2 );
				ctx.closePath();
				ctx.stroke();
			} );
		}

		ctx.setLineDash( [] );
	}


	/**
	 *
	 * @private
	 * @param {function} cb
	 */
	_getItemForPainting( cb ) {
		this.paintingArea.clear();

		this.paintingArea.onDone = () => {
			const item = this.paintingArea.getPainting( this );
			this.paintingArea.clear();
			this.paintingArea.visible = false;

			cb( item );
		};
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

		painting.attackRange = 200;
		painting.enemyDetectionRange = painting.attackRange;

		const scale = area.w / painting.w;
		painting.w = area.w;
		painting.h *= scale;

		painting.x = area.x;
		painting.y = area.y + area.h - painting.h;

		this.towers.push( painting );
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
		if( this.isGameOver ) {
			if( isInside( pos, this._btnTryAgain ) ) {
				this._btnTryAgain.onClick();
			}

			return;
		}

		if( this.wave.phase === Wave.PhasePrepare ) {
			this.paintingArea.onClick( pos );

			if( !this.paintingArea.visible ) {
				const tba = this.towerBuildAreas.find( tba => isInside( pos, tba ) );

				if( tba ) {
					if( this.towers.length < this.numMaxTowers ) {
						this.paintingArea.onDone = () => {
							const newTower = this.paintingArea.getPainting( this );
							newTower.spawnLocation = this.towerBuildAreas.indexOf( tba );

							this._getItemForPainting( item => {
								newTower.item = item;
								this.addTower( newTower, tba );
							} );
						};

						this.paintingArea.visible = true;
					}
				}
				else {
					const fsa = this.fighterStartAreas.find( fsa => isInside( pos, fsa ) );

					if( fsa ) {
						if( this.fighters.length < this.numMaxFighters ) {
							this.paintingArea.onDone = () => {
								const newFighter = this.paintingArea.getPainting( this );
								newFighter.spawnLocation = this.fighterStartAreas.indexOf( fsa );

								this._getItemForPainting( item => {
									newFighter.item = item;
									this.addFighter( newFighter, fsa );
								} );
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
		this.paintingArea.brushDown( pos );
	}


	/**
	 * Mouse move event, but only if button:1 is **not** pressed.
	 * If button:1 is pressed, onMouseDrawing is instead called.
	 * @param {Position} pos
	 * @returns {boolean}
	 */
	onMouseMove( pos ) {
		if( this.isGameOver ) {
			this._btnTryAgain.isHovered = isInside( pos, this._btnTryAgain );

			return this._btnTryAgain.isHovered;
		}

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
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );

		if( this.isGameOver ) {
			return;
		}

		this.towers.forEach( o => o.update( dt ) );
		this.fighters.forEach( o => o.update( dt ) );
		this.wave.update( dt );

		// Game Over: The unicorn lost all health
		if(
			this.wave.phase === Wave.PhaseFight &&
			this.unicornPainting.health <= 0
		) {
			this.isGameOver = true;
			return;
		}

		if( this.wave.isDone() ) {
			this.wave = Waves.getWave( this, this.wave.index + 1 );
			this.numMaxFighters += this.wave.newFighters;
			this.numMaxTowers += this.wave.newTowers;

			this.towers.forEach( t => t.reset() );
			this.fighters.forEach( f => f.reset() );

			// Last wave done, proceed to outro
			if( !this.wave ) {
				const outro = new LevelOutro();
				outro.unicornPainting = this.unicornPainting;

				Renderer.changeLevel( outro );
			}
		}
	}


};
