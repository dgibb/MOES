// jscs:disable requirePaddingNewLinesAfterBlocks

var instructions = {

  //0xE0
  ldh_n_a: function () {
    var addr = 0xFF00 | memory.readByte(cpu.pc + 1);
    memory.writeByte(cpu.a, addr);
  },

  //0xE1
  pop_hl: function () {
    cpu.l = memory.readByte(cpu.sp);
    cpu.h = memory.readByte(cpu.sp + 1);
    cpu.sp += 2;
  },

  //0xE2
  ldh_c_a: function () {
    var addr = 0xFF00 + cpu.c;
    memory.writeByte(cpu.a, addr);
  },

  //0xE3, 0xE4
  //unused

  //0xE5
  push_hl: function () {
    cpu.sp -= 2;
    memory.writeByte(cpu.h, cpu.sp + 1);
    memory.writeByte(cpu.l, cpu.sp);
  },

  //0xE6
  and_n: function () {
    var value = memory.readByte(cpu.pc + 1);
    cpu.a &= value;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xE7
  rst_20: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 1, cpu.sp);
    cpu.pc = 0x0020;
  },

  //0xE8
  add_sp_d: function () {
    var value = memory.readByte(cpu.pc + 1);
    if (value & 0x80) {value |= 0xFF00;}
    var result = cpu.sp + value;
    cpu.resetZeroFlag();
    cpu.resetSubFlag();
    if (((cpu.sp & 0x0F) + (value & 0x0F)) > 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (((cpu.sp & 0xFF) + (value & 0xFF)) > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.sp = result & 0xFFFF;
  },

  //0xE9
  jp_hl: function () {
    cpu.pc = cpu.getAddr(cpu.h, cpu.l);
  },

  //0xEA
  ld_nn_a: function () {
    memory.writeByte(cpu.a, memory.readWord(cpu.pc + 1));
  },

  //0xEE
  xor_n: function () {
    var value = memory.readByte(cpu.pc + 1);
    cpu.a ^= value;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xEF
  rst_28: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 1, cpu.sp);
    cpu.pc = 0x0028;
  },

  //0xF0
  ldh_a_n: function () {
    var addr = 0xFF00 + memory.readByte(cpu.pc + 1);
    cpu.a = memory.readByte(addr);
  },

  //0xF1
  pop_af: function () {
    cpu.f = memory.readByte(cpu.sp);
    cpu.f &= 0xF0;
    cpu.a = memory.readByte(cpu.sp + 1);
    cpu.sp += 2;
    cpu.m = 1; cpu.t = 12;
  },

  //0xF2
  ldh_a_c: function () {
    var addr = 0xFF00 | cpu.c;
    cpu.a = memory.readByte(addr);
  },

  //0xF3
  di: function () {
    cpu.ime = 0;
  },

  //0xF5
  push_af: function () {
    cpu.sp -= 2;
    memory.writeByte(cpu.a, cpu.sp + 1);
    memory.writeByte(cpu.f, cpu.sp);
  },

  //0xF6
  or_n: function () {
    cpu.a |= memory.readByte(cpu.pc + 1);
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xF7
  rst_30: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 1, cpu.sp);
    cpu.pc = 0x0030;
  },

  //0xF8
  ldhl_sp_d: function () {
    var value = memory.readByte(cpu.pc + 1);
    if (value & 0x80) {value |= 0xFF00;}
    var result = cpu.sp + value;
    cpu.h = (result >> 8) & 0xFF;
    cpu.l = result & 0xFF;
    if ((((cpu.sp & 0x0F) + (value & 0x0F)) > 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (((cpu.sp & 0xFF) + (value & 0xFF)) > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.resetZeroFlag();
    cpu.resetSubFlag();
  },

  //0xF9
  ld_sp_hl: function () {
    cpu.sp = cpu.getAddr(cpu.h, cpu.l);
  },

  //0xFA
  ld_a_nn: function () {
    cpu.a = memory.readByte(memory.readWord(cpu.pc + 1));
  },

  //0xFB
  ei: function () {
    cpu.ime = 1;
  },

  //0xFE
  cp_n: function () {
    var value = memory.readByte(cpu.pc + 1);
    var result = cpu.a - value;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (value & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xFF
  rst_38: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 1, cpu.sp);
    cpu.pc = 0x0038;
  },
};
