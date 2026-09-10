import { zzfx } from './lib/ZzFXMicro.min.js';


export const Audio = {


	_queued: null,


	/**
	 *
	 * @param {(number | undefined)[]} audioData
	 * @param {number?} volume
	 */
	play( audioData, volume ) {
		if( this._queued === audioData ) {
			return;
		}

		this._queued = audioData;

		setTimeout( () => {
			if( typeof volume === 'number' ) {
				audioData = audioData.slice();
				audioData[0] = volume;
			}

			zzfx( ...audioData );
			this._queued = null;
		}, 50 );
	},


	// blip24: [,0,287,.03,,.03,2,1.3,,,223,.01,.01,,120,,,.56,.02],
	// blip25: [1.4,0,86,.01,.03,.03,3,1.2,-34,29,11,.13,,.7,.2,.1,.07,,.02,,109],

	burnDmg: [.05,0,313,.02,.04,.18,4,1.9,,-9,,,,1.7,,,,.68,.09],
	click: [.1,0,487,.01,,.01,2,.1,-9,,,,,,101,,,.71,.01,.02,473],
	fighterDestroyed: [.2,0,551,.04,.16,.2,,2.7,,,397,.17,,,19,,.11,.8,.29,,240],
	fighterHit: [0.2,0,321,,.07,.13,1,.8,,-8,,,.06,1.5,,,.06,.62,.07,,-2205],
	lightning: [.1,0,448,.01,.03,.03,3,.9,30,,,,,.3,71,,.01,.96,.03,,-1384],
	shriek: [.03,0,671,.02,.03,.26,5,.1,,,416,.06,,,.5,,,.79,.03,,-1231],
	towerDestroyed: [2,0,65,.04,.04,.35,2,2.1,6,-9,,,,.4,,.7,,.47,.13,,-1906],
	towerHit: [.1,0,306,.02,,.04,5,1.2,,,-82,.01,.01,,21,.4,,.92,.02,.49,417],


};
