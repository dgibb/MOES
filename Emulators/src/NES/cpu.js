//David Gibb
var cpu = {

  a: 0,
  x: 0,
  y: 0,
  pc: 0,
  sp: 0xFD,
  sr: 0x20,
  clk: 0,
  cycle: 0,
  pcPrev: 0,

  //instructions

  //0x00
  BRK: function() {
    memory.writeWord((cpu.sp | 0x100) - 1, cpu.pc + 2);
    cpu.sp = (cpu.sp - 2) & 0xFF;
    memory.writeByte(cpu.sp | 0x100, cpu.sr | 0x30);
    cpu.sp = (cpu.sp - 1) & 0xFF;
    cpu.setInterruptFlag();
    cpu.pc = memory.readWord(memory.irqVector);
    cpu.clk = 7;
  },

  //0x01
  ORA_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    cpu.a |= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x02
  HLT: function() {
    //todo
  },

  //0x03 *illegal*
  SLO_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    cpu.a |= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },


  //0x04
  NOP: function() {
    cpu.pc += 1;
    cpu.clk = 2;
  },


  //0x05
  ORA_ZP: function() {
    cpu.a |= memory.readByte(memory.readByte(cpu.pc + 1));
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0x06
  ASL_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x07 *illegal*
  SLO_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    cpu.a |= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x08
  PHP: function() {
    memory.writeByte(cpu.sp | 0x100, (cpu.sr | 0x30));
    cpu.sp = (cpu.sp - 1) & 0xFF;
    cpu.pc += 1;
    cpu.clk = 3;
  },

  //0x09
  ORA_IMM: function() {
    cpu.a |= memory.readByte(cpu.pc + 1);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0x0A
  ASL_A: function() {
    if (cpu.a & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    cpu.a = (cpu.a << 1) & 0xFF;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x0B *illegal*
  ANC_IMM: function() {
    cpu.a &= memory.readByte(cpu.pc + 1);
    if (cpu.a & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0x0C:NOP
  TOP: function() {
    cpu.pc += 3;
    cpu.clk = 2;
  },


  //0x0D
  ORA_AB: function() {
    cpu.a |= memory.readByte(memory.readWord(cpu.pc + 1));
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x0E
  ASL_AB: function() {
    var addr = memory.readWord(cpu.pc + 1)
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0x0F *illegal*
  SLO_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    cpu.a |= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0x10
  BPL: function() {
    cpu.clk = 2;
    if (!cpu.negativeFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
      cpu.clk++;
    }
    cpu.pc += 2;
  },

  //0x11
  ORA_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    cpu.a |= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x12:HLT

  //0x13
  SLO_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    cpu.a |= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },
  //0x14:NOP

  //0x15
  ORA_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    cpu.a |= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x16
  ASL_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val)
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x17:SLO/ILL *illegal*
  SLO_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    cpu.a |= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x18
  CLC: function() {
    cpu.resetCarryFlag();
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x19
  ORA_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    cpu.a |= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x1A:NOP
  //0x1B:SLO/ILL*illegal*
  SLO_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    cpu.a |= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },
  //0x1C:NOP

  //0x1D
  ORA_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    cpu.a |= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  ASL_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val)
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0x1F:SLO/ILL
  SLO_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    memory.writeByte(addr, val);
    cpu.a |= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },


  //0x20
  JSR: function() {
    debug.callStack.push(cpu.pc.toString(16))
    memory.writeWord((cpu.sp | 0x100) - 1, cpu.pc + 2);
    cpu.sp -= 2;
    cpu.pc = memory.readWord(cpu.pc + 1);
    cpu.clk = 6;
  },

  //0x21
  AND_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    cpu.a &= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x22:HLT

  //0x23:RLA/ILL *illegal*
  RLA_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    cpu.a &= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },


  //0x24
  BIT_ZP: function() {
    var val = memory.readByte(memory.readByte(cpu.pc + 1));
    if (val & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val & 0x40) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    if (!(val & cpu.a)) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0x25
  AND_ZP: function() {
    cpu.a &= memory.readByte(memory.readByte(cpu.pc + 1));
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0x26
  ROL_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x27 *illegal*
  RLA_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    cpu.a &= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x28
  PLP: function() {
    cpu.sp = (cpu.sp + 1) & 0xFF;
    cpu.sr = memory.readByte(cpu.sp | 0x100);
    cpu.sr |= 0x20;
    cpu.sr &= 0xEF;
    cpu.pc += 1;
    cpu.clk = 4;
  },

  //0x29
  AND_IMM: function() {
    cpu.a &= memory.readByte(cpu.pc + 1);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0x2A
  ROL_A: function() {
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (cpu.a & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    cpu.a = (cpu.a << 1) & 0xFF;
    cpu.a |= carry;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x2B:ANC/ILL *illegal*

  BIT_AB: function() {
    var val = memory.readByte(memory.readWord(cpu.pc + 1));
    if (val & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val & 0x40) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    if (!(val & cpu.a)) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x2D
  AND_AB: function() {
    cpu.a &= memory.readByte(memory.readWord(cpu.pc + 1));
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x2E
  ROL_AB: function() {
    var addr = memory.readWord(cpu.pc + 1)
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0x2F:RLA/ILL *illegal*
  RLA_AB: function() {
    var addr = memory.readWord(cpu.pc + 1)
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    cpu.a &= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },


  //0x30
  BMI: function() {
    cpu.clk = 2;
    if (cpu.negativeFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
      cpu.clk++
    }
    cpu.pc += 2;
  },

  //0x31
  AND_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    cpu.a &= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x32:HLT

  //0x33:RLA/ILL *illegal*
  RLA_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    cpu.a &= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },
  //0x34:NOP

  //0x35
  AND_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    cpu.a &= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x36
  ROL_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val)
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x37:RLA/ILL *illegal*
  RLA_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    cpu.a &= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },


  //0x38
  SEC: function() {
    cpu.setCarryFlag();
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x39
  AND_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    cpu.a &= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x3A:NOP
  //0x3B:RLA/ILL *illegal*
  RLA_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    cpu.a &= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },
  //0x3C:NOP

  //0x3D
  AND_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    cpu.a &= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x3E
  ROL_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF;
    val |= carry;
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0x3F:RLA/ILL *illegal*
  RLA_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    var carry = (cpu.carryFlag()) ? 1 : 0;
    if (val & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val << 1) & 0xFF
    val |= carry;
    memory.writeByte(addr, val);
    cpu.a &= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0x40
  RTI: function() {
    debug.callStack.pop();
    cpu.sp = (cpu.sp + 1) & 0xFF;;
    cpu.sr = memory.readByte(cpu.sp | 0x100);
    cpu.sp = (cpu.sp + 2) & 0xFF;
    cpu.pc = memory.readWord((cpu.sp | 0x100) - 1);
    cpu.sr |= 0x20;
    cpu.sr &= 0xEF;
    cpu.clk = 6;
  },

  //0x41
  EOR_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    cpu.a ^= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x42:HLT

  //0x43 *illegal*
  SRE_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.a ^= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },
  //0x44:NOP

  EOR_ZP: function() {
    cpu.a ^= memory.readByte(memory.readByte(cpu.pc + 1));
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0x46
  LSR_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.resetNegativeFlag();
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x47 *illegal*
  SRE_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.a ^= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x48
  PHA: function() {
    memory.writeByte(((cpu.sp | 0x100) & 0x1FF), cpu.a);
    cpu.sp = (cpu.sp - 1) & 0xFF;
    //if(cpu.pc===0x3A0){console.log('PHA:', cpu.a.toString(16), cpu.x.toString(16), cpu.y.toString(16), memory.readByte(((cpu.sp+1)|0x100)&0x1FF).toString(16),(((cpu.sp+1)|0x100)&0x1FF).toString(16), cpu.sp.toString(16), cpu.sr.toString(16));}
    cpu.pc += 1;
    cpu.clk = 3;
  },

  //0x49
  EOR_IMM: function() {
    cpu.a ^= memory.readByte(cpu.pc + 1);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0x4A
  LSR_A: function() {
    if (cpu.a & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    cpu.a = (cpu.a >> 1) & 0xFF;
    cpu.resetNegativeFlag();
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //40xB:SRE/ILL *illegal*
  ALR_IMM: function() {
    var val = memory.readByte(cpu.pc + 1);
    cpu.a &= val
    if (cpu.a & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    cpu.a = (cpu.a >> 1) & 0xFF;
    cpu.resetNegativeFlag();
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0x4C
  JMP_A: function() {
    addr = memory.readWord(cpu.pc + 1);
    cpu.pc = addr;
    cpu.clk = 3;
  },

  //0x4D
  EOR_AB: function() {
    cpu.a ^= memory.readByte(memory.readWord(cpu.pc + 1));
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x4E
  LSR_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val)
    cpu.resetNegativeFlag();
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0x4F *illegal*
  SRE_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.a ^= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0x50
  BVC: function() {
    cpu.clk = 2;
    if (!cpu.overflowFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
      cpu.clk += 1;
    }
    cpu.pc += 2;
  },

  //0x51
  EOR_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    cpu.a ^= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x52:HLT

  //0x53 *illegal*
  SRE_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.a ^= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },
  //0x54:NOP


  //0x55
  EOR_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    cpu.a ^= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x56
  LSR_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.resetNegativeFlag();
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x57:SRE/ILL *illegal*
  SRE_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.a ^= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x58
  CLI: function() {
    cpu.resetInterruptFlag();
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x59
  EOR_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    cpu.a ^= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x5A:NOP
  //0x5B:SLO/ILL*illegal*
  SRE_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.a ^= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },
  //0x5C:NOP

  //0x5D
  EOR_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    cpu.a ^= memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x5E
  LSR_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.resetNegativeFlag();
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0x5F *illegal*
  SRE_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    cpu.a ^= val;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0x60
  RTS: function() {
    debug.callStack.pop();
    cpu.sp = (cpu.sp + 2) & 0xFF;
    cpu.pc = memory.readWord((cpu.sp | 0x100) - 1) + 1;
    cpu.clk = 6;
  },

  //0x61
  ADC_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = memory.readByte(addr);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x62:HLT

  //0x63 *illegal*
  RRA_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },
  //0x64:NOP

  //0x65
  ADC_ZP: function() {
    var addr = (memory.readByte(cpu.pc + 1));
    var val = memory.readByte(addr);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0x66
  ROR_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    memory.writeByte(addr, val);
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x67 *illegal*
  RRA_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x68
  PLA: function() {
    cpu.sp = (cpu.sp + 1) & 0xFF;
    cpu.a = memory.readByte(cpu.sp | 0x100);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 4;
  },

  //0x69
  ADC_IMM: function() {
    var val = memory.readByte(cpu.pc + 1);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0x6A
  ROR_A: function() {
    if (cpu.carryFlag()) {
      cpu.a |= 0x100;
    }
    if (cpu.a & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    cpu.a = (cpu.a >> 1);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x6B *illegal*
  ARR_IMM: function() {
    cpu.a &= memory.readByte(cpu.pc + 1);
    if ((cpu.a ^ (cpu.a >> 1)) & 0x40) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    if (cpu.carryFlag()) {
      cpu.a |= 0x100;
    }
    if (cpu.a & 0x80) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    cpu.a = (cpu.a >> 1);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0x6C
  JMP_I: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var jump = memory.readWord(addr)
    if ((addr & 0xFF) === 0xFF) {
      jump &= 0xFF;
      jump |= (memory.readByte(addr - 0xFF) << 8);
    }
    cpu.pc = jump;
    cpu.clk = 5;
  },

  //0x6D
  ADC_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x6E
  ROR_AB: function() {
    var addr = memory.readWord(cpu.pc + 1)
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    memory.writeByte(addr, val);
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0x6F:ILL
  RRA_AB: function() {
    var addr = memory.readWord(cpu.pc + 1)
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },


  //0x70
  BVS: function() {
    cpu.clk = 2;
    if (cpu.overflowFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
      cpu.clk += 1;
    }
    cpu.pc += 2;
  },

  //0x71
  ADC_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = memory.readByte(addr)
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0x72:HLT

  //0x73 *illegal*
  RRA_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },
  //0x74:NOP

  //0x75
  ADC_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr)
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x76
  ROR_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    memory.writeByte(addr, val);
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x77*illegal*
  RRA_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x78
  SEI: function() {
    cpu.setInterruptFlag();
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x79
  ADC_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr)
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x7A:NOP
  //0x7B:RLA/ILL *illegal*
  RRA_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },
  //0x7C:NOP

  //0x7D
  ADC_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr)
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x7E
  ROR_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    memory.writeByte(addr, val);
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0x7F *illegal*
  RRA_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    if (cpu.carryFlag()) {
      val |= 0x100;
    }
    if (val & 0x01) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    val = (val >> 1);
    memory.writeByte(addr, val);
    var carry = cpu.carryFlag() ? 1 : 0;
    var result = (cpu.a + val + carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (val ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0x80:NOP

  //0x81
  STA_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    memory.writeByte(addr, cpu.a);
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x82:NOP

  //0x83 *illegal*
  SAX_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = cpu.a & cpu.x
    memory.writeByte(addr, val);
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x84
  STY_ZP: function() {
    memory.writeByte(memory.readByte(cpu.pc + 1), cpu.y);
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x85
  STA_ZP: function() {
    memory.writeByte(memory.readByte(cpu.pc + 1), cpu.a);
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x86
  STX_ZP: function() {
    memory.writeByte(memory.readByte(cpu.pc + 1), cpu.x);
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x87 *illegal*
  SAX_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = cpu.a & cpu.x
    memory.writeByte(addr, val);
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0x88
  DEY: function() {
    cpu.y = (cpu.y - 1) & 0xFF
    if (cpu.y > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x89:
  DOP: function() {
    cpu.pc += 2;
    cpu.clk = 2;
  },


  //0x8A
  TXA: function() {
    cpu.a = cpu.x;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x8B:ILL
  XAA_IMM: function() {
    cpu.a = cpu.x;
    cpu.a &= memory.readByte(cpu.pc + 1);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x8C
  STY_AB: function() {
    memory.writeByte(memory.readWord(cpu.pc + 1), cpu.y);
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x8D
  STA_AB: function() {
    memory.writeByte(memory.readWord(cpu.pc + 1), cpu.a);
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x8E
  STX_AB: function() {
    memory.writeByte(memory.readWord(cpu.pc + 1), cpu.x);
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x8F:ILL
  SAX_AB: function() {
    var addr = memory.readWord(cpu.pc + 1)
    var val = cpu.a & cpu.x
    memory.writeByte(addr, val);
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0x90
  BCC: function() {
    cpu.clk = 2;
    if (!cpu.carryFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
      cpu.clk += 1;
    }
    cpu.pc += 2;
  },

  //0x91
  STA_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    memory.writeByte(addr, cpu.a);
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x92:HLT
  //0x93: *illegal*
  AHX_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    memory.writeByte(addr, (cpu.a & cpu.x & (addr >> 8)));
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0x94
  STY_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    memory.writeByte(addr, cpu.y);
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x95
  STA_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    memory.writeByte(addr, cpu.a);
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x96
  STX_ZPY: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.y) & 0xFF;
    memory.writeByte(addr, cpu.x);
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x97:ILL
  SAX_ZPY: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.y) & 0xFF;
    var val = cpu.a & cpu.x
    memory.writeByte(addr, val);
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0x98
  TYA: function() {
    cpu.a = cpu.y;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x99
  STA_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    memory.writeByte(addr, cpu.a);
    cpu.pc += 3;
    cpu.clk = 5;
  },

  //0x9A
  TXS: function() {
    cpu.sp = cpu.x;
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0x9B:ILL
  TAS_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    cpu.sp = cpu.a & cpu.x;
    memory.writeByte(addr, cpu.sp & (addr >> 8));
    cpu.pc += 3;
    cpu.clk = 5;
  },

  //0x9C:ILL
  SHY_ABX: function() {
    var andByte = memory.readByte(cpu.pc + 2);
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var result = andByte & cpu.y;
    if ((memory.readWord(cpu.pc + 1) & 0xFF) === (addr & 0xFF)) {
      memory.writeByte(addr, result);
    }
    cpu.pc += 3;
    cpu.clk = 5;
  },

  //0x9D
  STA_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    memory.writeByte(addr, cpu.a);
    cpu.pc += 3;
    cpu.clk = 5;
  },

  //0x9E:ILL
  SHX_ABY: function() {
    var andByte = memory.readByte(cpu.pc + 2) + 1;
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var result = andByte & cpu.x;
    memory.writeByte(addr, result);
    //console.log(cpu.y, '&', andByte, '=', result)
    cpu.pc += 3;
    cpu.clk = 5;
  },

  //0x9F:ILL
  AHX_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    memory.writeByte(addr, (cpu.a & cpu.x & (addr >> 8)));
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0xA0
  LDY_IMM: function() {
    cpu.y = memory.readByte(cpu.pc + 1);
    if (cpu.y > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0xA1
  LDA_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    cpu.a = memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0xA2
  LDX_IMM: function() {
    cpu.x = memory.readByte(cpu.pc + 1);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0xA3 *illegal*
  LAX_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    cpu.a = memory.readByte(addr);
    cpu.x = memory.readByte(addr);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },


  //0xA4
  LDY_ZP: function() {
    cpu.y = memory.readByte(memory.readByte(cpu.pc + 1));
    if (cpu.y > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0xA5
  LDA_ZP: function() {
    cpu.a = memory.readByte(memory.readByte(cpu.pc + 1));
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //A6
  LDX_ZP: function() {
    cpu.x = memory.readByte(memory.readByte(cpu.pc + 1));
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0xA7 *illegal*
  LAX_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    cpu.a = memory.readByte(addr);
    cpu.x = memory.readByte(addr);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0xA8
  TAY: function() {
    cpu.y = cpu.a;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xA9
  LDA_IMM: function() {
    cpu.a = memory.readByte(cpu.pc + 1);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0xAA
  TAX: function() {
    cpu.x = cpu.a;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xAB *illegal*
  LAX_IMM: function() {
    cpu.a = memory.readByte(cpu.pc + 1);
    cpu.x = memory.readByte(cpu.pc + 1);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0xAC
  LDY_AB: function() {
    cpu.y = memory.readByte(memory.readWord(cpu.pc + 1));
    if (cpu.y > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xAD
  LDA_AB: function() {
    cpu.a = memory.readByte(memory.readWord(cpu.pc + 1));
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xAE
  LDX_AB: function() {
    cpu.x = memory.readByte(memory.readWord(cpu.pc + 1));
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xAF *illegal*
  LAX_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    cpu.a = memory.readByte(addr);
    cpu.x = memory.readByte(addr);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xB0
  BCS: function() {
    cpu.clk = 2;
    if (cpu.carryFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
      cpu.clk += 1;
    }
    cpu.pc += 2;
  },

  //0xB1
  LDA_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    cpu.a = memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0xB2:HLT

  //0xB3:*illegal*
  LAX_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    cpu.a = memory.readByte(addr);
    cpu.x = memory.readByte(addr);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    //if (cpu.pc===0x3A0){console.log(addr.toString(16),((memory.readByte(cpu.pc+1)+cpu.x)&0xFF).toString(16));}
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0xB4
  LDY_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    cpu.y = memory.readByte(addr);
    if (cpu.y > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0xB5
  LDA_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    cpu.a = memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },


  //0xB6
  LDX_ZPY: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.y) & 0xFF;
    cpu.x = memory.readByte(addr);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0xB7:ILL
  LAX_ZPY: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.y) & 0xFF;
    cpu.a = memory.readByte(addr);
    cpu.x = memory.readByte(addr);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0xB8
  CLV: function() {
    cpu.resetOverflowFlag();
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xB9
  LDA_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    cpu.a = memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xBA
  TSX: function() {
    cpu.x = cpu.sp;
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xBB:ILL
  LAS_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr);
    val &= cpu.sp;
    cpu.a = val;
    cpu.x = val;
    cpu.sp = val;
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xBC
  LDY_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    cpu.y = memory.readByte(addr);
    if (cpu.y > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xBD
  LDA_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    cpu.a = memory.readByte(addr);
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xBE
  LDX_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    cpu.x = memory.readByte(addr);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xBF:ILL
  LAX_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    cpu.a = memory.readByte(addr);
    cpu.x = memory.readByte(addr);
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xC0
  CPY_IMM: function() {
    var val = memory.readByte(cpu.pc + 1);
    if ((cpu.y - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.y === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0xC1
  CMP_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = memory.readByte(addr);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0xC2:NOP

  //0xC3 *illegal*
  DCP_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },


  //0xC4
  CPY_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if ((cpu.y - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.y === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  CMP_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0xC6
  DEC_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0xC7 *illegal*
  DCP_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },


  //0xC8
  INY: function() {
    cpu.y = (cpu.y + 1) & 0xFF;
    if (cpu.y > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xC9
  CMP_IMM: function() {
    var val = memory.readByte(cpu.pc + 1);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0xCA
  DEX: function() {
    cpu.x = (cpu.x - 1) & 0xFF
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xCB *illegal*
  AXS_IMM: function() {
    cpu.x &= cpu.a;
    var val = ((~(memory.readByte(cpu.pc + 1))) & 0xFF) + 1;
    var result = (cpu.x + val);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    cpu.x = result;
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0xCC
  CPY_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    if ((cpu.y - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.y >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.y === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xCD
  CMP_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xCE
  DEC_AB: function() {
    var addr = memory.readWord(cpu.pc + 1)
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0xCF:ILL
  DCP_AB: function() {
    var addr = memory.readWord(cpu.pc + 1)
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF;
    memory.writeByte(addr, val);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //0xD0
  BNE: function() {
    cpu.clk = 2;
    if (!cpu.zeroFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
      cpu.clk += 1;
    }
    cpu.pc += 2;
  },

  //0xD1
  CMP_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = memory.readByte(addr);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0xD2:HLT
  //0xD3 *illegal
  DCP_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },
  //0xD4:NOP

  //0xD5
  CMP_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0xD6
  DEC_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0xD7:ILL
  DCP_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0xD8
  CLD: function() {
    cpu.resetDecimalFlag();
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xD9
  CMP_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xDA:NOP
  //0xDB:ILL
  DCP_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },
  //0xDC:NOP

  //0xDD
  CMP_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xDE
  DEC_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0xDF *illegal*
  DCP_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    val = (val - 1) & 0xFF
    memory.writeByte(addr, val);
    if ((cpu.a - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.a === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0xE0
  CPX_IMM: function() {
    var val = memory.readByte(cpu.pc + 1);
    if ((cpu.x - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.x === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },
  //0xE1
  SBC_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = ((~(memory.readByte(addr))) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0xE2:NOP

  //0xE3 *illegal*
  ISC_IX: function() {
    var addr = memory.readWord((memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF);
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    var val = ((~val) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },

  //0xE4
  CPX_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    if ((cpu.x - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.x === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0xE5
  SBC_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = ((~(memory.readByte(addr))) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 3;
  },

  //0xE6
  INC_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0xE7 *illegal*
  ISC_ZP: function() {
    var addr = memory.readByte(cpu.pc + 1);
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    var val = ((~val) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0xE8
  INX: function() {
    cpu.x = (cpu.x + 1) & 0xFF;
    if (cpu.x > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xE9
  SBC_IMM: function() {
    var val = ((~(memory.readByte(cpu.pc + 1))) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 2;
  },

  //0xEA:NOP
  //0xEB:ILL

  //0xEC
  CPX_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    if ((cpu.x - val) & 0x80) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.x >= val) {
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (cpu.x === val) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xED
  SBC_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = ((~(memory.readByte(addr))) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xEE
  INC_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },

  //EF:ILL
  ISC_AB: function() {
    var addr = memory.readWord(cpu.pc + 1);
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    var val = ((~val) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 6;
  },


  //0xF0
  BEQ: function() {
    cpu.clk = 2;
    if (cpu.zeroFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
      cpu.clk += 1;
    }
    cpu.pc += 2;
  },

  //0xF1
  SBC_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = ((~(memory.readByte(addr))) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 5;
  },

  //0xF2:HLT
  //0xF3:ILL
  ISC_IY: function() {
    var addr = memory.readWord(memory.readByte(cpu.pc + 1)) + cpu.y;
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    var val = ((~val) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 8;
  },
  //0xF4:NOP

  //0xF5
  SBC_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = ((~(memory.readByte(addr))) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 4;
  },

  //0xF6
  INC_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF;
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },

  //0xF7:ILL
  ISC_ZPX: function() {
    var addr = (memory.readByte(cpu.pc + 1) + cpu.x) & 0xFF;
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    var val = ((~val) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 2;
    cpu.clk = 6;
  },


  //0xF8
  SED: function() {
    cpu.setDecimalFlag();
    cpu.pc += 1;
    cpu.clk = 2;
  },

  //0xF9
  SBC_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = ((~(memory.readByte(addr))) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },

  //0xFA:NOP
  //0xFB:ILL
  ISC_ABY: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.y;
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    var val = ((~val) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },
  //0xFC:NOP

  //0xFD
  SBC_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = ((~(memory.readByte(addr))) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 4;
  },


  //0xFE
  INC_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF;
    memory.writeByte(addr, val);
    if (val > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (val === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //0xFF *illegal*
  ISC_ABX: function() {
    var addr = memory.readWord(cpu.pc + 1) + cpu.x;
    var val = memory.readByte(addr);
    val = (val + 1) & 0xFF
    memory.writeByte(addr, val);
    var val = ((~val) & 0xFF) + 1;
    var carry = cpu.carryFlag() ? 0 : 1;
    var result = (cpu.a + val - carry);
    if (result & 0x100) {
      result &= 0xFF;
      cpu.setCarryFlag();
    } else {
      cpu.resetCarryFlag();
    }
    if (((cpu.a ^ result) & (((val - 1) & 0xFF) ^ result)) & 0x80) {
      cpu.setOverflowFlag();
    } else {
      cpu.resetOverflowFlag();
    }
    cpu.a = result;
    if (cpu.a > 0x7F) {
      cpu.setNegativeFlag();
    } else {
      cpu.resetNegativeFlag();
    }
    if (cpu.a === 0) {
      cpu.setZeroFlag();
    } else {
      cpu.resetZeroFlag();
    }
    cpu.pc += 3;
    cpu.clk = 7;
  },

  //flag setting functions

  setCarryFlag: function() {
    cpu.sr |= 0x01;
  },

  resetCarryFlag: function() {
    cpu.sr &= 0xFE;
  },

  carryFlag: function() {
    if (cpu.sr & 0x01) {
      return true;
    } else {
      return false;
    }
  },

  setZeroFlag: function() {
    cpu.sr |= 0x02;
  },

  resetZeroFlag: function() {
    cpu.sr &= 0xFD;
  },

  zeroFlag: function() {
    if (cpu.sr & 0x02) {
      return true;
    } else {
      return false;
    }
  },

  setInterruptFlag: function() {
    cpu.sr |= 0x04;
  },

  resetInterruptFlag: function() {
    cpu.sr &= 0xFB;
  },

  interruptFlag: function() {
    if (cpu.sr & 0x04) {
      return true;
    } else {
      return false;
    }
  },

  setDecimalFlag: function() { //not used by NES
    cpu.sr |= 0x08;
  },

  resetDecimalFlag: function() { //not used by NES
    cpu.sr &= 0xF7;
  },

  decimalFlag: function() { //not used by NES
    if (cpu.sr & 0x08) {
      return true;
    } else {
      return false;
    }
  },

  setBreakFlag: function() {
    cpu.sr |= 0x10;
  },

  resetBreakFlag: function() {
    cpu.sr &= 0xEF;
  },

  breakFlag: function() {
    if (cpu.sr & 0x10) {
      return true;
    } else {
      return false;
    }
  },

  setA1Flag: function() {
    cpu.sr |= 0x20;
  },

  resetA1Flag: function() {
    cpu.sr &= 0xDF;
  },

  a1Flag: function() {
    if (cpu.sr & 0x20) {
      return true;
    } else {
      return false;
    }
  },

  setOverflowFlag: function() {
    cpu.sr |= 0x40;
  },

  resetOverflowFlag: function() {
    cpu.sr &= 0xBF;
  },

  overflowFlag: function() {
    if (cpu.sr & 0x40) {
      return true;
    } else {
      return false;
    }
  },

  setNegativeFlag: function() {
    cpu.sr |= 0x80;
  },

  resetNegativeFlag: function() {
    cpu.sr &= 0x7F;
  },

  negativeFlag: function() {
    if (cpu.sr & 0x80) {
      return true;
    } else {
      return false;
    }
  },

  //processor functions

  ex: function(opcode) {
    cpu.pcPrev = cpu.pc;
    instructionMap[opcode]();
    cpu.cycle += cpu.clk;
    for (var i = 0; i < 3 * cpu.clk; i++) {
      ppu.step();
      if (memory.mapper.interrupts) {
        memory.mapper.step();
      }
      ppu.spriteEval();
    }
    input.step();
    if (ppu.vblDelay) {
      ppu.vblDelay = 0;
      ppu.nmiEnable = 1;
    }
    if (ppu.queuedIntCycles) {
      ppu.runIntCycles();
    }
  },

  reset: function() {
    cpu.a = 0;
    cpu.y = 0;
    cpu.x = 0;
    cpu.sp = 0xFD;
    cpu.pc = memory.readWord(memory.resetVector);
  },

  runInstruction: function() {
    cpu.showFunc();
    cpu.ex(memory.readByte(cpu.pc));
    cpu.showState();
    ppu.showState();

  },

  //print functions

  showFunc: function() {
    console.log('executing: MEMORY[', cpu.toHex4(cpu.pc), '], ', instructionMap[memory.readByte(cpu.pc)].name, ', hex ', memory.readByte(cpu.pc).toString(16));
  },

  showState: function() {
    console.log('current state: ');
    console.log('A: ', cpu.toHex2(cpu.a));
    console.log('X: ', cpu.toHex2(cpu.x));
    console.log('Y: ', cpu.toHex2(cpu.y));
    console.log('SR: ', cpu.toHex2(cpu.sr));
    console.log('SP: ', cpu.toHex4(cpu.sp));
    console.log('PC: ', cpu.toHex4(cpu.pc));
    console.log('PCPREV: ', cpu.toHex4(cpu.pcPrev));
  },

  unimplemented: function() {
    console.log('unimplemented instruction', cpu.toHex2(memory.readByte(cpu.pc)), 'at', cpu.toHex4(cpu.pc));
  },

  //helper functions

  getAddr: function(a, b) { //finds and returns combined address of two 8bit values
    var addr = a;
    addr = addr << 8;
    addr |= b;
    return addr;
  },

  signDecode: function(val) {
    var neg = val & 0x80
    if (neg) {
      val = ~val & 0xFF;
      val++;
      val = -val;
    }
    return val;
  },



  toHex2: function(n) {
    var hex = n.toString(16);
    while (hex.length < 2) {
      hex = "0" + hex;
    }
    return hex;
  },

  toHex4: function(n) {
    var hex = n.toString(16);
    while (hex.length < 4) {
      hex = "0" + hex;
    }
    return hex;
  },

  //initialization functions

  wRamInit() {
    wRAM = new Array(0x800);
    for (var i = 0; i < wRAM.length; i++) {
      wRAM[i] = 0;
    }
  },

};

wRAM = [];

instructionMap = [
  cpu.BRK, //0x00;
  cpu.ORA_IX,
  cpu.HLT,
  cpu.SLO_IX,
  cpu.DOP,
  cpu.ORA_ZP,
  cpu.ASL_ZP,
  cpu.SLO_ZP,
  cpu.PHP,
  cpu.ORA_IMM,
  cpu.ASL_A,
  cpu.ANC_IMM,
  cpu.TOP,
  cpu.ORA_AB,
  cpu.ASL_AB,
  cpu.SLO_AB,
  cpu.BPL, //0x10
  cpu.ORA_IY,
  cpu.HLT,
  cpu.SLO_IY,
  cpu.DOP,
  cpu.ORA_ZPX,
  cpu.ASL_ZPX,
  cpu.SLO_ZPX,
  cpu.CLC,
  cpu.ORA_ABY,
  cpu.NOP,
  cpu.SLO_ABY,
  cpu.TOP,
  cpu.ORA_ABX,
  cpu.ASL_ABX,
  cpu.SLO_ABX,
  cpu.JSR, //0x20
  cpu.AND_IX,
  cpu.HLT,
  cpu.RLA_IX,
  cpu.BIT_ZP,
  cpu.AND_ZP,
  cpu.ROL_ZP,
  cpu.RLA_ZP,
  cpu.PLP,
  cpu.AND_IMM,
  cpu.ROL_A,
  cpu.ANC_IMM,
  cpu.BIT_AB,
  cpu.AND_AB,
  cpu.ROL_AB,
  cpu.RLA_AB,
  cpu.BMI, //0x30
  cpu.AND_IY,
  cpu.HLT,
  cpu.RLA_IY,
  cpu.DOP,
  cpu.AND_ZPX,
  cpu.ROL_ZPX,
  cpu.RLA_ZPX,
  cpu.SEC,
  cpu.AND_ABY,
  cpu.NOP,
  cpu.RLA_ABY,
  cpu.TOP,
  cpu.AND_ABX,
  cpu.ROL_ABX,
  cpu.RLA_ABX,
  cpu.RTI, //0x40
  cpu.EOR_IX,
  cpu.HLT,
  cpu.SRE_IX,
  cpu.DOP,
  cpu.EOR_ZP,
  cpu.LSR_ZP,
  cpu.SRE_ZP,
  cpu.PHA,
  cpu.EOR_IMM,
  cpu.LSR_A,
  cpu.ALR_IMM,
  cpu.JMP_A,
  cpu.EOR_AB,
  cpu.LSR_AB,
  cpu.SRE_AB,
  cpu.BVC, //0x50
  cpu.EOR_IY,
  cpu.HLT,
  cpu.SRE_IY,
  cpu.DOP,
  cpu.EOR_ZPX,
  cpu.LSR_ZPX,
  cpu.SRE_ZPX,
  cpu.CLI,
  cpu.EOR_ABY,
  cpu.NOP,
  cpu.SRE_ABY,
  cpu.TOP,
  cpu.EOR_ABX,
  cpu.LSR_ABX,
  cpu.SRE_ABX,
  cpu.RTS, //0x60
  cpu.ADC_IX,
  cpu.HLT,
  cpu.RRA_IX,
  cpu.DOP,
  cpu.ADC_ZP,
  cpu.ROR_ZP,
  cpu.RRA_ZP,
  cpu.PLA,
  cpu.ADC_IMM,
  cpu.ROR_A,
  cpu.ARR_IMM,
  cpu.JMP_I,
  cpu.ADC_AB,
  cpu.ROR_AB,
  cpu.RRA_AB,
  cpu.BVS, //0x70
  cpu.ADC_IY,
  cpu.HLT,
  cpu.RRA_IY,
  cpu.DOP,
  cpu.ADC_ZPX,
  cpu.ROR_ZPX,
  cpu.RRA_ZPX,
  cpu.SEI,
  cpu.ADC_ABY,
  cpu.NOP,
  cpu.RRA_ABY,
  cpu.TOP,
  cpu.ADC_ABX,
  cpu.ROR_ABX,
  cpu.RRA_ABX,
  cpu.DOP, //0x80
  cpu.STA_IX,
  cpu.DOP,
  cpu.SAX_IX,
  cpu.STY_ZP,
  cpu.STA_ZP,
  cpu.STX_ZP,
  cpu.SAX_ZP,
  cpu.DEY,
  cpu.DOP,
  cpu.TXA,
  cpu.XAA_IMM,
  cpu.STY_AB,
  cpu.STA_AB,
  cpu.STX_AB,
  cpu.SAX_AB,
  cpu.BCC, //0x90
  cpu.STA_IY,
  cpu.HLT,
  cpu.AHX_IY,
  cpu.STY_ZPX,
  cpu.STA_ZPX,
  cpu.STX_ZPY,
  cpu.SAX_ZPY,
  cpu.TYA,
  cpu.STA_ABY,
  cpu.TXS,
  cpu.TAS_ABY,
  cpu.SHY_ABX,
  cpu.STA_ABX,
  cpu.SHX_ABY,
  cpu.AHX_ABY,
  cpu.LDY_IMM, //0xA0
  cpu.LDA_IX,
  cpu.LDX_IMM,
  cpu.LAX_IX,
  cpu.LDY_ZP,
  cpu.LDA_ZP,
  cpu.LDX_ZP,
  cpu.LAX_ZP,
  cpu.TAY,
  cpu.LDA_IMM,
  cpu.TAX,
  cpu.LAX_IMM,
  cpu.LDY_AB,
  cpu.LDA_AB,
  cpu.LDX_AB,
  cpu.LAX_AB,
  cpu.BCS, //0xB0
  cpu.LDA_IY,
  cpu.HLT,
  cpu.LAX_IY,
  cpu.LDY_ZPX,
  cpu.LDA_ZPX,
  cpu.LDX_ZPY,
  cpu.LAX_ZPY,
  cpu.CLV,
  cpu.LDA_ABY,
  cpu.TSX,
  cpu.ILL,
  cpu.LDY_ABX,
  cpu.LDA_ABX,
  cpu.LDX_ABY,
  cpu.LAX_ABY,
  cpu.CPY_IMM, //0xC0
  cpu.CMP_IX,
  cpu.DOP,
  cpu.DCP_IX,
  cpu.CPY_ZP,
  cpu.CMP_ZP,
  cpu.DEC_ZP,
  cpu.DCP_ZP,
  cpu.INY,
  cpu.CMP_IMM,
  cpu.DEX,
  cpu.AXS_IMM,
  cpu.CPY_AB,
  cpu.CMP_AB,
  cpu.DEC_AB,
  cpu.DCP_AB,
  cpu.BNE, //0xD0
  cpu.CMP_IY,
  cpu.HLT,
  cpu.DCP_IY,
  cpu.DOP,
  cpu.CMP_ZPX,
  cpu.DEC_ZPX,
  cpu.DCP_ZPX,
  cpu.CLD,
  cpu.CMP_ABY,
  cpu.NOP,
  cpu.DCP_ABY,
  cpu.TOP,
  cpu.CMP_ABX,
  cpu.DEC_ABX,
  cpu.DCP_ABX,
  cpu.CPX_IMM, //0xE0
  cpu.SBC_IX,
  cpu.DOP,
  cpu.ISC_IX,
  cpu.CPX_ZP,
  cpu.SBC_ZP,
  cpu.INC_ZP,
  cpu.ISC_ZP,
  cpu.INX,
  cpu.SBC_IMM,
  cpu.NOP,
  cpu.SBC_IMM,
  cpu.CPX_AB,
  cpu.SBC_AB,
  cpu.INC_AB,
  cpu.ISC_AB,
  cpu.BEQ, //0xF0
  cpu.SBC_IY,
  cpu.HLT,
  cpu.ISC_IY,
  cpu.DOP,
  cpu.SBC_ZPX,
  cpu.INC_ZPX,
  cpu.ISC_ZPX,
  cpu.SED,
  cpu.SBC_ABY,
  cpu.NOP,
  cpu.ISC_ABY,
  cpu.TOP,
  cpu.SBC_ABX,
  cpu.INC_ABX,
  cpu.ISC_ABX
]
/*
SBC_TEST:function(){

	for (var carry=0;carry<2;carry++){

		for (var a=0;a<=0xFF;a+=0xF){

			for (var val=0;val<=0xFF;val+=0xF){

				var overflow;
				var newVal = ((~val)+1)&0xFF;
				var newCarry=(carry)?0:1;
				var result = (a+newVal-carry)&0xFF;
				if(((a ^ result) & (val ^ result))&0x80){overflow=1;}else{overflow=0;}
				console.log('A:',a.toString(16), 'VAL:',val.toString(16),'CARRY', carry.toString(16));
				console.log('RESULT:',result.toString(16));
				console.log('OVERFLOW:',overflow.toString(16));

			}
		}
	}
},
*/
