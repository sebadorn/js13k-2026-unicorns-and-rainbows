import { Animation } from './Animation.js';
import { normalizeVector } from './MathUtils.js';
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

		this.attackDamage = 10;
		this.attackRange = 20;
		this.attackSpeed = 1; // seconds between attacks
		this.enemyDetectionRange = 300;
		this.health = 100;
		this.moveSpeed = 2;
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

		this.attackAnimation = new Animation(
			this.level,
			0.5,
			null,
			_ => {
				if( this.target && this.target.health > 0 ) {
					this.target.health -= this.attackDamage;
				}

				this.attackAnimation = null;
			},
		);
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

		if( !target ) {
			return;
		}

		if( this.isTower ) {
			this.attack();
		}
		else {
			if( distance <= this.attackRange ) {
				this.attack();
			}
			else {
				this.move();
			}
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} _ctx
	 */
	draw( _ctx ) {}


	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {string} color 
	 */
	drawHealthBar( ctx, color ) {
		if( this.health === 100 ) {
			return;
		}

		const height = 6;
		const maxWidth = 80;

		const x = this.x - ( maxWidth - this.w ) / 2;
		const y = this.y - 10;
		const percent = this.health / 100;

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
		if( this.moveAnimation || !this.target ) {
			return;
		}

		this.moveAnimation = new Animation(
			this.level,
			1,
			( _, dt ) => {
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
			_ => {
				this.moveAnimation = null;
			},
		);
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
	 * @param {number} dt
	 */
	update( dt ) {
		this.animations.forEach( a => a.do( dt ) );
		this.attackAnimation?.do( dt );
		this.moveAnimation?.do( dt );
	}


};
