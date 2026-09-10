import { maxUsesMagicColor } from './Config.js';


export class MagicColor {


	/**
	 *
	 * @param {string} color
	 * @param {Object} [mods = {}]
	 * @param {number?} mods.attackDamage
	 * @param {number?} mods.attackRange
	 * @param {number?} mods.attackSpeed
	 * @param {number?} mods.health
	 * @param {number?} mods.moveSpeed
	 * @param {boolean} [hidden = false]
	 */
	constructor( color, mods = {}, hidden = false ) {
		this.color = color;
		this.used = 0;
		this.hidden = hidden;

		this.modAttackDamage = mods.attackDamage || 0;
		this.modAttackRange = mods.attackRange || 0;
		this.modAttackSpeed = mods.attackSpeed || 0;
		this.modHealth = mods.health || 0;
		this.modMoveSpeed = mods.moveSpeed || 0;
	}


	/**
	 *
	 * @returns {boolean}
	 */
	hasUsesLeft() {
		return this.hidden || this.used <= maxUsesMagicColor;
	}


	/**
	 *
	 * @returns {number} [0, 1]
	 */
	usesLeftPercent() {
		if( this.hidden ) {
			return 1;
		}

		return ( maxUsesMagicColor - this.used ) / maxUsesMagicColor;
	}


};


export const Colors = {

	Red: new MagicColor( 'red', {
		attackDamage: 10,
		health: 50,
	} ),

	Orange: new MagicColor( 'orange', {
		attackDamage: -7,
		health: 100,
	} ),

	Yellow: new MagicColor( 'yellow', {
		attackSpeed: -0.2,
		moveSpeed: 0.5,
	} ),

	Green: new MagicColor( 'green', {
		health: 10,
	} ),

	Cyan: new MagicColor( 'cyan', {
		moveSpeed: -0.25,
	} ),

	Blue: new MagicColor( 'blue' ),

	Violet: new MagicColor( 'darkviolet' ),

	White: new MagicColor( 'white', {}, true ),

	Black: new MagicColor( 'black', {}, true ),

};
