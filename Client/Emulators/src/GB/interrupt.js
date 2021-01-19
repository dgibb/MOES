function Interrupt (cpu, memory, timer, display) {
  this.step = function () {
    var requested = memory.MEMORY[0xFFFF] & memory.memory[0xFF0F]
    if (!requested) {
    } else if (this.vBlank.isRequested(requested)) {
      this.vBlank.trigger()
    } else if (this.lcdStat.isRequested(requested)) {
      this.lcdStat.trigger()
    } else if (this.timer.isRequested(requested)) {
      this.timer.trigger()
    } else if (this.serial.isRequested(requested)) {
      this.serial.trigger()
    } else if (this.joypad.isRequested(requested)) {
      this.joypad.trigger()
    }
  }

  this.vBlank = {
    isRequested: function (val) {
      return val & 0x01
    },
    trigger: function () {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x40
      cpu.ime = 0
      memory.MEMORY[0xFF0F] &= 0xFE
      timer.step(20)
      display.step(20)
    }
  }

  this.lcdStat = {
    isRequested: function (val) {
      return val & 0x02
    },
    trigger: function () {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x48
      cpu.ime = 0
      memory.mbc.MEMORY[0xFF0F] &= 0xFD
      timer.step(20)
      display.step(20)
    }
  }

  this.timer = {
    isRequested: function (val) {
      return val & 0x04
    },
    trigger: function () {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x50
      cpu.ime = 0
      memory.mbc.MEMORY[0xFF0F] &= 0xFB
      timer.step(20)
      display.step(20)
    }
  }

  this.serial = {
    isRequested: function (val) {
      return val & 0x08
    },
    trigger: function () {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x58
      cpu.ime = 0
      memory.mbc.MEMORY[0xFF0F] &= 0xF7
      timer.step(20)
      display.step(20)
    }
  }

  this.joypad = {
    isRequested: function (val) {
      return val & 0x10
    },
    trigger: function () {
      cpu.sp -= 2
      memory.writeWord(cpu.pc + 1, cpu.sp)
      cpu.pc = 0x60
      cpu.ime = 0
      memory.mbc.MEMORY[0xFF0F] &= 0xEF
      timer.step(20)
      display.step(20)
    }
  }
}

module.exports = { Interrupt: Interrupt }
