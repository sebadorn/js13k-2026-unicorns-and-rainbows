import { Input } from './Input.js';
import { Player, PlayerAction } from './Player.js';
import { Renderer } from './Renderer.js';


export class Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.timer = 0;

		/** @type {import('./Animation').Animation[]} */
		this.animations = [];
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		// TODO

		this.player.draw( ctx );
		this.animations.forEach( anim => anim.do() );
	}


	/**
	 * 
	 * @param {number} action
	 */
	onKey( action ) {
		if( Renderer.isPaused ) {
			return;
		}

		let x = this.player.x;
		let y = this.player.y;

		if( action === PlayerAction.Up.enum ) {
			y--;
		}
		else if( action === PlayerAction.Down.enum ) {
			y++;
		}
		else if( action === PlayerAction.Left.enum ) {
			x--;
		}
		else if( action === PlayerAction.Right.enum ) {
			x++;
		}
		else if( action === PlayerAction.Interact.enum ) {
			// TODO
		}
	}


	/**
	 *
	 * @param {number} dt
	 */
	update( dt ) {
		this.timer += dt;

		if( Input.isPressed( PlayerAction.Up.keys, true ) ) {
			this.onKey( PlayerAction.Up.enum );
		}
		else if( Input.isPressed( PlayerAction.Left.keys, true ) ) {
			this.onKey( PlayerAction.Left.enum );
		}
		else if( Input.isPressed( PlayerAction.Down.keys, true ) ) {
			this.onKey( PlayerAction.Down.enum );
		}
		else if( Input.isPressed( PlayerAction.Right.keys, true ) ) {
			this.onKey( PlayerAction.Right.enum );
		}
		else if( Input.isPressed( PlayerAction.Interact.keys, true ) ) {
			this.onKey( PlayerAction.Interact.enum );
		}

		this.player.update( dt );
	}


};
