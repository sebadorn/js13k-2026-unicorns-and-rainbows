import { Wave1 } from './levels/Wave1.js';
import { Wave2 } from './levels/Wave2.js';
import { Wave3 } from './levels/Wave3.js';
import { Wave4 } from './levels/Wave4.js';


export const Waves = {


	/** @type {(typeof import('./Wave').Wave)[]} */
	_waves: [
		Wave1,
		Wave2,
		Wave3,
		Wave4,
	],


	/**
	 *
	 * @param {import('./Level').Level} level
	 * @param {number} index
	 * @returns {import('./Wave').Wave?}
	 */
	getWave( level, index ) {
		if( index >= this._waves.length ) {
			return null;
		}

		return new this._waves[index]( level );
	}


};
