// jscs:disable requirePaddingNewLinesAfterBlocks

var display = {

  mode: 2,
  tCount: 0,

  scrollY: 0,       //MEMORY[0xFF42]
  scrollX: 0,       //MEMORY[0xFF43]
  line: 0,          //MEMORY[0xFF44]
  windowX: 0,       //MEMORY[0xFF4A]
  windowY: 0,       //MEMORY[0xFF4B]
  windowOn: 0,
  windowMap: 0,
  modeIntCalled: [0, 0, 0],
  vBintCalled: 0,
  spriteSize: 1,
  graphicsDebug: 0,

  step: function () {

    display.tCount += cpu.t;
    if ((display.line === MEMORY[0xFF45]) && ((MEMORY[0xFF41] & 0x40) === 0x40)) {
      MEMORY[0xFF0F] |= 0x02;
      MEMORY[0xFF41] |= 0x04;
    } else {
      MEMORY[0xFF0F] &= 0xFD;
      MEMORY[0xFF41] &= 0xFB;
    }

    switch (display.mode) {

      case 0:  //Hblank
        if ((display.modeIntCalled[0] === 0) && (MEMORY[0xFF41] & 0x08)) {
          MEMORY[0xFF0F] |= 0x02;
          display.modeIntCalled[0] = 1;
        }
        if (display.tCount >= 204) {
          display.tCount = 0;
          display.mode = 2;
          MEMORY[0xFF41] &= 0xFC;
          MEMORY[0xFF41] |= 0x02;
          if (display.line > 143) {
            display.drawSprites();
            display.mode = 1;
            MEMORY[0xFF41] &= 0xFC;
            MEMORY[0xFF41] |= 0x01;
            screen.putImageData(pixData, 0, 0);
          }
        }

      break;

      case 1:  //VBlank
        if (display.vBIntCalled === 0) {
          MEMORY[0xFF0F] |= 0x01;
          display.vBIntCalled = 1;
        }
        if ((display.modeIntCalled[1] === 0) && (MEMORY[0xFF41] & 0x10)) {
          MEMORY[0xFF0F] |= 0x02;
          display.modeIntCalled[1] = 1;
        }
        display.modeIntCalled[0] = 0;
        if (display.tCount >= 456) {
          display.tCount = 0;
          display.line++;
          if (display.line > 153) {
            display.mode = 2;
            MEMORY[0xFF41] &= 0xFC;
            MEMORY[0xFF41] |= 0x02;
            display.line = 0;
          }
        }
      break;

      case 2:  //OAMAccess
        if ((display.modeIntCalled[2] === 0) && (MEMORY[0xFF41] & 0x20)) {
          MEMORY[0xFF0F] |= 0x02;
          display.modeIntCalled[2] = 1;
        }
        display.modeIntCalled[0] = 0;
        display.modeIntCalled[1] = 0;
        display.vBIntCalled = 0;
        if (display.tCount >= 80) {
          display.tCount = 0;
          display.mode = 3;
          MEMORY[0xFF41] &= 0xFC;
          MEMORY[0xFF41] |= 0x03;
        }
      break;

      case 3:  //VRAMAccess
        display.modeIntCalled[2] = 0;
        if(display.tCount>=172){
          display.tCount=0;
          display.mode=0;
          MEMORY[0xFF41]&=0xFC;
          display.drawScanline();
          display.line++;

        }
      break;
    }
  },

  drawScanline: function(){
    var dataOffset = display.line * 640;
    if (display.windowOn && (display.line >= display.windowY)){
      display.drawWindowLine(dataOffset);
    }else{
      display.drawBgLine(dataOffset);
    }
  },

  drawBgLine: function(frameBufferOffset){

    var offsetY = ((display.scrollY + display.line) % 8) * 2; //offset in (gameboy)memory from the line of the current tile in bytes

    for(var i = 0; i < 160; i++) {
      var tileRef = display.getBGTile(i);
      var pix = display.getPixel(tileRef, offsetY);
      display.putPixelData(frameBufferOffset, pix);
      frameBufferOffset += 4;
    }
  },

  getBGTile: function(i) {
    var offsetX = (display.scrollX + i) % 8;
    var tileY = (Math.floor((display.scrollY + display.line) / 8)) % 32;
    var tileX = (Math.floor((display.scrollX + i) / 8)) % 32;
    var tile = (MEMORY[0xFF40] & 0x08) ? tileMap1[tileY][tileX] : tileMap0[tileY][tileX];
    tile = (MEMORY[0xFF40] & 0x10) ? tile : cpu.signDecode(tile) + 128;
    return 16 * tile;
  },

  getWindowTile: function(i) {
    var offsetX = (display.windowX + 7);
    offsetX = (offsetX + i) % 8;

    var tileY = (Math.floor((display.line - display.windowY) / 8)) % 32;
    var tileX = (Math.floor((i - display.windowX + 7) / 8)) % 32;
    var tile = (display.windowMap) ? tileMap1[tileY][tileX] : tileMap0[tileY][tileX];
    tile = 16 * tile;
  },

  getPixel: function(tile, offsetY) {
    var bit0 = (MEMORY[0xFF40] & 0x10) ? tileSet1[tile + offsetY] : tileSet0[tile + offsetY];
    var bit1 = (MEMORY[0xFF40] & 0x10) ? tileSet1[tile + offsetY + 1] : tileSet0[tile + offsetY + 1];
    var pix = ((bit1 >> (7 - offsetX)) & 0x01) ? 2 : 0;
    pix += ((bit0 >> (7 - offsetX)) & 0x01) ? 1 : 0;
    return pixel;
  },

  putPixelData: function(frameBufferOffset, pix){
    pixData.data[frameBufferOffset] = paletteRef[pix];
    pixData.data[frameBufferOffset + 1] = paletteRef[pix];
    pixData.data[frameBufferOffset + 2] = paletteRef[pix];
  },


  drawWindowLine: function(frameBufferOffset){   //a seperate background drawn above the background

    var offsetY = ((display.scrollY + display.line) % 8) * 2;

    //draw BG tiles left of the window (if any)
    for (var i = 0; i < display.windowX - 7; i++) {
      var tileRef = display.getBGTile(i);
      var pix = display.getPixel(tileRef, offsetY);
      display.putPixelData(frameBufferOffset, pix);
      frameBufferOffset += 4;
    }

    offsetY = ((display.line - display.windowY) % 8) * 2;

    // draw Window tiles
    for (i = display.windowX - 7; i < 160; i++){
      var tileRef = display.getWindowTile(i);
      if (tile > 0x7F0) {
        var bit0 = tileSet1[tile + offsetY];
        var bit1 = tileSet1[tile + offsetY + 1];
      }else{
        var bit0 = tileSet0[tile + offsetY + 0x800];
        var bit1 = tileSet0[tile + offsetY + 0x801];
      }

      var pix = ((bit1 >> (7 - offsetX)) & 0x01) ? 2 : 0;
      pix += ((bit0 >> (7 - offsetX)) & 0x01) ? 1 : 0;

      display.putPixelData(frameBufferOffset, pix);
      dataOffset += 4;
    }
  },

  drawSprites:function(){
    var addr = 0xFE9C;
    for (var i = 0; i < 40; i++){
      if (display.graphicsDebug){console.log('sprite', 40 - i);}
        var orientation = MEMORY[addr + 3];
        orientation = (orientation >> 5) & 0x03;
        display.drawSprite(addr, orientation);
        addr -= 4;
    }
  },

  drawSprite: function(addr, orientation){

      if ((MEMORY[addr] || MEMORY[addr + 1]) !== 0){      //if sprite not hidden

        var tile = tileSet1.slice((MEMORY[addr + 2] * 16),(MEMORY[addr + 2] * 16) + (16 * display.spriteSize));
        var bgLine = MEMORY[addr] - 16;
        var objPalette = (MEMORY[addr + 3] >> 4) & 0x01;

        for (var j = 0; j < (8 * display.spriteSize); j++){            //for each line in sprite

          if (display.lineOnScreen(MEMORY[addr] - 16, j)){          //if on screen

            var spriteLine = display.getSpriteLine(j, orientation);
            // var spriteLine= tile.slice(j*2, (j*2)+2);
            // var spriteLine= tile.slice((16*display.spriteSize)-(j*2), (16*display.spriteSize)-(j*2)+2);
            var lineOffset = bgLine * 640;

            for (var k = 0; k < 8; k++){          //for each pixel in line

              if (display.pixOnScreen(MEMORY[addr + 1] - 8, k)) {    //if pix on screen

                var pixOffset = (MEMORY[addr + 1] - 8 + k) * 4;
                var pixelXVal = (orientaion & 0x01) ? k : 7 - k;
                var pixel = ((spriteLine[1] >> pixelXVal) & 0x01) ? 2 : 0;
                pixel += ((spriteLine[0] >> pixelXVal) & 0x01) ? 1 : 0;

                if (pixel !== 0){
                  if (!(MEMORY[addr + 3] & 0x80)) {    //the sprite has priority
                    pixData.data[lineOffset + pixOffset] = objPalettes[objPalette][pixel];
                    pixData.data[lineOffset + pixOffset + 1] = objPalettes[objPalette][pixel];
                    pixData.data[lineOffset + pixOffset + 2] = objPalettes[objPalette][pixel];
                  } else if (display.pixelIs0(addr, j, k)){
                    pixData.data[lineOffset + pixOffset] = objPalettes[objPalette][pixel];
                    pixData.data[lineOffset + pixOffset + 1] = objPalettes[objPalette][pixel];
                    pixData.data[lineOffset + pixOffset + 2] = objPalettes[objPalette][pixel];
                  }
                }
              }
            }
          }
          bgLine++;
        }
      }
  },

  pixelIs0: function(addr, j, k){
    var tileY = Math.floor((display.scrollY + MEMORY[addr] + (j) - (16)) / 8);
    var tileX = Math.floor((display.scrollX + MEMORY[addr + 1] + (k) - 8) / 8);
    var offsetY = (display.scrollY + MEMORY[addr] + (j) - 16) % 8;
    var offsetX = (display.scrollX+MEMORY[addr + 1] + (k) - 8) % 8;
    var tile = ((MEMORY[0xFF40] & 0x08) === 0x80) ? tileMap1[tileY][tileX] : tileMap0[tileY][tileX];
    if ((MEMORY[0xFF40] & 0x10) === 0) {tile=cpu.signDecode(tile) + 128;}
    tile = 16 * tile;
    var bit0 = ((MEMORY[0xFF40] & 0x10)===0x10) ? tileSet1[tile + offsetY] : tileSet0[tile + offsetY];
    var bit1 = ((MEMORY[0xFF40] & 0x10)===0x10) ? tileSet1[tile + offsetY + 1] : tileSet0[tile + offsetY + 1];
    var pix = ((bit1 >> (7 - offsetX)) & 0x01) ? 2 : 0;
    pix += ((bit0 >> (7 - offsetX)) & 0x01) ? 1 : 0;
    return (pix === 0);
  },

  canvasInit: function(){
    var canvas = document.getElementById('screen');
    var container = document.getElementById('screen-container');
    var height=container.clientHeight;
    var width=container.clientWidth;
    console.log('canvasinit', height, width);
    if (width>=height){
      canvas.style.height="100%";
    }else{
      canvas.style.width="100%";
    }

    screen = canvas.getContext('2d');
    pixData = screen.createImageData(160,144);
    for(var i=0;i<pixData.data.length;i+=4){
      pixData.data[i]=0;
      pixData.data[i+1]=0;
      pixData.data[i+2]=0;
      pixData.data[i+3]=255;
    }
    screen.putImageData(pixData,0,0);
  },

  lineOnScreen: function(bgLine, spriteline){
    var line = bgLine + spriteline;
    return (line < 144 && line >= 0);
  },

  pixOnScreen: function(bgLine, spriteline){
    var line = bgLine + spriteline;
    return (line < 160 && line > 0);
  },

  showState: function(){
    console.log('gpu mode: ', display.mode);
    console.log('tCount: ', display.tCount);
    console.log('LCD Control (FF40): ', MEMORY[0xFF40].toString(16));
    console.log('LCD STAT (FF41): ', MEMORY[0xFF41].toString(16));
    console.log('scrollY: (FF42)', display.scrollY.toString(16));
    console.log('scrollX: (FF43)', display.scrollX.toString(16));
    console.log('line: (FF44)', display.line.toString(16));
    console.log('LYC: (FF45)', MEMORY[0xFF45].toString(16));
    console.log('BG Pal(FF47): ', MEMORY[0xFF47].toString(16));
  },

};

var tileMap0=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
var tileMap1=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
var screen={};
var pixData={};
var spriteData=[];
var tileSet0=[];
var tileSet1=[];
var paletteRef=[255,192,96,0];
var objPalettes=[[],[]];
