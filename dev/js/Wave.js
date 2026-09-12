import { fontFamilySans } from './Config.js';
import { Enemy } from './Enemy.js';
import { Colors } from './MagicColors.js';
import { euclidDistance } from './MathUtils.js';
import { Renderer } from './Renderer.js';


export class Wave {


	index = 0;
	numFighters = 0;
	numTowers = 0;

	/** @type {import('./Enemy').Enemy[][]} */
	enemyWaves = [];

	/** @type {import('./Enemy').Enemy[]} */
	get enemies() {
		return this.enemyWaves[0] || [];
	}

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
	 * @param {number[]} nums
	 */
	createEnemies( nums ) {
		this.enemyWaves = [];

		const adjustEnemy = ( enemy, i ) => {
			enemy.baseAttackDamage += i + this.index;
			enemy.baseAttackSpeed -= i * 0.25;

			enemy.baseHealthMax += i * 5 + this.index * 2;
			enemy.health = enemy.baseHealthMax;

			enemy.baseMoveSpeed += i * 0.2;
		};

		for( let i = 0; i < nums.length; i++ ) {
			const num = nums[i];
			const wave = [];

			// Spawn from right only
			if( i === 0 ) {
				const stepY = Renderer.drawHeight / num;
				const offsetY = stepY / 2;

				for( let j = 0; j < num; j++ ) {
					const enemy = new Enemy(
						this.level,
						Renderer.drawWidth,
						offsetY + j * stepY - 30,
						60, 60
					);

					adjustEnemy( enemy, i );
					wave.push( enemy );
				}
			}
			// Spaw from top and bottom
			else if( i === 1 ) {
				const perSide = num / 2;

				for( let j = 0; j < perSide; j++ ) {
					const enemyTop = new Enemy(
						this.level,
						Renderer.drawWidth - 100 - j * 200,
						-60,
						60, 60
					);
					const enemyBottom = new Enemy(
						this.level,
						Renderer.drawWidth - 100 - j * 200,
						Renderer.drawHeight,
						60, 60
					);

					adjustEnemy( enemyTop, i );
					adjustEnemy( enemyBottom, i );
					wave.push( enemyTop, enemyBottom );
				}
			}
			// Spawn from right, top and bottom
			else {
				const perSide = num / 3;
				const stepY = Renderer.drawHeight / perSide;
				const offsetY = stepY / 2;

				for( let j = 0; j < perSide; j++ ) {
					const enemyRight = new Enemy(
						this.level,
						Renderer.drawWidth,
						offsetY + j * stepY - 30,
						60, 60
					);
					const enemyTop = new Enemy(
						this.level,
						Renderer.drawWidth - 100 - j * 200,
						-60,
						60, 60
					);
					const enemyBottom = new Enemy(
						this.level,
						Renderer.drawWidth - 100 - j * 200,
						Renderer.drawHeight,
						60, 60
					);

					adjustEnemy( enemyRight, i );
					adjustEnemy( enemyTop, i );
					adjustEnemy( enemyBottom, i );
					wave.push( enemyRight, enemyTop, enemyBottom );
				}
			}

			this.enemyWaves.push( wave );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		this.resetCtxStates( ctx );
		// Enemy units are drawn in the main level
	}


	/**
	 *
	 * @param {import('./LevelObject').LevelObject} lo
	 * @param {number?} range
	 * @param {import('./LevelObject').LevelObject[]} [ignore = []]
	 * @returns {[import('./Enemy').Enemy, number]}
	 */
	getClosestEnemy( lo, range, ignore = [] ) {
		const loCenter = lo.getCenter();

		let closestValue = range || Math.max( lo.enemyDetectionRange, lo.attackRange );
		let closestEnemy = null;

		for( let i = 0; i < this.enemies.length; i++ ) {
			const enemy = this.enemies[i];

			if( enemy === lo || enemy.health <= 0 || ignore.includes( enemy ) ) {
				continue;
			}

			const distance = euclidDistance( enemy.getCenter(), loCenter );

			if( distance <= closestValue ) {
				closestValue = distance;
				closestEnemy = enemy;

				// Towers should attack the closest enemy.
				// Fighters can attack the first one within attack range.
				if( !lo.isTower && closestValue <= lo.attackRange ) {
					break;
				}
			}
		}

		return [closestEnemy, closestValue];
	}


	/**
	 *
	 * @param {import('./LevelObject').LevelObject} lo
	 * @returns {[import('./Painting').Painting?, number]}
	 */
	getClosestPlayerUnit( lo ) {
		const loCenter = lo.getCenter();

		let closestValue = Math.max( lo.enemyDetectionRange, lo.attackRange );
		let closestUnit = null;

		const checkDistance = unit => {
			if( !unit || unit === lo || unit.health <= 0 ) {
				return;
			}

			const distance = euclidDistance( unit.getCenter(), loCenter );

			if( distance <= closestValue ) {
				closestValue = distance;
				closestUnit = unit;
			}
		};

		const isCloseEnough = distance => {
			return !lo.isTower && distance <= lo.attackRange;
		};

		checkDistance( this.level.unicornPainting );

		if( isCloseEnough( closestValue ) ) {
			return [closestUnit, closestValue];
		}

		for( let i = 0; i < this.level.fighters.length; i++ ) {
			const unit = this.level.fighters[i];
			checkDistance( unit );

			if( isCloseEnough( closestValue ) ) {
				return [closestUnit, closestValue];
			}
		}

		for( let i = 0; i < this.level.towers.length; i++ ) {
			const tower = this.level.towers[i];
			checkDistance( tower );

			if( isCloseEnough( closestValue ) ) {
				return [closestUnit, closestValue];
			}
		}

		return [closestUnit, closestValue];
	}


	/**
	 *
	 * @returns {boolean}
	 */
	isDone() {
		return (
			this.phase === Wave.PhaseFight &&
			this.enemyWaves.length === 0
		);
	}


	/**
	 *
	 */
	restart() {
		this.phase = Wave.PhasePrepare;
		this.enemyWaves = [];
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
	 * @param {number} dt
	 */
	update( dt ) {
		if( this.phase === Wave.PhaseFight ) {
			if( this.enemyWaves.length === 0 ) {
				return;
			}

			const wave = this.enemyWaves[0];

			for( let i = wave.length - 1; i >= 0; i-- ) {
				const enemy = wave[i];
				enemy.update( dt );

				if( enemy.health <= 0 && enemy.deathTimer?.elapsed() ) {
					wave.splice( i, 1 );
				}
			}

			if( wave.length === 0 ) {
				this.enemyWaves.splice( 0, 1 );
			}
		}
	}


};
