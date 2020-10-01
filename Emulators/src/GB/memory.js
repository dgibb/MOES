function MMU () {

  this.MEMORY = []

  this.mbc = null
  this.memdebug = 0

  this.readByte = this.mbc.readByte
  this.readWord = this.mbc.readWord
  this.writeByte = this.mbc.writeByte
  this.writeWord = this.mbc.writeWord

  this.memoryInit = function () {
    MEMORY.fill(0, 256, 65536);
  }

  this.oamDMATransfer = function (addr) {
    addr = addr << 8
    for (var i = 0; i < 0xA0; i++) {
      MEMORY[0xFE00 + i] = MEMORY[addr + i]
    }
  }

  this.biosInit = function () {
    this.writeByte(0xFF, 0xFF00)
    this.writeByte(0xE1, 0xFF0F)
    this.writeByte(0x80, 0xFF10)
    this.writeByte(0xBF, 0xFF11)
    this.writeByte(0xF3, 0xFF12)
    this.writeByte(0xBF, 0xFF14)
    this.writeByte(0x3F, 0xFF16)
    this.writeByte(0xBF, 0xFF19)
    this.writeByte(0x7F, 0xFF1A)
    this.writeByte(0xFF, 0xFF1B)
    this.writeByte(0x9F, 0xFF1C)
    this.writeByte(0xBF, 0xFF1E)
    this.writeByte(0xFF, 0xFF20)
    this.writeByte(0xBF, 0xFF23)
    this.writeByte(0x77, 0xFF24)
    this.writeByte(0xF3, 0xFF25)
    this.writeByte(0xF1, 0xFF26)
    this.writeByte(0x91, 0xFF40)
    this.writeByte(0xFC, 0xFF47)
    this.writeByte(0xFF, 0xFF48)
    this.writeByte(0xFF, 0xFF49)
    console.log('bios initialized')
  }
}

module.exports = { MMU: MMU }
