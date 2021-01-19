const { signDecode } = require('./utils.js')
// const { getXYvals } = require('./utils.js')

// constants
var tileSize = 16
var spriteYDisplacement = 16
var spriteXdisplacement = 8
var tileWidth = 8
var mapWidth = 32

function Display (interruptRelay) {
  this.tCount = 0

  // -- LCD Control Register 0xFF40 -- //
  this.lcdEnable = 0            // bit 7
  this.windowTileMap = 0        // bit 6
  this.windowEnabled = 0        // bit 5
  this.activeTileSet = 0        // bit 4
  this.bgTileMap = 0            // bit 3
  this.spriteSize = 1           // bit 2
  this.spriteEnable = 0         // bit 1
  this.bgEnable = 0             // bit 0

  // -- LCD Status Register 0xFF41 -- //
  this.coincidenceInterruptEnable = 0        // bit 6
  this.OAMinterruptEnable = 0                // bit 5
  this.vBlankInterruptEnable = 0             // bit 4
  this.hBlankInterruptEnable = 0             // bit 3
  this.coincidenceFlag = 1                   // bit 2
  this.mode = 2                              // bits 0-1

  this.scrollY = 0              // 0xFF42
  this.scrollX = 0              // 0xFF43
  this.line = 0                 // 0xFF44
  this.lyCompare = 0            // 0xFF45
  this.oamdmareg = 0            // 0xFF45
  this.windowX = 0              // 0xFF4A
  this.windowY = 0              // 0xFF4B
  this.windowOn = 0
  this.modeIntCalled = [0, 0, 0]
  this.vBintCalled = 0

  this.graphicsDebug = 0
  this.currentTileset = 0

  this.tileMap = [
    [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
  ]

  this.preCalculatedPixMap = []
  this.screen = {}
  this.pixData = {}
  this.spriteData = []
  this.tileSet = [[], []]
  this.paletteRef = [255, 192, 96, 0]
  this.objPalettes = [[], []]

  this.selectedPalette = 0

  this.precalcBGDirty = false
  this.precalcWindowDirty = false

  this.step = function (cycles) {
    for (var i = 0; i > cycles; i++) {
      if ((this.line === this.lyCompare) && this.coincidenceInterruptEnable) {
        interruptRelay.request |= 0x02
        this.coincidenceFlag = 1
      } else {
        interruptRelay.request &= 0xFB
        this.coincidenceFlag = 0
      }

      switch (this.mode) {
        // Horizontal Blank Period
        case 0:
          if (!this.modeIntCalled[0] && this.hBlankInterruptEnable) {
            interruptRelay.request |= 0x02
            this.modeIntCalled[0] = 1
          }
          if (this.tCount >= 204) {
            this.tCount %= 204
            this.mode = 2
            if (this.line > 143) {
              this.drawSprites()
              this.mode = 1
              this.screen.putImageData(this.pixData, 0, 0)
            }
          }
          break

        // Vertical Blank Period
        case 1:
          if (this.vBIntCalled === 0) {
            interruptRelay.request |= 0x01
            this.vBIntCalled = 1
          }
          if (!this.modeIntCalled[1] && (this.vBlankInterruptEnable)) {
            interruptRelay.request |= 0x02
            this.modeIntCalled[1] = 1
          }
          this.modeIntCalled[0] = 0
          if (this.tCount >= 456) {
            this.tCount %= 456
            this.line++
            if (this.line > 153) {
              this.mode = 2
              this.line = 0
            }
          }
          break

        // OAM Access
        case 2:
          if (this.modeIntCalled[2] === 0 && this.OAMinterruptEnable) {
            interruptRelay.request |= 0x02
            this.modeIntCalled[2] = 1
          }
          this.modeIntCalled[0] = 0
          this.modeIntCalled[1] = 0
          this.vBIntCalled = 0
          if (this.tCount >= 80) {
            this.tCount %= 80
            this.mode = 3
          }
          break

          // VRAM Access
        case 3:
          this.modeIntCalled[2] = 0
          if (this.tCount >= 172) {
            this.tCount %= 172
            this.mode = 0
            this.drawScanline()
            this.line++
          }
          break
      }
    }
  }

  this.drawScanline = function () {
    var frameBufferOffset = this.line * 640
    if (this.windowOn && (this.line >= this.windowY)) {
      this.drawWindowLine(frameBufferOffset)
    } else {
      this.drawBgLine(frameBufferOffset)
    }
  }

  this.drawBgLine = function (frameBufferOffset) {
    var {mapOffs, lineOffs, tileOffs, x, y, tile} = getInitialBGValues()

    for(var i = 0; i < 160; i++) {
        pixVal = this.preCalculatedPixMap[tile][y][x]

        this.pixData.data[frameBufferOffset] = palettes[this.selectedPalette][pixVal][0]
        this.pixData.data[frameBufferOffset + 1] = palettes[this.selectedPalette][pixVal][1]
        this.pixData.data[frameBufferOffset + 2] = palettes[this.selectedPalette][pixVal][2]
        frameBufferOffset += 4

        x++
        x &= 0x07
        if (x === 0)
          tileOffs = (tileOffs + 1) & 0x1F;
          tile = this.readByte(mapOffs + lineOffs + tileOffs)
          if(this.bgTileMap == 1 && tile < 128) tile += 256;
        }
    }

  // The window is a seperate background drawn above the background
  this.drawWindowLine = function (frameBufferOffset) {

    var window = (this.windowX <= 7)
    var {mapOffs, lineOffs, tileOffs, x, y, tile} = window ? getInitialWindowValues() : getInitialBGValues()

    for (var i = 0; i < 160; i++) {
      pixVal = this.preCalculatedPixMap[tile][y][x]

      this.pixData.data[frameBufferOffset] = palettes[this.selectedPalette][pixVal][0]
      this.pixData.data[frameBufferOffset + 1] = palettes[this.selectedPalette][pixVal][1]
      this.pixData.data[frameBufferOffset + 2] = palettes[this.selectedPalette][pixVal][2]
      frameBufferOffset += 4

      x++
      x &= 0x07
      if (x === 0) {
        tileOffs = (tileOffs + 1) & 0x1F
        tile = this.readByte(mapOffs + lineOffs + tileOffs)
        if (this.bgTileMap === 1 && tile < 128) tile += 256
      }

      if (i === this.windowY - 6) {
        { mapOffs, lineOffs, tileOffs, x, y, tile } = getInitialWindowValues()
      }
    }
  }

  this.getInitialBGValues = function() {
    var mapOffs = this.bgTileMap ? 0x9C00 : 0x9800
    var lineOffs = ((this.line + this.scrollY) & 255) >> 3

    var tileOffs = this.scrollX >> 3

    var y = ( this.line + this.scrollY) & 0x07
    var x = this.scrollX & 0x07

    var tile = this.readByte(mapOffs + lineOffs + tileOffs)

    if (this.bgTileMap === 1 && tile < 128) tile += 256
    return { mapOffs, lineOffs, tileOffs, x, y, tile }
  }

  this.getInitialWindowValues = function () {
    var mapOffs = this.windowTileMap ? 0x9C00 : 0x9800
    var lineOffs = ((this.line - this.windowY) & 255) >> 3

    var tileOffs = this.windowX >> 3

    var y = ( this.line - this.windowY) & 0x07
    var x = (this.windowX < 7) ? 7 - this.windowX : 0

    var tile = this.readByte(mapOffs + lineOffs + tileOffs)

    if (this.windowTileMap === 1 && tile < 128) tile += 256
    return { mapOffs, lineOffs, tileOffs, x, y, tile }
  }

  this.drawSprites = function () {
    for (var i = 0; i < 40; i++) {
      this.drawSprite(this.spriteData[i])
    }
  }

  this.drawSprite = function (sprite) {
    // if sprite not hidden
    if (!(sprite.y | sprite.x)) {
      var tileOffset = sprite.tile * tileSize
      var tileData = this.tileSet[1].slice((tileOffset), tileOffset + this.spriteSize)
      var bgLine = sprite.y - spriteYDisplacement
      var objPalette = (sprite[3] >> 4) & 0x01

      // for each line in sprite
      for (var currentSpriteLine = 0; currentSpriteLine < this.spriteSize; currentSpriteLine++) {
        // if on screen
        if (this.lineOnScreen(sprite.y - spriteYDisplacement, currentSpriteLine)) {
          var spriteLineData = this.getSpriteLine(currentSpriteLine, sprite.orientation)
          // var spriteLine= tile.slice(j*2, (j*2)+2);
          // var spriteLine= tile.slice((16*this.spriteSize)-(j*2), (16*this.spriteSize)-(j*2)+2);
          var lineOffset = bgLine * 120 * 4
          // for each pixel in line
          for (var currentPixel = 0; currentPixel < 8; currentPixel++) {
            // if pix on screen
            if (this.pixOnScreen(sprite.x - spriteXdisplacement, currentPixel)) {
              var pixOffset = (sprite.x - spriteXdisplacement + currentPixel) * 4
              var pixelXVal = (sprite.orientation & 0x01) ? currentPixel : 7 - currentPixel
              var pixel = ((spriteLineData[1] >> pixelXVal) & 0x01) ? 2 : 0
              pixel += ((spriteLineData[0] >> pixelXVal) & 0x01) ? 1 : 0

              if (pixel) {
                // the sprite has priority
                if (!sprite.priority) {
                  this.pixData.data[lineOffset + pixOffset] = this.objPalettes[objPalette][pixel]
                  this.pixData.data[lineOffset + pixOffset + 1] = this.objPalettes[objPalette][pixel]
                  this.pixData.data[lineOffset + pixOffset + 2] = this.objPalettes[objPalette][pixel]
                } else if (this.bgPixIs0(currentSpriteLine, currentPixel, sprite.y, sprite.x)) {
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

  this.bgPixIs0 = function (currentLine, currentPixel, spriteY, spriteX) {
    var x = this.scrollX + spriteX + currentPixel - spriteXdisplacement
    var y = this.scrollY + spriteY + currentLine - spriteYDisplacement
    return !this.preCalculatedPixMap[y][x]
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

  this.precalculateTileLine = function (byte1, byte0) {
    var value = []
    for (var j = 0; j < 8; j++) {
      var pixel = byte1 & 0x01 ? 2 : 1
      pixel += byte0 & 0x01
      value.unshift(pixel)
      byte1 >>= 1
      byte0 >>= 1
    }
  }

  this.storePrecalcTile = function (srcAddr) {
    var tileSet = (srcAddr >= 9000) ? 1 : 0
    var bothTileSets = (srcAddr >= 0x8800 && srcAddr < 0x9000)
    srcAddr -= (srcAddr >= 0x8800) ? 8800 : 8000
    srcAddr &= 0xFFFE
    var destAddr = srcAddr / 2
    var byte0 = this.tileSet[tileSet][srcAddr]
    var byte1 = this.tileSet[tileSet][srcAddr + 1]
    var tileLine = this.precalculateTileLine(byte1, byte0)
    this.preCalculatedTileSet[tileSet][destAddr] = tileLine
    if (bothTileSets) { this.preCalculatedTileSet[0][destAddr - 0x400] = tileLine }
  }

  this.readByte = function (addr) {
    switch (addr & 0xF000) {
      case 0x8000:
      case 0x9000:

        if (addr >= 0x8000 && addr < 0x8800) {
          return this.tileSet[1][addr - 0x8000]
        } else if (addr >= 0x8800 && addr < 0x9000) {
          return this.tileSet[1][addr - 0x8000]
        } else if (addr >= 0x9000 && addr < 0x9800) {
          return this.tileSet[0][addr - 0x8800]
        } else if (addr >= 0x9800 && addr < 0x9C00) {
          addr -= 0x9800
          return this.tileMap[0][Math.floor(addr / 32)][addr % 32]
        } else if (addr >= 0x9C00 && addr < 0xA000) {
          addr -= 0x9C00
          return this.tileMap[1][Math.floor(addr / 32)][addr % 32]
        }
        break

      case 0xF000:
        switch (addr & 0xFF00) {
          case 0xFF00:
            switch (addr) {
              case 0xFF40:
                var val = this.bgEnable
                val |= this.spriteEnable * 0x02
                val |= (this.spriteSize - 1) * 0x04
                val |= this.bgTileMap * 0x08
                val |= this.activeTileSet * 0x10
                val |= this.windowEnabled * 0x20
                val |= this.windowTileMap * 0x40
                val |= this.lcdEnable * 0x80
                return val

              case 0xFF41:
                val = this.mode
                val |= this.coincidenceFlag * 0x04
                val |= this.hBlankInterruptEnable * 0x08
                val |= this.vBlankInterruptEnable * 0x10
                val |= this.OAMinterruptEnable * 0x20
                val |= this.coincidenceInterruptEnable * 0x40
                return val

              case 0xFF42:
                return this.scrollY

              case 0xFF43:
                return this.scrollX

              case 0xFF44:
                return this.line

              default:
                return this.MEMORY[addr]
            }
        }
    }
  }

  this.writeByte = function (data, addr) {
    switch (addr & 0xF000) {
      case 0x8000:
      case 0x9000:

        if (addr >= 0x8000 && addr < 0x8800) {
          this.tileSet[1][addr - 0x8000] = data
          this.storePrecalcTile(addr)
        } else if (addr >= 0x8800 && addr < 0x9000) {
          this.tileSet[1][addr - 0x8000] = data
          this.tileSet[0][addr - 0x8800] = data
          this.storePrecalcTile(addr)
        } else if (addr >= 0x9000 && addr < 0x9800) {
          this.tileSet[0][addr - 0x8800] = data
          this.storePrecalcTile(addr)
        } else if (addr >= 0x9800 && addr < 0x9C00) {
          addr -= 0x9800
          this.tileMap[0][Math.floor(addr / 32)][addr % 32] = data
        } else if (addr >= 0x9C00 && addr < 0xA000) {
          addr -= 0x9C00
          this.tileMap[1][Math.floor(addr / 32)][addr % 32] = data
        }
        break

      case 0xF000:
        switch (addr & 0xFF00) {
          case 0xFF00:
            switch (addr) {
              case 0xFF40:
                this.bgEnable = (data & 0x01) ? 1 : 0
                this.spriteEnable = (data & 0x02) ? 1 : 0
                this.spriteSize = (data & 0x04) ? 2 : 1
                this.bgTileMap = (data & 0x08) ? 1 : 0
                this.activeTileSet = (data & 0x10) ? 1 : 0
                this.windowEnabled = (data & 0x20) ? 1 : 0
                this.windowTileMap = (data & 0x40) ? 1 : 0
                this.lcdEnable = (data & 0x80) ? 1 : 0
                break

              case 0xFF41:
                this.hBlankInterruptEnable = (data & 0x08) ? 1 : 0
                this.vBlankInterruptEnable = (data & 0x10) ? 1 : 0
                this.OAMinterruptEnable = (data & 0x20) ? 1 : 0
                this.coincidenceInterruptEnable = (data * 0x40) ? 1 : 0
                break

              case 0xFF42:
                this.scrollY = data
                break

              case 0xFF43:
                this.scrollX = data
                break

              case 0xFF44:
                this.line = data
                break

              case 0xFF47:
                this.MEMORY[addr] = data
                for (var i = 0; i < 4; i++) {
                  var ref = data & 0x03
                  switch (ref) {
                    case 0:
                      this.paletteRef[i] = []
                      break

                    case 1:
                      this.paletteRef[i] = 192
                      break

                    case 2:
                      this.paletteRef[i] = 96
                      break

                    case 3:
                      this.paletteRef[i] = 0
                      break
                  }
                  data = data >> 2
                }
                break

              case 0xFF48:
                this.MEMORY[addr] = data
                for (var i = 0; i < 4; i++) {
                  var ref = data & 0x03
                  switch (ref) {
                    case 0:
                      this.objPalettes[0][i] = 255
                      break

                    case 1:
                      this.objPalettes[0][i] = 192
                      break

                    case 2:
                      this.objPalettes[0][i] = 96
                      break

                    case 3:
                      this.objPalettes[0][i] = 0
                      break
                  }
                  data = data >> 2;
                }
                break

              case 0xFF49:
                this.MEMORY[addr] = data
                for (var i = 0; i < 4; i++) {
                  var ref = data & 0x03
                  switch (ref) {

                    case 0:
                      this.objPalettes[1][i] = 255
                      break

                    case 1:
                      this.objPalettes[1][i] = 192
                      break

                    case 2:
                      this.objPalettes[1][i] = 96
                      break

                    case 3:
                      this.objPalettes[1][i] = 0
                      break
                  }
                  data = data >> 2
                }
                break

              case 0xFF4A:
                this.windowY = data
                break

              case 0xFF4B:
                this.windowX = data
                break
            }
        }
    }
  }

  this.showState = function () {
    console.log('gpu mode: ', this.mode)
    console.log('tCount: ', this.tCount)
    console.log('LCD Control (FF40): ', this.readByte(0xFF40).toString(16))
    console.log('LCD STAT (FF41): ', this.readByte(0xFF41).toString(16))
    console.log('scrollY: (FF42)', this.scrollY.toString(16))
    console.log('scrollX: (FF43)', this.scrollX.toString(16))
    console.log('line: (FF44)', this.line.toString(16))
    console.log('LYC: (FF45)', this.lyCompare.toString(16))
    console.log('BG Pal(FF47): ', this.bgPal.toString(16))
  }
}

var palettes =
[
  [ // original
    [224, 248, 208],
    [136, 192, 112],
    [52, 104, 86],
    [8, 24, 32],
  ],
]

module.exports = { Display: Display }



  // this.getInitialBGValues = function () {
  //   var vals = {}
  //   vals.offsetY = ((this.scrollY + this.line) % tileWidth)
  //   vals.tileY = (Math.floor((this.scrollY + this.line) / tileWidth)) % mapWidth
  //   vals.tileX = Math.floor(this.scrollX / tileWidth)
  //   vals.offsetX = this.scrollX % tileWidth
  //   return vals
  // }
  //
  // this.prepareScanlineData = function (data) {
  //   var { offsetX, offsetY, tileX, tileY } = data
  //   var line = []
  //   var len = offsetX ? 21 : 20
  //
  //   for (var i = 0; i < len; i++) {
  //     var tile = this.tileMap[this.bgTileMap][tileY][tileX]
  //     tile = (this.activeTileSet) ? tile : signDecode(tile) + 128
  //     tile *= tileSize
  //     line.concat(this.tileSet[this.activeTileSet][tile + offsetY])
  //     tileX = (tileX + 1) % mapWidth
  //   }
  //   return (offsetX) ? line.splice(offsetX, 160) : line
  // }
  //
  // this.getWindowTile = function (i) {
  //   var tileY = (Math.floor((this.line - this.windowY) / 8)) % 32
  //   var tileX = (Math.floor((i - this.windowX + 7) / 8)) % 32
  //   var tile = this.tileMap[this.windowTileMap][tileX][tileY]
  //   tile = (this.activeTileSet) ? tile : signDecode(tile) + 128
  //   return tileSize * tile
  // }

  // var vals = this.getInitialWindowValues()
  // var bgLine = []
  //
  // for (var i = 0; i < vals.bgTiles; i++) {
  //   var tile = this.tileMap[this.bgTileMap][tileY][tileX]
  //   tile = (this.activeTileSet) ? tile : signDecode(tile) + 128
  //   tile *= tileSize
  //   bgLine.concat(this.tileSet[this.activeTileSet][tile + offsetY])
  //   vals.tileX = (vals.tileX + 1) % mapWidth
  // }
  //
  // bgLine = (!(vals.bgpixels % 8 + this.scrollX)) ? bgLine.splice(vals.offsetX, vals.bgpixels) : bgLine
  //
  // var windowLine = []
  //
  // for (i = 0; i < vals.windowTiles; i++) {
  //   var tile = this.tileMap[this.windowTileMap][tileY][tileX]
  //   tile = (this.activeTileSet) ? tile : signDecode(tile) + 128
  //   tile *= tileSize
  //   bgLine.concat(this.tileSet[this.activeTileSet][tile + offsetY])
  //   vals.tileX = (vals.tileX + 1) % mapWidth
  // }
  //
  // windowLine = (vals.window % 8) ? windowLine.splice(0, vals.windowPicels) : windowLine
  // var scanlineData = bgLine.concat(windowLine)
  //
  // scanlineData.map(pixVal => {
  //   this.pixData.data[frameBufferOffset] = palettes[this.selectedPalette][pixVal][0]
  //   this.pixData.data[frameBufferOffset + 1] = palettes[this.selectedPalette][pixVal][1]
  //   this.pixData.data[frameBufferOffset + 2] = palettes[this.selectedPalette][pixVal][2]
  //   frameBufferOffset += 4
  // })
  //
  // var offsetY = ((this.scrollY + this.line) % 8) * 2
  //
  // // draw BG pixels left of the window (if any)
  // for (var i = 0; i < this.windowX - 7; i++) {
  //   var offsetX = (this.scrollX + i) % 8
  //   var tileRef = this.getBGTile(i)
  //   var pix = this.getPixel(tileRef + offsetY, offsetX)
  //   this.putPixelData(frameBufferOffset, pix)
  //   frameBufferOffset += 4
  // }
  //
  // offsetY = ((this.line - this.windowY) % 8) * 2
  //
  // // draw Window tiles
  // for (i = this.windowX - 7; i < 160; i++) {
  //   offsetX = ((this.windowX + 7) + i) % 8
  //   tileRef = this.getWindowTile(i)
  //   var bit0 = (tileRef > 0x7F0) ? this.tileSet[1][tileRef + offsetY] : this.tileSet[0][tileRef + offsetY + 0x800]
  //   var bit1 = (tileRef > 0x7F0) ? this.tileSet[1][tileRef + offsetY + 1] : this.tileSet[0][tileRef + offsetY + 0x801]
  //
  //   pix = ((bit1 >> (7 - offsetX)) & 0x01) ? 2 : 0
  //   pix += ((bit0 >> (7 - offsetX)) & 0x01) ? 1 : 0
  //
  //   this.putPixelData(frameBufferOffset, pix)
  //   frameBufferOffset += 4
  // }
