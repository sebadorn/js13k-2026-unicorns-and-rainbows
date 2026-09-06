import { Input } from './Input.js';
import { LevelIntro } from './levels/LevelIntro.js';
import { LevelMain } from './levels/LevelMain.js';
import { Renderer } from './Renderer.js';


window.addEventListener( 'load', async () => {
	Input.init();
	Renderer.init();
	Renderer.level = new LevelMain();
	Renderer.mainLoop();
} );
