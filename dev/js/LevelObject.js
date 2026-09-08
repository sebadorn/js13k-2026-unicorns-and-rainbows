import { Animation } from './Animation.js';
import { removeItem } from './ArrayUtils.js';
import { fontFamilySans } from './Config.js';
import { Colors } from './MagicColors.js';
import { lerp, normalizeVector, numAsSignedStr } from './MathUtils.js';
import { Timer } from './Timer.js';


export class LevelObject {


	/** @type {import('../Animation').Animation[]} */
	animations = [];

	/** @type {LevelObject?} */
	target = null;

	/** @type {Animation?} */
	attackAnimation = null;

	/** @type {Animation?} */
	moveAnimation = null;


	static baseAttackDamage = 10;

	static baseAttackRange = 20;
	static baseAttackRangeTower = 200;

	static baseAttackSpeed = 1; // seconds between attacks

	static baseHealthMax = 100;

	static baseMoveSpeed = 2;


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

		this.cooldownAttack = new Timer( level );
		this.enemyDetectionRange = 300;
		this.health = 100;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackDamage() {
		return LevelObject.baseAttackDamage;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackRange() {
		return LevelObject.baseAttackRange;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackSpeed() {
		return LevelObject.baseAttackSpeed;
	}


	/**
	 *
	 * @returns {number}
	 */
	get healthMax() {
		return LevelObject.baseHealthMax;
	}


	/**
	 *
	 * @returns {number}
	 */
	get moveSpeed() {
		return LevelObject.baseMoveSpeed;
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

		this.cooldownAttack.set( this.attackSpeed );

		this.attackAnimation = new Animation( {
			level: this.level,
			duration: 0.5,
			onDone: _ => {
				if( this.target && this.target.health > 0 ) {
					this.target.takeDamage( this.attackDamage );
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

		if( this.attackAnimation ) {
			return;
		}

		const [target, distance] = this.findTarget();
		this.target = target;

		if( distance <= this.attackRange ) {
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
	 * @param {string} color 
	 */
	drawHealthBar( ctx, color ) {
		if( this.health === this.healthMax ) {
			return;
		}

		const height = 6;
		const maxWidth = 80;

		const x = this.x - ( maxWidth - this.w ) / 2;
		const y = this.y - 10;
		const percent = this.health / this.healthMax;

		// background bar
		ctx.fillStyle = '#fff2';
		ctx.fillRect( x, y, maxWidth, height );

		// current state bar
		ctx.fillStyle = color;
		ctx.fillRect( x, y, percent * maxWidth, height );
	}


	/**
	 *
	 * @returns {[LevelObject?, number]}
	 */
	findTarget() {
		if( this.attackDamage < 0 || this.isEnemy ) {
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
		if( this.moveAnimation || !this.target || this.isTower ) {
			return;
		}

		this.moveAnimation = new Animation( {
			level: this.level,
			duration: 1,
			onUpdate: ( _progress, dt ) => {
				if( !this.target ) {
					this.moveAnimation = null;
					return;
				}
				
				const targetCenter = this.target.getCenter();

				const direction = normalizeVector( {
					x: targetCenter.x - this.x,
					y: targetCenter.y - this.y,
				} );

				const speed = this.moveSpeed * dt;
				this.x += direction.x * speed;
				this.y += direction.y * speed;
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
		this.moveAnimation = null;
		this.health = 100;
		this.target = null;
	}


	/**
	 *
	 * @param {number} dmg
	 */
	takeDamage( dmg ) {
		this.health -= dmg;

		const xStart = this.x + this.w * 0.8;
		const yStart = this.y;
		const yEnd = yStart - 60;
		let y = yStart;
		let alpha = 1;

		this.animations.push( new Animation( {
			level: this.level,
			duration: 1,
			onUpdate: progress => {
				y = lerp( yStart, yEnd, progress );
				alpha = 1 - progress * progress;
			},
			onDraw: ctx => {
				ctx.globalAlpha = alpha;
				ctx.font = `500 14px ${fontFamilySans}`;
				ctx.fillStyle = dmg > 0 ? Colors.Red.color : Colors.Green.color;
				ctx.fillText( numAsSignedStr( dmg ), xStart, y );
				ctx.globalAlpha = 1;
			},
			onDone: a => removeItem( this.animations, a ),
		} ) );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.animations.forEach( a => a.do( dt ) );
		this.attackAnimation?.do( dt );
		this.moveAnimation?.do( dt );
	}


};
