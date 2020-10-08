const { signDecode } = require('./utils.js')

function Display (MEMORY) {
  this.mode = 2
  this.tCount = 0

  // -- LCD Control Register 0xFF41 -- //
  this.lcdEnable = 0            // bit 7
  this.windowTileMap = 0        // bit 6
  this.windowEnabled = 0        // bit 5
  this.activeTileSet = 0        // bit 4
  this.bgTileMap = 0            // bit 3
  this.spriteSize = 1           // bit 2
  this.spriteEnable = 0         // bit 1
  this.bgEnable = 0             // bit0

  this.scrollY = 0        // 0xFF42
  this.scrollX = 0        // 0xFF43
  this.line = 0           // 0xFF44
  this.windowX = 0        // 0xFF4A
  this.windowY = 0        // 0xFF4B
  this.windowOn = 0
  this.modeIntCalled = [0, 0, 0]
  this.vBintCalled = 0

  this.graphicsDebug = 0
  this.currentTileset = 0

  this.tileMap = [
    [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
  ]
  this.screen = {}
  this.pixData = {}
  this.spriteData = []
  this.tileSet = [[], []]
  this.paletteRef = [255, 192, 96, 0]
  this.objPalettes = [[], []]

  this.step = function (cycles) {
    this.tCount += cycles
    if ((this.line === MEMORY[0xFF45]) && ((MEMORY[0xFF41] & 0x40))) {
      MEMORY[0xFF0F] |= 0x02
      MEMORY[0xFF41] |= 0x04
    } else {
      MEMORY[0xFF0F] &= 0xFD
      MEMORY[0xFF41] &= 0xFB
    }

    switch (this.mode) {
      // Horizontal Blank Period
      case 0:
        if ((this.modeIntCalled[0] === 0) && (MEMORY[0xFF41] & 0x08)) {
          MEMORY[0xFF0F] |= 0x02
          this.modeIntCalled[0] = 1
        }
        if (this.tCount >= 204) {
          this.tCount = 0
          this.mode = 2
          MEMORY[0xFF41] &= 0xFC
          MEMORY[0xFF41] |= 0x02
          if (this.line > 143) {
            this.drawSprites()
            this.mode = 1
            MEMORY[0xFF41] &= 0xFC
            MEMORY[0xFF41] |= 0x01
            this.screen.putImageData(this.pixData, 0, 0)
          }
        }
        break

      // Vertical Blank Period
      case 1:
        if (this.vBIntCalled === 0) {
          MEMORY[0xFF0F] |= 0x01
          this.vBIntCalled = 1
        }
        if ((this.modeIntCalled[1] === 0) && (MEMORY[0xFF41] & 0x10)) {
          MEMORY[0xFF0F] |= 0x02
          this.modeIntCalled[1] = 1
        }
        this.modeIntCalled[0] = 0
        if (this.tCount >= 456) {
          this.tCount = 0
          this.line++
          if (this.line > 153) {
            this.mode = 2
            MEMORY[0xFF41] &= 0xFC
            MEMORY[0xFF41] |= 0x02
            this.line = 0
          }
        }
        break

      // OAM Access
      case 2:
        if ((this.modeIntCalled[2] === 0) && (MEMORY[0xFF41] & 0x20)) {
          MEMORY[0xFF0F] |= 0x02
          this.modeIntCalled[2] = 1
        }
        this.modeIntCalled[0] = 0
        this.modeIntCalled[1] = 0
        this.vBIntCalled = 0
        if (this.tCount >= 80) {
          this.tCount = 0
          this.mode = 3
          MEMORY[0xFF41] &= 0xFC
          MEMORY[0xFF41] |= 0x03
        }
        break

        // VRAM Access
      case 3:
        this.modeIntCalled[2] = 0
        if (this.tCount >= 172) {
          this.tCount = 0
          this.mode = 0
          MEMORY[0xFF41] &= 0xFC
          this.drawScanline()
          this.line++
        }
        break
    }
  }

  this.drawScanline = function () {
    var dataOffset = this.line * 640
    if (this.windowOn && (this.line >= this.windowY)) {
      this.drawWindowLine(dataOffset)
    } else {
      this.drawBgLine(dataOffset)
    }
  }

  this.drawBgLine = function (frameBufferOffset) {
    // offset in (gameboy)memory from the line of the current tile in bytes
    var offsetY = ((this.scrollY + this.line) % 8) * 2

    for (var i = 0; i < 160; i++) {
      var offsetX = (this.scrollX + i) % 8
      var tileRef = this.getBGTile(i)
      var pix = this.getPixel(tileRef + offsetY, offsetX)
      this.putPixelData(frameBufferOffset, pix)
      frameBufferOffset += 4
    }
  }

  this.getBGTile = function (i) {
    var tileY = (Math.floor((this.scrollY + this.line) / 8)) % 32
    var tileX = (Math.floor((this.scrollX + i) / 8)) % 32
    var tile = this.tileMap0[this.bgTileMap][tileY][tileX]
    tile = (this.activeTileSet) ? tile : signDecode(tile) + 128
    return 16 * tile
  }

  this.getWindowTile = function (i) {
    var tileY = (Math.floor((this.line - this.windowY) / 8)) % 32
    var tileX = (Math.floor((i - this.windowX + 7) / 8)) % 32
    var tile = this.tileMap[this.windowTileMap][tileY][tileX]
    tile = (this.activeTileSet) ? tile : signDecode(tile) + 128
    return 16 * tile
  }

  this.getPixel = function (tileOffset, bitOffset) {
    var bit0 = this.tileSet[this.activeTileSet][tileOffset]
    var bit1 = this.tileSet[this.activeTileSet][tileOffset + 1]
    var pix = ((bit1 >> (7 - bitOffset)) & 0x01) ? 2 : 0
    pix += ((bit0 >> (7 - bitOffset)) & 0x01) ? 1 : 0
    return pix
  }

  this.putPixelData = function (frameBufferOffset, pix) {
    this.pixData.data[frameBufferOffset] = this.paletteRef[pix]
    this.pixData.data[frameBufferOffset + 1] = this.paletteRef[pix]
    this.pixData.data[frameBufferOffset + 2] = this.paletteRef[pix]
  }

  // The window is a seperate background drawn above the background
  this.drawWindowLine = function (frameBufferOffset) {
    var offsetY = ((this.scrollY + this.line) % 8) * 2

    // draw BG pixels left of the window (if any)
    for (var i = 0; i < this.windowX - 7; i++) {
      var offsetX = (this.scrollX + i) % 8
      var tileRef = this.getBGTile(i)
      var pix = this.getPixel(tileRef + offsetY, offsetX)
      this.putPixelData(frameBufferOffset, pix)
      frameBufferOffset += 4
    }

    offsetY = ((this.line - this.windowY) % 8) * 2

    // draw Window tiles
    for (i = this.windowX - 7; i < 160; i++) {
      var offsetX = ((this.windowX + 7) + i) % 8
      var tileRef = this.getWindowTile(i)
      var bit0 = (tileRef > 0x7F0) ? this.tileSet[1][tileRef + offsetY] : this.tileSet[0][tileRef + offsetY + 0x800]
      var bit1 = (tileRef > 0x7F0) ? this.tileSet[1][tileRef + offsetY + 1] : this.tileSet[0][tileRef + offsetY + 0x801]

      pix = ((bit1 >> (7 - offsetX)) & 0x01) ? 2 : 0
      pix += ((bit0 >> (7 - offsetX)) & 0x01) ? 1 : 0

      this.putPixelData(frameBufferOffset, pix)
      frameBufferOffset += 4
    }
  }

  this.drawSprites = function () {
    var addr = 0xFE9C
    for (var i = 0; i < 40; i++) {
      if (this.graphicsDebug) { console.log('sprite', 40 - i) }
      var orientation = MEMORY[addr + 3]
      orientation = (orientation >> 5) & 0x03
      this.drawSprite(addr, orientation)
      addr -= 4
    }
  }

  this.drawSprite = function (addr, orientation) {

    // if sprite not hidden
    if ((MEMORY[addr] || MEMORY[addr + 1]) !== 0) {
      var tile = this.tileSet1.slice((MEMORY[addr + 2] * 16), (MEMORY[addr + 2] * 16) + (16 * this.spriteSize))
      var bgLine = MEMORY[addr] - 16
      var objPalette = (MEMORY[addr + 3] >> 4) & 0x01

      // for each line in sprite
      for (var j = 0; j < (8 * this.spriteSize); j++) {
        // if on this.screen
        if (this.lineOnScreen(MEMORY[addr] - 16, j)) {
          var spriteLine = this.getSpriteLine(j, orientation)
          // var spriteLine= tile.slice(j*2, (j*2)+2);
          // var spriteLine= tile.slice((16*this.spriteSize)-(j*2), (16*this.spriteSize)-(j*2)+2);
          var lineOffset = bgLine * 640
          // for each pixel in line
          for (var k = 0; k < 8; k++) {
            // if pix on screen
            if (this.pixOnScreen(MEMORY[addr + 1] - 8, k)) {
              var pixOffset = (MEMORY[addr + 1] - 8 + k) * 4
              var pixelXVal = (orientaion & 0x01) ? k : 7 - k
              var pixel = ((spriteLine[1] >> pixelXVal) & 0x01) ? 2 : 0
              pixel += ((spriteLine[0] >> pixelXVal) & 0x01) ? 1 : 0

              if (pixel !== 0) {
                // the sprite has priority
                if (!(MEMORY[addr + 3] & 0x80)) {
                  this.pixData.data[lineOffset + pixOffset] = this.objPalettes[objPalette][pixel]
                  this.pixData.data[lineOffset + pixOffset + 1] = this.objPalettes[objPalette][pixel]
                  this.pixData.data[lineOffset + pixOffset + 2] = this.objPalettes[objPalette][pixel]
                } else if (this.pixelIs0(addr, j, k)) {
                  this.pixData.data[lineOffset + pixOffset] = this.objPalettes[objPalette][pixel]
                  this.pixData.data[lineOffset + pixOffset + 1] = this.objPalettes[objPalette][pixel]
                  this.pixData.data[lineOffset + pixOffset + 2] = this.objPalettes[objPalette][pixel]
                }
              }
            }
          }
        }
        bgLine++
      }
    }
  }

  this.pixelIs0 = function (addr, j, k) {
    var tileY = Math.floor((this.scrollY + MEMORY[addr] + (j) - (16)) / 8)
    var tileX = Math.floor((this.scrollX + MEMORY[addr + 1] + (k) - 8) / 8)
    var offsetY = (this.scrollY + MEMORY[addr] + (j) - 16) % 8
    var offsetX = (this.scrollX + MEMORY[addr + 1] + (k) - 8) % 8
    var tile = ((MEMORY[0xFF40] & 0x08) === 0x80) ? this.tileMap1[tileY][tileX] : this.tileMap0[tileY][tileX]
    if ((MEMORY[0xFF40] & 0x10) === 0) { tile = signDecode(tile) + 128 }
    tile = 16 * tile
    var bit0 = ((MEMORY[0xFF40] & 0x10) === 0x10) ? this.tileSet1[tile + offsetY] : this.tileSet0[tile + offsetY]
    var bit1 = ((MEMORY[0xFF40] & 0x10) === 0x10) ? this.tileSet1[tile + offsetY + 1] : this.tileSet0[tile + offsetY + 1]
    var pix = ((bit1 >> (7 - offsetX)) & 0x01) ? 2 : 0
    pix += ((bit0 >> (7 - offsetX)) & 0x01) ? 1 : 0
    return (pix === 0)
  }

  this.canvasInit = function () {
    var canvas = document.getElementById('screen')
    var container = document.getElementById('screen-container')
    var height = container.clientHeight
    var width = container.clientWidth
    console.log('canvasinit', height, width)
    if (width >= height) {
      canvas.style.height = '100%'
    } else {
      canvas.style.width = '100%'
    }

    this.screen = canvas.getContext('2d')
    this.pixData = this.screen.createImageData(160, 144)
    for (var i = 0; i < this.pixData.data.length; i += 4) {
      this.pixData.data[i] = 0
      this.pixData.data[i + 1] = 0
      this.pixData.data[i + 2] = 0
      this.pixData.data[i + 3] = 255
    }
    this.screen.putImageData(this.pixData, 0, 0)
  }

  this.lineOnScreen = function (bgLine, spriteline) {
    var line = bgLine + spriteline
    return (line < 144 && line >= 0)
  }

  this.pixOnScreen = function (bgLine, spriteline) {
    var line = bgLine + spriteline
    return (line < 160 && line > 0)
  }

  this.showState = function () {
    console.log('gpu mode: ', this.mode)
    console.log('tCount: ', this.tCount)
    console.log('LCD Control (FF40): ', MEMORY[0xFF40].toString(16))
    console.log('LCD STAT (FF41): ', MEMORY[0xFF41].toString(16))
    console.log('scrollY: (FF42)', this.scrollY.toString(16))
    console.log('scrollX: (FF43)', this.scrollX.toString(16))
    console.log('line: (FF44)', this.line.toString(16))
    console.log('LYC: (FF45)', MEMORY[0xFF45].toString(16))
    console.log('BG Pal(FF47): ', MEMORY[0xFF47].toString(16))
  }
};

module.exports = { Display: Display }
