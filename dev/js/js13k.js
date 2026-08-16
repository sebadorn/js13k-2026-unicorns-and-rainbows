import { Input } from './Input.js';
import { Level } from './Level.js';
import { Renderer } from './Renderer.js';


window.addEventListener( 'load', () => {
	Input.init();
	Renderer.init();
	Renderer.level = new Level();
	Renderer.mainLoop();
} );
