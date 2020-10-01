function mbc0(byteArray) {

  this.readByte = function(addr) {

    switch (addr&0xF000) {

    case 0x8000:
    case 0x9000:

      if (addr >=  0x8000 && addr < 0x9000) {
        return tileSet1[addr - 0x8000];
      } else if (addr >=  0x9000 && addr < 0x9800) {
        return tileSet0[addr - 0x8800];
      } else if (addr >=  0x9800 && addr < 0x9C00) {
        addr -=  0x9800;
        return tileMap0[Math.floor(addr / 32)][addr % 32];
      } else if (addr >=  0x9C00 && addr < 0xA000) {
        addr -=  0x9C00;
        return tileMap1[Math.floor(addr / 32)][addr % 32];
      }
    break;

    case 0xF000:
      switch (addr & 0xFF00) {

        case 0xFF00:
        switch(addr) {

          case 0xFF42:
          return display.scrollY;

          case 0xFF43:
          return display.scrollX;

          case 0xFF44:
          return display.line;

          default:
          return MEMORY[addr];
        }
        break;

        case 0xFE00:

          if(addr >=  0xFE00 && addr < 0xFEA0) {
          return spriteData[addr - 0xFE00];
          } else {
            return MEMORY[addr];
          }
          break;

        default:
        return MEMORY[addr];
      }
    break;

    default:
    return MEMORY[addr];

    }
  };

  this.readWord = function(addr) {
    var data = memory.readByte(addr + 1);
    data = data << 8;
    data |=  memory.readByte(addr);
    return data;
  };

  this.writeByte = function(data, addr) {

    switch (addr & 0xF000) {

    case 0x0000:
    case 0x1000:
    case 0x2000:
    case 0x3000:
    case 0x4000:
    case 0x5000:
    case 0x6000:
    case 0x7000:
    break;

    case 0x8000:
    case 0x9000:

      if(addr >= 0x8000 && addr < 0x8800) {
        tileSet1[addr - 0x8000] = data;
      } else if (addr >= 0x8800 && addr < 0x9000) {
        tileSet1[addr - 0x8000] = data;
        tileSet0[addr - 0x8800] = data;
      } else if (addr >= 0x9000 && addr < 0x9800) {
        tileSet0[addr - 0x8800] = data;
      } else if (addr >= 0x9800 && addr < 0x9C00) {
        addr -=  0x9800;
        tileMap0[Math.floor(addr / 32)][addr % 32] = data;
      } else if (addr >= 0x9C00 && addr < 0xA000) {
        addr -=  0x9C00;
        tileMap1[Math.floor(addr / 32)][addr % 32] = data;
      }
    break;

    case 0xF000:
      switch (addr & 0xFF00) {

        case 0xFF00:
        switch(addr) {

          case 0xFF00:
          MEMORY[0xFF00] |= 0xFF;
          MEMORY[0xFF00] &= (data | 0xCF);
          if (!(data & 0x10)) {MEMORY[0xFF00] &= input.keys[0];}
          if (!(data & 0x20)) {MEMORY[0xFF00] &= input.keys[1];}
          if ((data & 0x30) === 0x30) {MEMORY[0xFF00] |= 0xFF;}
          break;

          case 0xFF04:
          MEMORY[addr] = 0;
          break;

          case 0xFF05:
          MEMORY[addr] = data;
          break;

          case 0xFF07:

          MEMORY[addr] = data;

          if (data & 0x04) {MEMORY[0XFF05] = 0;}

          if ((data & 0x03) === 0) {timer.timaSpeed = 1024;}
          else if ((data & 0x03) === 1) {timer.timaSpeed = 16;}
          else if ((data & 0x03) === 2) {timer.timaSpeed = 64;}
          else if ((data & 0x03) === 3) {timer.timaSpeed = 256;}

          break;

          case 0xFF0F:
          data |= 0xE0;
          MEMORY[addr] = data;
          break;

          case 0xFF40:
          MEMORY[addr] = data0;
          display.spriteSize = (data & 0x04) ? 2 : 1;
          display.windowOn = (data & 0x20) ? 1 : 0;
          display.windowMap = (data & 0x40) ? 1 : 0;
          break;

          case 0xFF42:
          display.scrollY = data;
          break;

          case 0xFF43:
          display.scrollX = data;
          break;

          case 0xFF44:
          display.line = data;
          break;

          case 0xFF46:
          MEMORY[addr] = data;
          memory.oamDMATransfer(data);
          break;

          case 0xFF47:
          MEMORY[0xFF47] = data;
          for (var i = 0; i < 4; i++) {
          var ref = data & 0x03;
            switch (ref) {

              case 0:
              paletteRef[i] = 255;
              break;

              case 1:
              paletteRef[i] = 192;
              break;

              case 2:
              paletteRef[i] = 96;
              break;

              case 3:
              paletteRef[i] = 0;
              break;
            }
          data = data >> 2;
          }
          break;

          case 0xFF48:
          MEMORY[0xFF48] = data;
          for (var i = 0; i < 4; i++) {
          var ref = data & 0x03;
            switch (ref) {

              case 0:
              objPalettes[0][i] = 255;
              break;

              case 1:
              objPalettes[0][i] = 192;
              break;

              case 2:
              objPalettes[0][i] = 96;
              break;

              case 3:
              objPalettes[0][i] = 0;
              break;
            }
          data = data >> 2;
          }
          break;

          case 0xFF49:
          MEMORY[0xFF49] = data;
          for (var i = 0; i < 4; i++) {
          var ref = data & 0x03;
            switch (ref) {

              case 0:
              objPalettes[1][i] = 255;
              break;

              case 1:
              objPalettes[1][i] = 192;
              break;

              case 2:
              objPalettes[1][i] = 96;
              break;

              case 3:
              objPalettes[1][i] = 0;
              break;
            }
          data = data >> 2;
          }
          break;

          case 0xFF4A:
          display.windowY = data;
          break;

          case 0xFF4B:
          display.windowX = data;
          break;

          default:
          MEMORY[addr] = data;
          break;

        }
        break;

        default:
        MEMORY[addr] = data;
        break;
      }
      break;

    default:
      MEMORY[addr] = data;
      break;
    }
  };

  this.writeWord = function(data, addr) {
    var data2 = data & 0xFF;
    data = data >> 8;
    this.writeByte(data, addr + 1);
    this.writeByte(data2, addr);
  };

  this.init = function(array) {
    for (var i = 0; i < 0x8000; i++) {
      MEMORY[i] = array[i];
    }
  };
}

module.exports = { mbc0: mbc0 };
