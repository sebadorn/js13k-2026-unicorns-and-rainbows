import { removeItem } from '../ArrayUtils.js';
import { fontFamilySerif } from '../Config.js';
import { Level } from '../Level.js';
import { Colors } from '../MagicColors.js';
import { isInside } from '../MathUtils.js';
import { Painting } from '../Painting.js';
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

	/** @type {import('../Wave').Wave} */
	wave;


	/**
	 *
	 */
	constructor() {
		super();

		this._allUnits = [];

		this.wave = Waves.getWave( this, 0 );
		this.numMaxFighters = this.wave.numFighters;
		this.numMaxTowers = this.wave.numTowers;

		this.paintingArea = new PaintingArea(
			400, 400,
			() => {},
		);
		this.paintingArea.visible = false;

		this._setupStartAreas();

		this._btnTryAgain = new UIButton(
			{
				w: 100,
				h: 40,
				text: 'Again',
			},
			() => this._tryAgain(),
		);

		// TODO: remove, only used as shortcut in development
		const [tmpCanvas, tmpCtx] = Renderer.getOffscreenCanvas( 80, 80 );
		tmpCtx.fillStyle = Colors.White.color;
		tmpCtx.fillRect( 0, 0, 80, 80 );
		this.unicornPainting = new Painting( this, tmpCanvas, Colors.White );
		this.unicornPainting.isOnMap = true;
		this.unicornPainting.canMove = false;
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	_drawGameOver( ctxUI ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		ctxUI.fillStyle = '#0000007f';
		ctxUI.fillRect( 0, 0, w, h );

		ctxUI.fillStyle = Colors.White.color;
		ctxUI.font = `500 56px ${fontFamilySerif}`;
		ctxUI.textAlign = 'center';
		ctxUI.fillText( 'Darkness covers all again', w / 2, h / 2 );

		this._btnTryAgain.x = ( w - this._btnTryAgain.w ) / 2;
		this._btnTryAgain.y = h / 2 + 122;
		this._btnTryAgain.draw( ctxUI );
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	_drawMap( ctx, ctxUI ) {
		const w = Renderer.drawWidth;
		const h = Renderer.drawHeight;

		ctx.fillStyle = '#000';
		ctx.fillRect( 0, 0, w, h );

		if( this.wave.phase === Wave.PhasePrepare ) {
			this._drawStartAreas( ctx );
		}

		this.unicornPainting.x = 200;
		this.unicornPainting.y = ( h - this.unicornPainting.h ) / 2;
		this.unicornPainting.draw( ctx, ctxUI );

		this._allUnits.forEach( u => u.draw( ctx, ctxUI ) );
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
				ctx.arc( fsa.x + fsa.w / 2, fsa.y + fsa.h / 2, fsa.w / 2, 0, Math.PI * 2 );
				ctx.closePath();
				ctx.stroke();
			} );
		}

		ctx.setLineDash( [] );
	}


	/**
	 *
	 * @private
	 * @param {Function} cb
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
	 * @private
	 * @param {Position} pos
	 */
	_onClickCheckAreas( pos ) {
		const tba = this.towerBuildAreas.find( tba => isInside( pos, tba ) );

		if( tba ) {
			const index = this.towerBuildAreas.indexOf( tba );
			const existing = this.towers.find( t => t.spawnLocation === index );

			if( existing || this.towers.length < this.numMaxTowers ) {
				this.paintingArea.resize( 300, 500 );
				this.paintingArea.for = Painting.Tower;
				this.paintingArea.loadPainting( existing );
				this.paintingArea.visible = true;

				this.paintingArea.onDone = () => {
					existing?.freeColor();
					removeItem( this.towers, existing );

					const newTower = this.paintingArea.getPainting( this );
					newTower.spawnLocation = index;

					this.paintingArea.resize( 220, 220 );
					this.paintingArea.for = Painting.TowerItem;

					this._getItemForPainting( item => {
						this.addTower( newTower, tba );
						newTower.setItem( item );
					} );
				};
			}
		}
		else {
			const fsa = this.fighterStartAreas.find( fsa => isInside( pos, fsa ) );

			if( fsa ) {
				const index = this.fighterStartAreas.indexOf( fsa );
				const existing = this.fighters.find( f => f.spawnLocation === index );

				// Edit an existing one or add a new one (if under limit)
				if( existing || this.fighters.length < this.numMaxFighters ) {
					this.paintingArea.resize( 400, 400 );
					this.paintingArea.for = Painting.Fighter;
					this.paintingArea.loadPainting( existing );
					this.paintingArea.visible = true;

					this.paintingArea.onDone = () => {
						existing?.freeColor();
						removeItem( this.fighters, existing );

						const newFighter = this.paintingArea.getPainting( this );
						newFighter.spawnLocation = index;

						this.paintingArea.resize( 220, 400 );
						this.paintingArea.for = Painting.FighterItem;

						this._getItemForPainting( item => {
							this.addFighter( newFighter, fsa );
							newFighter.setItem( item );
						} );
					};
				}
			}
		}
	}


	/**
	 *
	 * @private
	 */
	_proceedToNextWaveOrLevel() {
		this.wave = Waves.getWave( this, this.wave.index + 1 );

		// Last wave done, proceed to outro
		if( !this.wave ) {
			const outro = new LevelOutro();
			outro.unicornPainting = this.unicornPainting;

			Renderer.changeLevel( outro );

			return;
		}

		this.numMaxFighters = this.wave.numFighters;
		this.numMaxTowers = this.wave.numTowers;

		this._allUnits = [];
		this.towers.forEach( t => t.reset() );
		this.fighters.forEach( f => f.reset() );
		this.unicornPainting.reset();
	}


	/**
	 *
	 * @private
	 */
	_setupStartAreas() {
		const dw = Renderer.drawWidth;
		const dh = Renderer.drawHeight;
		const tbaSize = 100;
		const fsaSize = 80;

		/** @type {Area[]} */
		this.towerBuildAreas = [
			{
				x: dw / 2 + 200,
				y: ( dh - tbaSize ) / 2,
				w: tbaSize,
				h: tbaSize,
			},
			{
				x: dw / 4 + 150,
				y: 250,
				w: tbaSize,
				h: tbaSize,
			},
			{
				x: dw / 4 + 150,
				y: dh - tbaSize - 250,
				w: tbaSize,
				h: tbaSize,
			},
		];

		/** @type {Area[]} */
		this.fighterStartAreas = [
			{
				x: dw / 2,
				y: 350,
				w: fsaSize,
				h: fsaSize,
			},
			{
				x: dw / 2,
				y: dh - fsaSize - 350,
				w: fsaSize,
				h: fsaSize,
			},
			{
				x: 400,
				y: 400,
				w: fsaSize,
				h: fsaSize,
			},
			{
				x: 400,
				y: dh - fsaSize - 400,
				w: fsaSize,
				h: fsaSize,
			},
		];
	}


	/**
	 *
	 * @private
	 */
	_tryAgain() {
		this._allUnits = [];

		for( let i = this.fighters.length - 1; i >= 0; i-- ) {
			const unit = this.fighters[i];

			if( unit.addedInWave === this.wave.index ) {
				this.fighters.splice( i, 1 );
				unit.freeColor();
			}
			else {
				unit.reset();
			}
		}

		for( let i = this.towers.length - 1; i >= 0; i-- ) {
			const unit = this.towers[i];

			if( unit.addedInWave === this.wave.index ) {
				this.towers.splice( i, 1 );
				unit.freeColor();
			}
			else {
				unit.reset();
			}
		}

		this.unicornPainting.health = 100;
		this.wave.restart();
		this.isGameOver = false;
	}


	/**
	 *
	 * @param {import('../Painting').Painting} painting
	 * @param {Area} area
	 */
	addFighter( painting, area ) {
		painting.addedInWave = this.wave.index;
		painting.isOnMap = true;
		painting.isTower = false;

		const newW = 100;
		const scale = newW / painting.w;
		painting.w = newW;
		painting.h *= scale;

		painting.x = area.x - ( newW - area.w ) / 2;
		painting.y = area.y - painting.h + area.h;

		this.fighters.push( painting );
	}


	/**
	 *
	 * @param {import('../Painting').Painting} painting
	 * @param {Area} area
	 */
	addTower( painting, area ) {
		painting.addedInWave = this.wave.index;
		painting.isOnMap = true;
		painting.isTower = true;
		painting.canMove = false;
		painting.enemyDetectionRange = painting.attackRange;

		const newW = area.w * 1.5;
		const scale = newW / painting.w;
		painting.w = newW;
		painting.h *= scale;

		painting.x = area.x - ( newW - area.w ) / 2;
		painting.y = area.y + area.h - painting.h;

		this.towers.push( painting );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( ctx, ctxUI ) {
		this._drawMap( ctx, ctxUI );

		if( this.isGameOver ) {
			this._drawGameOver( ctxUI );
			return;
		}

		this.paintingArea.draw( ctxUI );
	}


	/**
	 *
	 * @returns {boolean}
	 */
	hasAllUnits() {
		return (
			this.fighters.length === this.numMaxFighters &&
			this.towers.length === this.numMaxTowers
		);
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
		}
		else if( this.wave.phase === Wave.PhasePrepare ) {
			this.paintingArea.onClick( pos );

			if( !this.paintingArea.visible ) {
				this._onClickCheckAreas( pos );
			}
		}
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

		this.unicornPainting.update( dt );
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
			this._proceedToNextWaveOrLevel();
		}

		this._allUnits = this.towers.concat( this.fighters ).concat( this.wave.enemies );

		this._allUnits.sort( ( a, b ) => {
			return a.getCenter().y - b.getCenter().y;
		} );
	}


};
