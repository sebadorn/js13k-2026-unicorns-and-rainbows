import { Assets } from './Assets.js';
import { Input } from './Input.js';
import { Level } from './Level.js';
import { Renderer } from './Renderer.js';


window.addEventListener( 'load', async () => {
	await Assets.init();
	Input.init();
	Renderer.init();
	Renderer.level = new Level();
	Renderer.mainLoop();
} );
