var interrupt = {

  step: function (addr) {

    if ((MEMORY[0xFFFF] & 0x01) && (MEMORY[0xFF0F] & 0x01)) {
      interrupt.vBlankInt()
    } else if ((MEMORY[0xFFFF] & 0x02) && (MEMORY[0xFF0F] & 0x02)) {
      interrupt.lcdStatInt()
    } else if ((MEMORY[0xFFFF] & 0x04) && (MEMORY[0xFF0F] & 0x04)) {
      interrupt.timerInt()
    } else if ((MEMORY[0xFFFF] & 0x08) && (MEMORY[0xFF0F]&0x08)) {
      interrupt.serialInt()
    } else if ((MEMORY[0xFFFF] & 0x10) && (MEMORY[0xFF0F]&0x10)) {
      interrupt.joypadInt()
    }
  },

  vBlankInt: function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x40
      cpu.ime = 0
      MEMORY[0xFF0F] &= 0xFE
      cpu.t = 20
      timer.step()
      display.step()
    }
  },

  lcdStatInt: function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x48
      cpu.ime = 0
      MEMORY[0xFF0F] &= 0xFD
      cpu.t = 20
      timer.step()
      display.step()
    }
  },

  timerInt: function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x50
      cpu.ime = 0
      MEMORY[0xFF0F] &= 0xFB
      cpu.t = 20
      timer.step()
      display.step()
    }
  },

  serialInt: function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc, cpu.sp)
      cpu.pc = 0x58
      cpu.ime = 0
      MEMORY[0xFF0F] &= 0xF7
      cpu.t = 20
      timer.step()
      display.step()
    }
  },

  joypadInt: function () {
    if (cpu.ime === 1) {
      cpu.sp -= 2
      memory.writeWord(cpu.pc + 1, cpu.sp)
      cpu.pc = 0x60
      cpu.ime = 0
      MEMORY[0xFF0F] &= 0xEF
      cpu.t = 20
      timer.step()
      display.step()
    }
  },

}
