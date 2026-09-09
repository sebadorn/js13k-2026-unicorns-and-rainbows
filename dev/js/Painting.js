import { LevelObject } from './LevelObject.js';
import { lerp } from './MathUtils.js';
import { Renderer } from './Renderer.js';


export class Painting extends LevelObject {


	/** @type {HTMLCanvasElement} */
	canvas;

	/** @type {import('./MagicColors').MagicColor} */
	color;

	/** @type {import('./Painting').Painting?} */
	item = null;


	static Unspecific = 0;
	static Fighter = 1;
	static Tower = 2;
	static FighterItem = 3;
	static TowerItem = 4;


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {HTMLCanvasElement} canvas
	 * @param {import('./MagicColors').MagicColor} color
	 * @param {any[]} [history = []]
	 */
	constructor( level, canvas, color, history = [] ) {
		super( level, 0, 0, canvas.width, canvas.height );

		this.canvas = canvas;
		this.color = color;
		this.history = history;

		this.addedInWave = 0;
		this.spawnLocation = -1;
		this.isOnMap = false;
		this.isTower = false;

		this.health = this.healthMax;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackDamage() {
		if( this.item ) {
			return this.item.attackDamage;
		}

		return LevelObject.baseAttackDamage + this.color.modAttackDamage;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackRange() {
		const value = this.isTower ? LevelObject.baseAttackRangeTower : LevelObject.baseAttackRange;

		return value + this.color.modAttackRange;
	}


	/**
	 *
	 * @returns {number}
	 */
	get attackSpeed() {
		return LevelObject.baseAttackSpeed + this.color.modAttackSpeed;
	}


	/**
	 *
	 * @returns {number}
	 */
	get healthMax() {
		return LevelObject.baseHealthMax + this.color.modHealth;
	}


	/**
	 *
	 * @returns {number}
	 */
	get moveSpeed() {
		return this.canMove ? LevelObject.baseMoveSpeed + this.color.modMoveSpeed : 0;
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawProjectile( ctx ) {
		if( !this.isTower || !this.attackAnimation || !this.item || !this.target ) {
			return;
		}

		const progress = this.attackAnimation.timer.progress();

		const xStart = this.x + this.w / 2;
		// "this.w" is correct, the projectile is shot from the top and not the center
		const yStart = this.y + this.w / 2;

		const xEnd = this.target.x + this.target.w / 2;
		const yEnd = this.target.y + this.target.h / 2;

		const x = lerp( xStart, xEnd, progress );
		const y = lerp( yStart, yEnd, progress );

		ctx.drawImage(
			this.item.canvas,
			x, y,
			80, 80
		);
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawWeapon( ctx ) {
		if( !this.item || this.isTower ) {
			return;
		}

		let rotate = 0;
		let rotateCenter = null;

		if( this.attackAnimation ) {
			rotate = Math.sin( this.attackAnimation.timer.progress() * Math.PI ) * Math.PI / 2.5;
			rotateCenter = this.getCenter();
			rotateCenter.y += this.item.h / 2;
			Renderer.rotateCenter( ctx, rotate, rotateCenter );
		}

		ctx.drawImage(
			this.item.canvas,
			this.x + this.w * 0.9,
			this.y + this.h / 2 - this.item.h,
			this.item.w, this.item.h
		);

		if( rotate ) {
			Renderer.rotateCenter( ctx, -rotate, rotateCenter );
		}
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {CanvasRenderingContext2D} ctxUI
	 */
	draw( ctx, ctxUI ) {
		if( !this.isOnMap || this.health <= 0 ) {
			return;
		}

		super.draw( ctx, ctxUI );

		if( this !== this.level.unicornPainting ) {
			this.drawHealthBar( ctx, this.color.color );
		}

		let rotation = 0;
		let center = null;

		if( this.moveAnimation ) {
			rotation = Math.sin( this.level.timer / 10 ) / 5;
			center = this.getCenter();
			center.y += this.h / 2;

			Renderer.rotateCenter( ctx, rotation, center );
		}

		ctx.drawImage( this.canvas, this.x, this.y, this.w, this.h );

		this._drawWeapon( ctx );

		if( rotation ) {
			Renderer.rotateCenter( ctx, -rotation, center );
		}

		this._drawProjectile( ctx );
	}


	/**
	 *
	 */
	freeColor() {
		if( this.color ) {
			this.color.used = Math.max( 0, this.color.used - 1 );
		}

		this.item?.freeColor();
	}


	/**
	 *
	 */
	reset() {
		super.reset();

		if( !this.isTower && this.spawnLocation >= 0 ) {
			const fsa = this.level.fighterStartAreas[this.spawnLocation];

			if( fsa ) {
				this.x = fsa.x;
				this.y = fsa.y - this.h + fsa.h;
			}
		}
	}


	/**
	 *
	 * @param {Painting?} item
	 */
	setItem( item ) {
		this.item = item;

		if( item ) {
			const w = this.w / 2;
			const scale = w / item.w;

			item.w = w;
			item.h *= scale;
		}
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );

		if( !this.isOnMap || !this.level.wave ) {
			return;
		}

		this.decideAction();
	}


};
