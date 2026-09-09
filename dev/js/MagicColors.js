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


};


export const Colors = {

	Red: new MagicColor( 'red', {
		attackDamage: 10,
		health: 10,
	} ),

	Orange: new MagicColor( 'orange', {
		attackDamage: 5,
		attackRange: 100,
	} ),

	Yellow: new MagicColor( 'yellow', {
		attackSpeed: -0.2,
		moveSpeed: 0.5,
	} ),

	Green: new MagicColor( 'green', {
		attackDamage: -25,
		attackRange: -50,
		attackSpeed: 0.2,
	} ),

	Cyan: new MagicColor( 'cyan', {} ),

	Blue: new MagicColor( 'blue', {} ),

	Violet: new MagicColor( 'darkviolet', {} ),

	White: new MagicColor( 'white', {}, true ),

};
