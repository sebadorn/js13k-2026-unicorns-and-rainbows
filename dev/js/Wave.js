import { Colors, fontFamilySans } from './Config.js';
import { euclidDistance } from './MathUtils.js';


export class Wave {


	index = 0;
	newFighters = 0;
	newTowers = 0;

	/** @type {import('./Enemy').Enemy[]} */
	enemies = [];

	static PhasePrepare = 1;
	static PhaseFight = 2;


	/**
	 *
	 * @param {import('./levels/LevelMain').LevelMain} level
	 */
	constructor( level ) {
		this.level = level;
		this.phase = Wave.PhasePrepare;
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		this.resetCtxStates( ctx );
		this.enemies.forEach( e => e.draw( ctx ) );
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {import('./LevelObject').LevelObject}
	 */
	getClosestEnemy( pos ) {
		let closestValue = Infinity;
		let closestEnemy = null;

		for( let i = 0; i < this.enemies.length; i++ ) {
			const enemy = this.enemies[i];
			const distance = euclidDistance( enemy, pos );

			if( distance < closestValue ) {
				closestValue = distance;
				closestEnemy = enemy;

				// TODO: use better value, better consider attack distance
				// Close enough already, stop searching
				if( closestValue < 10 ) {
					break;
				}
			}
		}

		return closestEnemy;
	}


	/**
	 *
	 * @param {Position} pos
	 * @returns {import('./Painting').Painting?}
	 */
	getClosestPlayerUnit( pos ) {
		let closestValue = Infinity;
		let closestUnit = null;

		const checkDistance = unit => {
			if( !unit ) {
				return;
			}

			const distance = euclidDistance( unit, pos );

			if( distance < closestValue ) {
				closestValue = distance;
				closestUnit = unit;
			}
		};

		const isCloseEnough = distance => {
			// TODO: use better value, better consider attack distance
			return distance < 10;
		};

		checkDistance( this.level.unicornPainting );

		if( isCloseEnough( closestValue ) ) {
			return closestUnit;
		}

		for( let i = 0; i < this.level.fighters.length; i++ ) {
			const unit = this.level.fighters[i];
			checkDistance( unit );

			if( isCloseEnough( closestValue ) ) {
				return closestUnit;
			}
		}

		for( let i = 0; i < this.level.towers.length; i++ ) {
			const tower = this.level.towers[i];
			checkDistance( tower );

			if( isCloseEnough( closestValue ) ) {
				return closestUnit;
			}
		}

		return closestUnit;
	}


	/**
	 *
	 * @returns {boolean}
	 */
	isDone() {
		return (
			this.phase === Wave.PhaseFight &&
			this.enemies.length === 0
		);
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	resetCtxStates( ctx ) {
		ctx.fillStyle = Colors.White.color;
		ctx.font = `500 26px ${fontFamilySans}`;
		ctx.lineWidth = 2;
		ctx.shadowBlur = 0;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
	}


	/**
	 *
	 * @param {number} _dt
	 */
	update( dt ) {
		if( this.phase === Wave.PhaseFight ) {
			this.enemies.forEach( e => e.update( dt ) );
		}
	}


};
