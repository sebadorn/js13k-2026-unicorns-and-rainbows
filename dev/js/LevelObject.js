import { Animation } from './Animation.js';
import { removeItem } from './ArrayUtils.js';
import { Audio } from './Audio.js';
import { fontFamilySans } from './Config.js';
import { Colors } from './MagicColors.js';
import { euclidDistance, lerp, normalizeVector } from './MathUtils.js';
import { Timer } from './Timer.js';


export class LevelObject {


	/** @type {import('../Animation').Animation[]} */
	animations = [];

	/** @type {import('./Painting').Painting?} */
	item = null;

	/** @type {LevelObject?} */
	target = null;

	/** @type {Position?} */
	targetStartPos = null;

	/** @type {Animation?} */
	attackAnimation = null;

	/** @type {Timer?} */
	deathTimer = null;

	/** @type {Animation?} */
	moveAnimation = null;


	static baseAttackDamage = 40;
	static baseAttackRange = 30;
	static baseAttackRangeTower = 300;
	static baseAttackSpeed = 1.5; // seconds between attacks
	static baseHealthMax = 100;
	static baseMoveSpeed = 1.75;


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 */
	constructor( level, x, y, w, h ) {
		this.level = level;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.baseAttackDamage = LevelObject.baseAttackDamage;
		this.baseAttackRange = LevelObject.baseAttackRange;
		this.baseAttackRangeTower = LevelObject.baseAttackRangeTower;
		this.baseAttackSpeed = LevelObject.baseAttackSpeed;
		this.baseHealthMax = LevelObject.baseHealthMax;
		this.baseMoveSpeed = LevelObject.baseMoveSpeed;

		this.canMove = true;
		this.color = Colors.Black;
		this.cooldownAttack = new Timer( level );
		this.damageTakenTimer = new Timer( level );
		this.effects = {
			isBurning: new Timer( level, 0 ),
			isShielded: new Timer( level, 0 ),
			isSlowed: new Timer( level, 0 ),
			isSpedUp: new Timer( level, 0 ),
			isStunned: new Timer( level, 0 ),
			isTaunted: new Timer( level, 0 ),
			isWeakened: new Timer( level, 0 ),
		};
		this.enemyDetectionRange = 300;
		this.health = 100;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackDamage() {
		if( this.item ) {
			return this.item.attackDamage + this.color.modAttackDamage;
		}

		if( this.color === Colors.Green ) {
			return -10;
		}

		return this.baseAttackDamage + this.color.modAttackDamage;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackRange() {
		const value = this.isTower ? this.baseAttackRangeTower : this.baseAttackRange;

		return value + this.color.modAttackRange;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackSpeed() {
		let speed = this.baseAttackSpeed + ( this.isTower ? 0 : this.color.modAttackSpeed );
		let f = 1;

		if( !this.effects.isSlowed.elapsed() ) {
			f += 0.5;
		}

		if( !this.effects.isSpedUp.elapsed() ) {
			f -= 0.25;
		}

		return speed + f;
	}


	/**
	 *
	 * @returns {number}
	 */
	get healthMax() {
		return this.baseHealthMax + this.color.modHealth;
	}


	/**
	 *
	 * @returns {number}
	 */
	get moveSpeed() {
		let speed = this.canMove ? this.baseMoveSpeed + this.color.modMoveSpeed : 0;
		let f = 1;

		if( !this.effects.isSlowed.elapsed() ) {
			f -= 0.75;
		}

		if( !this.effects.isSpedUp.elapsed() ) {
			f += 0.5;
		}

		return speed + f;
	}


	/**
	 *
	 */
	attack() {
		if(
			!this.target || this.target.health <= 0 ||
			this.health <= 0 ||
			!this.cooldownAttack.elapsed()
		) {
			return;
		}

		this.targetStartPos = this.target.getCenter();
		this.cooldownAttack.set( this.attackSpeed );

		if( !this.isTower && !this.isEnemy ) {
			Audio.play( Audio.fighterHit );
		}
		else if( this.isTower ) {
			if( this.color !== Colors.Yellow ) {
				Audio.play( Audio.towerHit );
			}
		}

		const attackTarget = this.target;

		this.attackAnimation = new Animation( {
			level: this.level,
			duration: 0.4,
			onDone: _ => {
				if( attackTarget.health > 0 ) {
					attackTarget.takeDamage( this.attackDamage, this.item?.color );
					this.triggerAbility( attackTarget );
				}

				this.attackAnimation = null;
			},
		} );
	}


	/**
	 *
	 */
	decideAction() {
		if( this.health <= 0 ) {
			this.target = null;
			return;
		}

		if( this.attackAnimation || !this.effects.isStunned.elapsed() ) {
			return;
		}

		let target;
		let distance;

		if( this.effects.isTaunted.elapsed() ) {
			this.taunter = null;
			[target, distance] = this.findTarget();
			this.target = target;
		}
		else {
			this.target = this.taunter;
			distance = euclidDistance( this.target.getCenter(), this.getCenter() );
		}

		if( !this.target ) {
			return;
		}

		// The distance is between the centers, but for attacks
		// we want to look at the distance between borders.
		if( distance <= this.attackRange + ( this.w + this.target.w ) / 2 ) {
			this.attack();
		}
		else {
			this.move();
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( _ctx, ctxUI ) {
		this.animations.forEach( a => a.draw( ctxUI ) );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	drawEffectTimers( ctx ) {
		const w = 58;
		const x = this.x + 1;
		let y = this.y - 9;

		const drawBar = ( p, c ) => {
			p = 1 - p;
			ctx.fillStyle = c.color;
			ctx.fillRect( x, y, p * w, 2 );
			y += 2;
		};

		if( !this.effects.isBurning.elapsed() ) {
			drawBar( this.effects.isBurning.progress(), Colors.Red );
		}

		if( !this.effects.isStunned.elapsed() ) {
			drawBar( this.effects.isStunned.progress(), Colors.Orange );
		}

		if( !this.effects.isSpedUp.elapsed() ) {
			drawBar( this.effects.isSpedUp.progress(), Colors.Yellow );
		}

		if( !this.effects.isSlowed.elapsed() ) {
			drawBar( this.effects.isSlowed.progress(), Colors.Cyan );
		}

		if( !this.effects.isShielded.elapsed() ) {
			drawBar( this.effects.isShielded.progress(), Colors.Blue );
		}

		if( !this.effects.isWeakened.elapsed() ) {
			drawBar( this.effects.isWeakened.progress(), Colors.Blue );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {string} color
	 */
	drawHealthBar( ctx, color ) {
		if( this.health === this.healthMax || this.deathTimer ) {
			return;
		}

		const height = 4;
		const maxWidth = 60;

		const x = this.x - ( maxWidth - this.w ) / 2;
		const y = this.y - 14;
		const percent = this.health / this.healthMax;

		ctx.save();

		ctx.beginPath();
		ctx.roundRect( x, y, maxWidth, height, height / 2 );
		ctx.clip();

		// background bar
		ctx.fillStyle = '#fff2';
		ctx.fillRect( x, y, maxWidth, height );

		// current state bar
		ctx.fillStyle = color;
		ctx.fillRect( x, y, percent * maxWidth, height );

		ctx.restore();
	}


	/**
	 *
	 * @returns {[LevelObject?, number]}
	 */
	findTarget() {
		const dmg = this.item ? this.item.attackDamage : this.attackDamage;

		if( dmg < 0 || this.isEnemy ) {
			return this.level.wave.getClosestPlayerUnit( this );
		}

		return this.level.wave.getClosestEnemy( this );
	}


	/**
	 *
	 * @returns {Position}
	 */
	getCenter() {
		// For towers assume a square base.
		return {
			x: this.x + this.w / 2,
			y: this.isTower ? this.y + this.h - this.w / 2 : this.y + this.h / 2,
		};
	}


	/**
	 *
	 */
	move() {
		if( this.moveAnimation || !this.target || this.isTower || !this.moveSpeed ) {
			return;
		}

		const moveTarget = this.target;

		this.moveAnimation = new Animation( {
			level: this.level,
			duration: 1,
			onUpdate: ( _progress, dt ) => {
				if( this.health <= 0 ) {
					this.moveAnimation = null;
					return;
				}

				const targetCenter = moveTarget.getCenter();

				const direction = normalizeVector( {
					x: targetCenter.x - this.x,
					y: targetCenter.y - this.y,
				} );

				const speed = this.moveSpeed * dt;
				let newX = this.x + direction.x * speed;
				let newY = this.y + direction.y * speed;

				// Try to keep a minimum distance to other enemies
				if( this.isEnemy ) {
					const newPos = {
						x: newX + this.w / 2,
						y: newY + this.h / 2,
					};

					const tooClose = this.level.wave.enemies.find( e => {
						return (
							e !== this &&
							this.x > e.x && // try to check only others in front
							euclidDistance( newPos, e.getCenter() ) < this.w / 3
						);
					} );

					if( tooClose ) {
						return;
					}
				}

				this.x = newX;
				this.y = newY;
			},
			onDone: _ => {
				this.moveAnimation = null;
			},
		} );
	}


	/**
	 *
	 */
	reset() {
		this.animations = [];
		this.attackAnimation = null;
		this.deathTimer = null;
		this.moveAnimation = null;
		this.health = this.healthMax;
		this.target = null;
	}


	/**
	 *
	 * @param {number} dmg
	 * @param {import('./MagicColors').MagicColor?} type
	 */
	takeDamage( dmg, type ) {
		if( this.health <= 0 ) {
			return;
		}

		let f = 1;

		if( !this.effects.isShielded.elapsed() && dmg > 0 ) {
			f -= 0.5;
		}

		if( !this.effects.isWeakened.elapsed() ) {
			f += 0.5;
		}

		dmg = Math.ceil( dmg * f );

		// Prevent over-healing
		this.health = Math.min( this.healthMax, this.health - dmg );

		if( this.health <= 0 ) {
			if( this.isTower ) {
				Audio.play( Audio.towerDestroyed );
			}
			else if( this.isEnemy ) {
				Audio.play( Audio.shriek );
			}
			else {
				Audio.play( Audio.fighterDestroyed );
			}

			this.deathTimer = new Timer( this.level, 1 );
		}

		const xStart = this.x + this.w * 0.8;
		const yStart = this.y;
		const yEnd = yStart - 60;
		let y = yStart;
		let alpha = 1;

		if( dmg > 0 ) {
			this.damageTakenTimer.set( 0.2 );
		}

		this.animations.push( new Animation( {
			level: this.level,
			duration: 1,
			onUpdate: progress => {
				y = lerp( yStart, yEnd, progress );
				alpha = 1 - progress;
			},
			onDraw: ctx => {
				ctx.globalAlpha = alpha;
				ctx.font = `500 14px ${fontFamilySans}`;
				ctx.fillStyle = type?.color || ( dmg > 0 ? Colors.White.color : Colors.Green.color );
				ctx.fillText( dmg, xStart, y );
				ctx.globalAlpha = 1;
			},
			onDone: a => removeItem( this.animations, a ),
		} ) );
	}


	/**
	 *
	 */
	triggerAbility() {}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.animations.forEach( a => a.update( dt ) );
		this.attackAnimation?.update( dt );
		this.moveAnimation?.update( dt );
	}


};
