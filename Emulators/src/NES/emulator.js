//David Gibb
var emulator= {

  pRAM:'no',

runGame:function(){
  cpu.timer = window.setInterval(emulator.runFrame,17); //check framerate
  emulator.state='running';
},

runFrame: function(){
  while(ppu.scanline===0){
    cpu.ex(memory.readByte(cpu.pc));
  }

  while(ppu.scanline!==0){
    cpu.ex(memory.readByte(cpu.pc));
  }
},

loadROM: function(){
  var input = document.getElementById('romFileInput');
  var file = input.files[0];
  if (file===undefined){
    alert("Please Select a File");
  } else{
  var reader = new FileReader;
  reader.onload=function(e){

    var romFile = new Uint8Array(reader.result);

    if ((romFile[7]&0x0C===0x08)&&((romFile[9]<<8)<romFile.size)){
      emulator.iNES2Handler(romFile);
    } else if (((romFile[7]&0x0C)|romFile[12]|romFile[13]|romFile[14]|romFile[15])===0){
      emulator.iNESHandler(romFile);
    } else{
      alert("File Not Supported");
      prgRom=romFile;
      header=prgRom.slice(0,16);
      console.log(header)
      for(var i=1; i<16;i++){
        console.log(romFile[i].toString(16));
      }
      return
    }

    var mc = document.getElementById('middle-content');
    var footer = document.getElementById('footer');
    footer.style.position="fixed";
    footer.style.bottom=0;
    var height= "-"+mc.clientHeight.toString()+"px"
    mc.style.top=height;
    mc.addEventListener("transitionend", emulator.runGame);
    }
  reader.readAsArrayBuffer(file);
  }
},

iNESHandler:function(romFile){

console.log('iNES1.0');

var cartHeader=[0];

var x=0;    //rom file iterator

for (var i=0;i<16;i++){
  cartHeader[i]=romFile[x];
  x++;
}

//flags6
ppu.nametableMirroring=(cartHeader[6]&0x01)+2;
console.log('mirroring mode:', ppu.nametableMirroring);
//persistant memory
if (cartHeader[6]&0x04){x+=512;console.log('trainer fie exists but was ignored')}
if (cartHeader[6]&0x08){ppu.nametableMirroring=4;console.log('mirroring mode not yet supported');}

//flags 7


var prgRomSize = 16384*cartHeader[4];
for (var i=0;i<prgRomSize;i++){
  prgRom[i]=romFile[x];
  x++;
}

var chrRomSize = 8192*cartHeader[5];
for (var i=0;i<chrRomSize;i++){
  chrRom[i]=romFile[x];
  x++;
}

if (x!=romFile.length){
  console.log('romFile!=x');
  console.log(romfile.length,'-', x,'=', romFile.length-x);
} else{
  console.log('loading ROM miraculously Succeeded');
}

var mapperID = (cartHeader[6]>>4)&0xF;
mapperID|=cartHeader[7]&0xF0;
console.log('Mapper:', mapperID);
mapperInit(mapperID);
},

iNES2Handler:function(){
  console.log('iNES2.0')
},

init:function(){
  ppu.init();
  cpu.wRamInit();
},

showState:function(){
cpu.showState();
ppu.showState();
},

};
