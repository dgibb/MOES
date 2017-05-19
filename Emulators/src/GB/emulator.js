import { memory } from './memory';
import { cpu } from './cpu';
import { display } from './display';

export var emulator ={

init: function(){
	memory.memoryInit();
	memory.biosInit();
	display.canvasInit();
},

runGame:function(){
	var about = document.getElementById('middle-content');
	about.style.display="none";
	cpu.timer = window.setInterval(emulator.runFrame,17);
},

runFrame: function(){
	while(display.line!==144){
	cpu.ex(memory.readByte(cpu.pc));
	}
	while(display.line!==0){
	cpu.ex(memory.readByte(cpu.pc));
	}
},

shrink:function(x){
	console.log(x);
	x.style.maxHeight=0
}

};
