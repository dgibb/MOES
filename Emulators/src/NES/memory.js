//David Gibb
var memory = {

  mapper: 0,
  irqVector: 0xFFFE,
  nmiVector: 0xFFFA,
  resetVector: 0xFFFC,

  readByte: function(addr) {

    switch (addr & 0xF000) {

      case 0x0000:
      case 0x1000:
        return wRAM[addr % 0x800];
        break;

      case 0x2000:
      case 0x3000:

        if (addr === 0x2014) {
          return ppu.oamDMA;
        } else {
          return ppu.readByte(addr);
        }

      case 0x4000:

        if (addr < 0x4020) {
          return apu.readByte(addr);
        } else {
          return memory.mapper.readByte(addr);
        }

        break;

      case 0x5000:
      case 0x6000:
      case 0x7000:
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:

        return memory.mapper.readByte(addr);

        break;
    }


  },

  readWord: function(addr) {
    if (addr === 0xFF) {
      var data = memory.readByte(addr - 0xFF);
    } else {
      var data = memory.readByte(addr + 1)
    }
    data = data << 8;
    data |= memory.readByte(addr);
    return data;
  },


  writeByte: function(addr, data) {

    switch (addr & 0xF000) {

      case 0x0000:
      case 0x1000:
        wRAM[addr % 0x800] = data;
        break;

      case 0x2000:
      case 0x3000:
        ppu.writeByte(addr, data);
        break;


      case 0x4000:

        if (addr < 0x4020) {
          if (addr === 0x4014) {
            ppu.oamDMA(data);
          } else {
            apu.writeByte(addr, data);
          }
        } else {
          memory.mapper.writeByte(addr, data);
        }
        break;

      case 0x5000:
      case 0x6000:
      case 0x7000:
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:

        memory.mapper.writeByte(addr, data);

        break;
    }
  },

  writeWord: function(addr, data) {
    var data2 = data & 0xFF;
    data = data >> 8;
    memory.writeByte(addr + 1, data);
    memory.writeByte(addr, data2);
  },

  printChecksums: function() {
    console.log(memory.readByte(0x12).toString(16), memory.readByte(0x13).toString(16), memory.readByte(0x14).toString(16), memory.readByte(0x15).toString(16))

  },

  printStack: function() {
    var ptr = cpu.sp | 0x100;
    while (ptr < 0x200) {
      console.log(cpu.toHex2(memory.readByte(ptr)));
      ptr++;
    }
  },

};

prgRom = [];
