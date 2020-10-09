function Interrupt (cpu, memory, timer, display) {
  this.step = function () {
    if ((memory.mmu.MEMORY[0xFFFF] & 0x01) && (memory.mmu.MEMORY[0xFF0F] & 0x01)) {
      this.vBlankInt()
    } else if ((memory.mmu.memory.mmu.MEMORY[0xFFFF] & 0x02) && (memory.mmu.MEMORY[0xFF0F] & 0x02)) {
      this.lcdStatInt()
    } else if ((memory.mmu.MEMORY[0xFFFF] & 0x04) && (memory.mmu.MEMORY[0xFF0F] & 0x04)) {
      this.timerInt()
    } else if ((memory.mmu.MEMORY[0xFFFF] & 0x08) && (memory.mmu.MEMORY[0xFF0F] & 0x08)) {
      this.serialInt()
    } else if ((memory.mmu.MEMORY[0xFFFF] & 0x10) && (memory.mmu.MEMORY[0xFF0F] & 0x10)) {
      this.joypadInt()
    }
  }

  this.vBlankInt = function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x40
      cpu.ime = 0
      memory.mmu.MEMORY[0xFF0F] &= 0xFE
      cpu.t = 20
      timer.step()
      display.step()
    }
  }

  this.lcdStatInt = function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x48
      cpu.ime = 0
      memory.mbc.memory.mmu.MEMORY[0xFF0F] &= 0xFD
      cpu.t = 20
      timer.step()
      display.step()
    }
  }

  this.timerInt = function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x50
      cpu.ime = 0
      memory.mmu.MEMORY[0xFF0F] &= 0xFB
      cpu.t = 20
      timer.step()
      display.step()
    }
  }

  this.serialInt = function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x58
      cpu.ime = 0
      memory.mmu.MEMORY[0xFF0F] &= 0xF7
      cpu.t = 20
      timer.step()
      display.step()
    }
  }

  this.joypadInt = function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc + 1, cpu.sp)
      cpu.pc = 0x60
      cpu.ime = 0
      memory.mmu.MEMORY[0xFF0F] &= 0xEF
      cpu.t = 20
      timer.step()
      display.step()
    }
  }
}

module.exports = { Interrupt: Interrupt }
