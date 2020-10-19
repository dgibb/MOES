function MMU (display, input, timer, interruptRelay) {
  this.MEMORY = []
  this.mbc = null
  this.memdebug = 0

  this.readByte = function (addr) {
    switch (addr & 0xF000) {
      case 0x8000:
      case 0x9000:
        display.readByte(addr)
        break

      case 0xF000:
        switch (addr & 0xFF00) {
          case 0xFF00:
            switch (addr) {
              case 0xFF40:
              case 0xFF41:
              case 0xFF42:
              case 0xFF43:
              case 0xFF44:
              case 0xFF45:
                return display.readByte(addr)

              default:
                return this.MEMORY[addr]
            }

          case 0xFE00:

            if (addr >= 0xFE00 && addr < 0xFEA0) {
              var index = addr - 0xFE00
              return display.spriteData[Math.Floor(index / 4)][index % 4]
            } else {
              return this.MEMORY[addr]
            }

          default:
            return this.MEMORY[addr]
        }

      default:
        return this.MEMORY[addr]
    }
  }

  this.readWord = function (addr) {
    var data = this.readByte(addr + 1)
    data = data << 8
    data |= this.readByte(addr)
    return data
  }

  this.writeByte = function (data, addr) {
    switch (addr & 0xF000) {
      case 0x0000:
      case 0x1000:
      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
        if (this.mbc !== null) {
          this.mbc.writeByte()
        }
        break

      case 0x8000:
      case 0x9000:
        display.writeByte(data, addr)
        break

      case 0xF000:
        switch (addr & 0xFF00) {
          case 0xFF00:
            switch (addr) {
              case 0xFF00:
                this.MEMORY[0xFF00] |= 0xFF
                this.MEMORY[0xFF00] &= (data | 0xCF)
                if (!(data & 0x10)) { this.MEMORY[0xFF00] &= input.keys[0] }
                if (!(data & 0x20)) { this.MEMORY[0xFF00] &= input.keys[1] }
                if ((data & 0x30) === 0x30) { this.MEMORY[0xFF00] |= 0xFF }
                break

              case 0xFF04:
              case 0xFF05:
              case 0xFF06:
              case 0xFF07:
                timer.writeByte(data, addr)
                break

              case 0xFF0F:
                data |= 0xE0
                interruptRelay.request = data
                break

              case 0xFF40:
              case 0xFF42:
              case 0xFF43:
              case 0xFF44:
              case 0xFF45:
              case 0xFF46:
              case 0xFF47:
              case 0xFF48:
              case 0xFF49:
              case 0xFF4A:
              case 0xFF4B:
                display.writeByte(data, addr)

                // this.MEMORY[addr] = data
                // oamDMATransfer(data)
                // break
                                            

              default:
                this.MEMORY[addr] = data
                break
            }
            break

          default:
            this.MEMORY[addr] = data
            break
        }
        break

      default:
        this.MEMORY[addr] = data
        break
    }
  }

  this.writeWord = function (data, addr) {
    var data2 = data & 0xFF
    data = data >> 8
    this.writeByte(data, addr + 1)
    this.writeByte(data2, addr)
  }

  this.memoryInit = function () {
    this.mbc.MEMORY.fill(0, 256, 65536)
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
