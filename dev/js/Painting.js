import { Animation } from './Animation.js';
import { removeItem } from './ArrayUtils.js';
import { Audio } from './Audio.js';
import { LevelObject } from './LevelObject.js';
import { Colors } from './MagicColors.js';
import { euclidDistance, lerp, randInt } from './MathUtils.js';
import { Renderer } from './Renderer.js';
import { Timer } from './Timer.js';
import { Wave } from './Wave.js';


export class Painting extends LevelObject {


	/** @type {HTMLCanvasElement} */
	canvas;


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

		this.abilityCooldown = new Timer( level, 5 );
		this.health = this.healthMax;
	}


	/**
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} ctx
	 */
	_drawProjectile( ctx ) {
		if( !this.isTower || !this.attackAnimation || !this.item || !this.targetStartPos ) {
			return;
		}

		const projectileSize = 80;
		const progress = this.attackAnimation.timer.progress();

		const xStart = this.x + this.w / 2 - projectileSize / 2;
		// "this.w" is correct, the projectile is shot from the top and not the center
		const yStart = this.y + this.w / 2 - projectileSize / 2;

		const xEnd = this.targetStartPos.x - projectileSize / 2;
		const yEnd = this.targetStartPos.y - projectileSize / 2;

		const x = lerp( xStart, xEnd, progress );
		const y = lerp( yStart, yEnd, progress );

		const scaleX = xEnd < xStart ? -1 : 1;

		if( scaleX === -1 ) {
			Renderer.scaleCenter( ctx, scaleX, 1, { x, y } );
		}

		ctx.drawImage(
			this.item.canvas,
			x, y,
			projectileSize, projectileSize
		);

		if( scaleX === -1 ) {
			Renderer.scaleCenter( ctx, scaleX, 1, { x, y } );
		}
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
		if( !this.isOnMap || this.deathTimer?.elapsed() ) {
			return;
		}

		super.draw( ctx, ctxUI );
		this.drawHealthBar( ctx, this.color.color );

		let y = this.y;
		let h = this.h;
		let rotation = 0;
		let center = null;

		if( this.deathTimer ) {
			let progress = this.deathTimer.progress();
			ctx.globalAlpha = 1 - progress;

			if( this.isTower ) {
				progress *= progress;
				y += h * progress;
				h *= 1 - progress;
			}
			else {
				rotation = progress * Math.PI / 2;
				center = this.getCenter();
			}
		}
		else if( this.moveAnimation ) {
			rotation = Math.sin( this.level.timer / 10 ) / 5;
			center = this.getCenter();
			center.y += h / 2;
		}

		if( rotation ) {
			Renderer.rotateCenter( ctx, rotation, center );
		}

		ctx.drawImage( this.canvas, this.x, y, this.w, h );

		this._drawWeapon( ctx );

		if( rotation ) {
			Renderer.rotateCenter( ctx, -rotation, center );
		}

		this._drawProjectile( ctx );

		ctx.globalAlpha = 1;
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
				this.x = fsa.x - ( this.w - fsa.w ) / 2;
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
	 * @private
	 * @param {LevelObject?} target
	 * @returns {boolean}
	 */
	_abilityBurn( target ) {
		const burnDamage = 10;

		// Damage all enemies in range
		if( !target && this.isTower ) {
			const center = this.getCenter();

			this.level.wave.enemies.forEach( e => {
				if( euclidDistance( center, e.getCenter() ) <= this.attackRange + e.w / 2 ) {
					// Repeating burn damage
					for( let i = 1; i <= 3; i++ ) {
						e.animations.push( new Animation( {
							level: this.level,
							duration: i,
							onDone: a => {
								Audio.play( Audio.burnDmg );
								e.takeDamage( burnDamage / 2, Colors.Red );
								removeItem( e.animations, a );
							},
						} ) );
					}
				}
			} );

			this._drawEffectArea( center );

			return true;
		}

		if( target ) {
			// Repeating burn damage
			for( let i = 1; i <= 5; i++ ) {
				target.animations.push( new Animation( {
					level: this.level,
					duration: i,
					onDone: a => {
						Audio.play( Audio.burnDmg );
						target.takeDamage( burnDamage, Colors.Red );
						removeItem( target.animations, a );
					},
				} ) );
			}
		}

		return false;
	}


	/**
	 *
	 * @private
	 * @param {LevelObject?} target
	 * @returns {boolean}
	 */
	_abilityHeal( target ) {
		if( target ) {
			// Healing happens as part of normal attack
			return false;
		}

		const heal = -10;

		// Heal all allies in range
		if( this.isTower ) {
			const center = this.getCenter();

			this.level.fighters.forEach( f => {
				if( euclidDistance( center, f.getCenter() ) <= this.attackRange + f.w / 2 ) {
					f.takeDamage( heal, Colors.Green );
				}
			} );

			this._drawEffectArea( center );
		}
		// Heal self
		else {
			this.takeDamage( heal * 3, Colors.Green );
		}

		return true;
	}


	/**
	 *
	 * @private
	 * @param {LevelObject?} target
	 * @returns {boolean}
	 */
	_abilityLightning( target ) {
		if( !target && this.isTower ) {
			const center = this.getCenter();

			this.level.fighters.forEach( f => {
				if( euclidDistance( center, f.getCenter() ) <= this.attackRange + f.w / 2 ) {
					if( f.effects.isSpedUp.left() < 2 ) {
						f.effects.isSpedUp.set( 2 );
					}
				}
			} );

			this._drawEffectArea( center );

			return true;
		}

		if( target ) {
			const numTargets = 3;
			const targets = [];
			let current = target;

			for( let i = 0; i < numTargets; i++ ) {
				const [close, _distance] = this.level.wave.getClosestEnemy( current, 200, targets );

				if( close ) {
					targets.push( close );
					current = close;
				}
				else {
					break;
				}
			}

			this.animations.push( new Animation( {
				level: this.level,
				duration: 0.2,
				onDraw: ( ctx, progress ) => {
					ctx.globalAlpha = Math.sin( progress * Math.PI );
					ctx.strokeStyle = Colors.Yellow.color;
					ctx.lineCap = 'butt';
					ctx.lineJoin = 'round';
					ctx.lineWidth = 3;
					ctx.beginPath();

					const c = target.getCenter();
					ctx.moveTo( c.x, c.y );

					targets.forEach( t => {
						const c = t.getCenter();
						ctx.lineTo( c.x, c.y );
					} );

					ctx.stroke();
					ctx.globalAlpha = 1;
				},
				onDone: a => {
					Audio.play( Audio.lightning );
					target.takeDamage( 10, Colors.Yellow );
					targets.forEach( t => t.takeDamage( 5, Colors.Yellow ) );

					removeItem( this.animations, a );
				},
			} ) );
		}

		return false;
	}


	/**
	 *
	 * @private
	 * @param {LevelObject?} target
	 * @returns {boolean}
	 */
	_abilityShield( target ) {
		if( !target ) {
			const center = this.getCenter();

			if( this.isTower ) {
				this.level.fighters.forEach( f => {
					if( euclidDistance( center, f.getCenter() ) <= this.attackRange + f.w / 2 ) {
						if( f.effects.isShielded.left() < 2 ) {
							f.effects.isShielded.set( 2 );
						}
					}
				} );

				this._drawEffectArea( center );
			}
			else {
				if( this.effects.isShielded.left() < 4 ) {
					this.effects.isShielded.set( 4 );
				}
			}

			return true;
		}

		if( target ) {
			if( target.effects.isWeakened.left() < 3 ) {
				target.effects.isWeakened.set( 3 );
			}
		}

		return false;
	}


	/**
	 *
	 * @private
	 * @param {LevelObject?} target
	 * @returns {boolean}
	 */
	_abilitySlow( target ) {
		const slowTime = 2;

		if( !target ) {
			const center = this.getCenter();

			this.level.wave.enemies.forEach( e => {
				if( euclidDistance( center, e.getCenter() ) <= this.attackRange + e.w / 2 ) {
					if( e.effects.isSlowed.left() < slowTime ) {
						e.effects.isSlowed.set( slowTime );
					}
				}
			} );

			this._drawEffectArea( center );

			return true;
		}

		if( target.effects.isSlowed.left() < slowTime * 2 ) {
			target.effects.isSlowed.set( slowTime * 2 );
		}

		return false;
	}


	/**
	 *
	 * @private
	 * @param {LevelObject?} target
	 * @returns {boolean}
	 */
	_abilityTaunt( target ) {
		const tauntTime = 4;

		if( !target ) {
			const range = this.isTower ? this.attackRange : LevelObject.baseAttackRangeTower * 0.75;
			const center = this.getCenter();

			this.level.wave.enemies.forEach( e => {
				if( euclidDistance( center, e.getCenter() ) <= range + e.w / 2 ) {
					e.target = this;

					if( e.effects.isTaunted.left() < tauntTime ) {
						e.effects.isTaunted.set( tauntTime );
					}
				}
			} );

			this._drawEffectArea( center );

			return true;
		}

		if( target.effects.isTaunted.left() < tauntTime ) {
			target.effects.isTaunted.set( tauntTime );
		}

		if( target.effects.isStunned.left() < 1 ) {
			target.effects.isStunned.set( 1 );
		}

		return false;
	}


	/**
	 *
	 * @private
	 * @param {Position} center
	 */
	_drawEffectArea( center ) {
		this.animations.push( new Animation( {
			level: this.level,
			duration: 0.5,
			onDraw: ( ctx, progress ) => {
				ctx.globalAlpha = Math.sin( progress * Math.PI ) * 0.5;
				ctx.strokeStyle = this.color.color;
				ctx.beginPath();
				ctx.arc( center.x, center.y, this.attackRange, 0, Math.PI * 2 );
				ctx.closePath();
				ctx.stroke();
				ctx.globalAlpha = 1;
			},
			onDone: a => removeItem( this.animations, a ),
		} ) );
	}


	/**
	 *
	 * @param {LevelObject?} target
	 * @returns {boolean} True if ability cooldown timer should restart.
	 */
	triggerAbility( target ) {
		const map = {
			[Colors.Red.color]: this._abilityBurn.bind( this ),
			[Colors.Orange.color]: this._abilityTaunt.bind( this ),
			[Colors.Yellow.color]: this._abilityLightning.bind( this ),
			[Colors.Green.color]: this._abilityHeal.bind( this ),
			[Colors.Cyan.color]: this._abilitySlow.bind( this ),
			[Colors.Blue.color]: this._abilityShield.bind( this ),
		};

		const color = target ? ( this.item?.color || this.color ) : this.color;

		// Random effect
		if( color === Colors.Violet ) {
			const keys = Object.keys( map );
			const key = keys[randInt( 0, keys.length - 1 )];

			return map[key]( target );
		}

		return map[color.color]?.( target );
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		super.update( dt );

		if(
			!this.isOnMap ||
			!this.level.wave ||
			this.level.wave.phase !== Wave.PhaseFight
		) {
			return;
		}

		this.decideAction();

		if( this.health > 0 && this.abilityCooldown.elapsed() ) {
			if( this.triggerAbility() ) {
				this.abilityCooldown.restart();
			}
		}
	}


};
