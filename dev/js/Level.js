import { Input } from './Input.js';
import { Player, PlayerAction } from './Player.js';
import { Renderer, tileSizePx } from './Renderer.js';
import { CharMeasures, DungeonMap, dungeonMapsData } from './DungeonMap.js';


export class Level {


	/**
	 *
	 * @constructor
	 */
	constructor() {
		this.timer = 0;

		/** @type {import('./Animation').Animation[]} */
		this.animations = [];

		this.currentMap = DungeonMap.load( dungeonMapsData.start );

		const playerStart = this.currentMap.setup.playerStart;
		this.player = new Player( this, playerStart[0], playerStart[1] );
		this.currentMap.updateLightMap( this.player );
	}


	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw( ctx ) {
		ctx.translate(
			Renderer.center.x - this.currentMap.sizeX / 2 * tileSizePx,
			Renderer.center.y - this.currentMap.sizeY / 2 * tileSizePx,
		);

		for( let y = 0; y < this.currentMap.sizeY; y++ ) {
			for( let x = 0; x < this.currentMap.sizeX; x++ ) {
				if( x === this.player.x && y === this.player.y ) {
					continue;
				}

				const tile = this.currentMap.at( x, y );
				tile.draw( ctx );
			}
		}

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
			// TODO: check neighbouring tiles for objects to interact with
		}

		const targetTile = this.currentMap.at( x, y );

		if( targetTile?.isTraversable() ) {
			this.player.x = x;
			this.player.y = y;
			this.currentMap.updateLightMap( this.player );
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
