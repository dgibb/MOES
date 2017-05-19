//David Gibb

import { MBC0 } from './MBC0';
import { MBC1, romBanks, ramBanks } from './MBC1';
import { emulator } from './emulator';
import { cpu } from './cpu'

export var memory = {

mbc:0,
memdebug:0,

readByte: function(addr){

	switch (memory.mbc){

		case 0:
		return MBC0.readByte(addr);
		break;

		case 1:
		return MBC1.readByte(addr);
		break;

		default:
		break;

	}
},

readWord: function(addr){

	switch (memory.mbc){

		case 0:
		return MBC0.readWord(addr);
		break;

		case 1:
		return MBC1.readWord(addr);
		break;

		default:
		break;

	}
},

writeByte: function(data, addr){

	switch (memory.mbc){

		case 0:
		MBC0.writeByte(data, addr);
		break;

		case 1:
		MBC1.writeByte(data, addr);
		break;

		default:
		break;

	}
},

writeWord: function(data, addr){

	switch (memory.mbc){

		case 0:
		MBC0.writeWord(data, addr);
		break;

		case 1:
		MBC1.writeWord(data, addr);
		break;

		default:
		break;

	}
},

loadROM: function(){

	var input = document.getElementById('romFileInput');
	var file = input.files[0];
	if (file===undefined){
		alert("Please Select a File");
	} else{
		//animations
		var mc = document.getElementById('middle-content');
		var footer = document.getElementById('footer');
		console.log(mc);
		console.log(footer);
		footer.style.position="fixed";
		footer.style.bottom=0;
		var height= "-"+mc.clientHeight.toString()+"px"
		console.log( "mc height is", height);
		mc.style.top=height;

		//filereading
	var reader = new FileReader;
	reader.onload=function(e){

		var byteArray=new Uint8Array(reader.result);

		switch (byteArray[0x147]){

			case 0:
			console.log('no mbc')
			MBC0.init(byteArray);
			break;

			case 1:
			case 2:
			case 3:
			console.log('mbc1');
			MBC1.init(byteArray);
			break;

			default:
			alert("file not supported");
			return;
			break;
		}

		mc.addEventListener("transitionend", emulator.runGame);
		}
	input.style.display = "none";
	var loadROM = document.getElementById('load-ROM');
	loadROM.style.display = "none";
	reader.readAsArrayBuffer(file);
	}
},

memoryInit: function(){
	for(var i=256; i<65536;i++){
		MEMORY[i]=0;
	}
	for(var i=256; i<32768;i++){
		ramBanks[Math.floor(i/8192)][i%8192]=0;
	}
},

oamDMATransfer: function(addr){
	addr=addr<<8;
	for (var i=0; i<0xA0; i++){
		MEMORY[0xFE00+i]=MEMORY[addr+i];
	}
},

biosInit: function(){
	cpu.a=0x01;
	cpu.c=0x13;
	cpu.e=0xD8;
	cpu.h=0x01;
	cpu.l=0x14;
	cpu.f=0xB0;
	cpu.sp=0xFFFE;
	cpu.pc=0x100;
	memory.writeByte(0xFF, 0xFF00);
	memory.writeByte(0xE1, 0xFF0F);
	memory.writeByte(0x80, 0xFF10);
	memory.writeByte(0xBF, 0xFF11);
	memory.writeByte(0xF3, 0xFF12);
	memory.writeByte(0xBF, 0xFF14);
	memory.writeByte(0x3F, 0xFF16);
	memory.writeByte(0xBF, 0xFF19);
	memory.writeByte(0x7F, 0xFF1A);
	memory.writeByte(0xFF, 0xFF1B);
	memory.writeByte(0x9F, 0xFF1C);
	memory.writeByte(0xBF, 0xFF1E);
	memory.writeByte(0xFF, 0xFF20);
	memory.writeByte(0xBF, 0xFF23);
	memory.writeByte(0x77, 0xFF24);
	memory.writeByte(0xF3, 0xFF25);
	memory.writeByte(0xF1, 0xFF26);
	memory.writeByte(0x91, 0xFF40);
	memory.writeByte(0xFC, 0xFF47);
	memory.writeByte(0xFF, 0xFF48);
	memory.writeByte(0xFF, 0xFF49);
	console.log('bios initialized')
},

showStack: function(){
	console.log('STACK:')
	var i=0;
	while(((cpu.sp+i)&0xFF)!==0xFF){
		console.log((cpu.sp+i).toString(16), ': ', memory.readByte(cpu.sp+i));
		i+=2;
	}
},

};

export var MEMORY=[];
