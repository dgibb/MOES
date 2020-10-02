var instructions ={};

  //0x00
  nop: function () {},

  //0x01
  ld_bc_nn: function () {
    cpu.b = memory.readByte(cpu.pc + 2);
    cpu.c = memory.readByte(cpu.pc + 1);
  },

  //0x02
  ld_bc_a: function () {
    var addr = cpu.b;
    addr = addr << 8;
    addr += cpu.c;
    memory.writeByte(cpu.a, addr);
  },

  //0x03
  inc_bc: function () {
    cpu.c++;
    cpu.c &= 0xFF;
    if (cpu.c === 0) {
      cpu.b++;
      cpu.b &= 0xFF;
    }
  },

  //0x04
  inc_b: function () {
    if ((cpu.b & 0x0F) === 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    cpu.b++;
    cpu.b &= 0xFF;
    if (cpu.b === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x05
  dec_b: function () {
    cpu.b--;
    cpu.b &= 0xFF;
    if (cpu.b === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    if ((cpu.b & 0x0F) === 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    cpu.setSubFlag();
  },

  //0x06
  ld_b_n: function () {
    cpu.b = memory.readByte(cpu.pc + 1);
  },

  //0x07
  rlca: function () {
    var carrybit = (cpu.a >> 7) & 0x01;
    if (carrybit === 1) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.a = (cpu.a << 1) & 0xFF;
    cpu.a |= carrybit;
    cpu.resetZeroFlag(); cpu.resetHalfFlag(); cpu.resetSubFlag();
  },

  //0x08
  ld_nn_sp: function () {
    memory.writeWord(cpu.sp, memory.readWord(cpu.pc + 1));
  },

  //0x09
  add_hl_bc: function () {
    var x = cpu.getAddr(cpu.b, cpu.c);
    var y = cpu.getAddr(cpu.h, cpu.l);
    var z = x + y;
    cpu.l = z & 0xFF;
    cpu.h = (z >> 8) & 0xFF;
    if (((x & 0x0FFF) + (y & 0x0FFF)) & 0x1000) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (z > 0xFFFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.resetSubFlag();
  },

  //0x0A
  ld_a_bc: function () {
    cpu.a = memory.readByte(cpu.getAddr(cpu.b, cpu.c));
  },

  //0x0B
  dec_bc: function () {
    var x = cpu.getAddr(cpu.b, cpu.c);
    x--;
    cpu.b = (x >> 8) & 0xFF;
    cpu.c = x & 0x00FF;
  },

  //0x0C
  inc_c: function () {
    if ((cpu.c & 0x0F) === 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    cpu.c++;
    cpu.c &= 0xFF;
    if (cpu.c === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x0D
  dec_c: function () {
    cpu.c--;
    cpu.c &= 0xFF;
    if (cpu.c === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    if ((cpu.c & 0x0F) === 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    cpu.setSubFlag();
  },

  //0x0E
  ld_c_n: function () {
    cpu.c = memory.readByte(cpu.pc + 1);
  },

  //0x0F
  rrca: function () {
    var carrybit = (cpu.a << 7) & 0x80;
    if (carrybit === 0x80) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.a = cpu.a >> 1;
    cpu.a |= carrybit;
    cpu.resetZeroFlag(); cpu.resetSubFlag(); cpu.resetHalfFlag();
  },

  //0x10
  stop: function () {
    console.log('stop opcode hit');
  },

  //0x11
  ld_de_nn: function () {
    cpu.d = memory.readByte(cpu.pc + 2);
    cpu.e = memory.readByte(cpu.pc + 1);
  },

  //0x12
  ld_de_a: function () {
    var addr = cpu.getAddr(cpu.d, cpu.e);
    memory.writeByte(cpu.a, addr);
  },

  //0x13
  inc_de: function () {
    cpu.e++;
    cpu.e &= 0xFF;
    if (cpu.e === 0) {
      cpu.d++;
      cpu.d &= 0xFF;
    }
  },

  //0x14
  inc_d: function () {
    if ((cpu.d & 0x0F) === 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    cpu.d++;
    cpu.d &= 0xFF;
    if (cpu.d === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x15
  dec_d: function () {
    cpu.d--;
    cpu.d &= 0xFF;
    if (cpu.d === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    if ((cpu.d & 0x0F) === 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    cpu.setSubFlag();
  },

  //0x16
  ld_d_n: function () {
    cpu.d = memory.readByte(cpu.pc + 1);
  },

  //0x17
  rla: function () {
    var carry = cpu.carryFlag() ? 1 : 0;
    if (cpu.a & 0x80) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.a = cpu.a << 1;
    cpu.a += carry;
    cpu.a &= 0xFF;
    cpu.resetZeroFlag(); cpu.resetHalfFlag(); cpu.resetSubFlag();
  },

  //0x18
  jr_n: function () {
    cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
  },

  //0x19
  add_hl_de: function () {
    var x = cpu.getAddr(cpu.d, cpu.e);
    var y = cpu.getAddr(cpu.h, cpu.l);
    var z =  x + y;
    cpu.l = z & 0x00FF;
    cpu.h = (z >> 8) & 0xFF;
    if (((x & 0x0FFF) + (y & 0x0FFF)) & 0x1000) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (z > 0xFFFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.resetSubFlag();
  },

  //0x1A
  ld_a_de: function () {
    cpu.a = memory.readByte(cpu.getAddr(cpu.d, cpu.e));
  },

  //0x1B
  dec_de: function () {
    var x = cpu.getAddr(cpu.d, cpu.e);
    x--;
    cpu.d = (x >> 8) & 0xFF;
    cpu.e = x & 0x00FF;
  },

  //0x1C
  inc_e: function () {
    if ((cpu.e & 0x0F) === 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    cpu.e++;
    cpu.e &= 0xFF;
    if (cpu.e === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x1D
  dec_e: function () {
    cpu.e--;
    cpu.e &= 0xFF;
    if (cpu.e === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    if ((cpu.e & 0x0F) === 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    cpu.setSubFlag();
  },

  //0x1E
  ld_e_n: function () {
    cpu.e = memory.readByte(cpu.pc + 1);
  },

  //0x1F
  rra: function () {
    var carry = cpu.carryFlag() ? 0x80 : 0;
    if (cpu.a & 0x01) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.a = cpu.a >> 1;
    cpu.a += carry;
    cpu.a &= 0xFF;
    cpu.resetZeroFlag(); cpu.resetHalfFlag(); cpu.resetSubFlag();
  },

  //0x20
  jr_nz_n: function () {
    if (!cpu.zeroFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
    }
  },

  //0x21
  ld_hl_nn: function () {
    cpu.h = memory.readByte(cpu.pc + 2);
    cpu.l = memory.readByte(cpu.pc + 1);
  },

  //0x22
  ldi_hl_a: function () {
    var addr = cpu.getAddr(cpu.h, cpu.l);
    memory.writeByte(cpu.a, addr);
    cpu.l++;
    cpu.l &= 0xFF;
    if (cpu.l === 0) {
      cpu.h++;
      cpu.h &= 0xFF;
    }
  },

  //0x23
  inc_hl: function () {
    cpu.l++;
    cpu.l &= 0xFF;
    if (cpu.l === 0) {
      cpu.h++;
      cpu.h &= 0xFF;
    }
  },

  //0x24
  inc_h: function () {
    if ((cpu.h & 0x0F) === 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    cpu.h++;
    cpu.h &= 0xFF;
    if (cpu.h === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x25
  dec_h: function () {
    cpu.h--;
    cpu.h &= 0xFF;
    if (cpu.h === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    if ((cpu.h & 0x0F) === 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    cpu.setSubFlag();
  },

  //0x26
  ld_h_n: function () {
    cpu.h = memory.readByte(cpu.pc + 1);
  },

  //0x27
  daa: function () {
    if (!cpu.subFlag()) {
      if (((cpu.a & 0x0F) > 9) || (cpu.halfFlag())) {cpu.a += 0x06;}
      if ((((cpu.a & 0xFF0) >> 4) > 9) || cpu.carryFlag()) {cpu.a += 0x60; cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    } else {
      if (cpu.halfFlag()) {cpu.a -= 0x06; cpu.resetHalfFlag();}
      if (cpu.carryFlag()) {cpu.a -= 0x60; cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    }
    cpu.a &= 0xFF;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
  },

  //0x28
  jr_z_n: function () {
    if (cpu.zeroFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
    }
  },

  //0x29
  add_hl_hl: function () {
    var x = cpu.getAddr(cpu.h, cpu.l);
    var y = 2 * x;
    cpu.l = (y & 0x00FF);
    cpu.h = (y >> 8);
    cpu.h = cpu.h & 0x00FF;
    if (((x & 0x0FFF) + (x & 0x0FFF)) & 0x1000) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (y > 0xFFFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.resetSubFlag();
  },

  //0x2A
  ldi_a_hl: function () {
    cpu.a = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    cpu.l++;
    cpu.l &= 0xFF;
    if (cpu.l === 0) {
      cpu.h++;
      cpu.h &= 0xFF;
    }
  },

  //0x2B
  dec_hl: function () {
    var x = cpu.getAddr(cpu.h, cpu.l);
    x--;
    cpu.h = (x >> 8) & 0xFF;
    cpu.l = x & 0xFF;
  },

  //0x2C
  inc_l: function () {
    if ((cpu.l & 0x0F) === 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    cpu.l++;
    cpu.l &= 0xFF;
    if (cpu.l === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x2D
  dec_l: function () {
    cpu.l--;
    cpu.l &= 0xFF;
    if (cpu.l === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    if ((cpu.l & 0x0F) === 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    cpu.setSubFlag();
  },

  //0x2E
  ld_l_n: function () {
    cpu.l = memory.readByte(cpu.pc + 1);
  },

  //0x2F
  cpl: function () {
    cpu.a = ~cpu.a;
    cpu.a &= 0xFF;
    cpu.setHalfFlag();
    cpu.setSubFlag();
  },

  //0x30
  jr_nc_n: function () {
    if (!cpu.carryFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
    }
  },

  //0x31
  ld_sp_nn: function () {
    cpu.sp = memory.readWord(cpu.pc + 1);
  },

  //0x32
  ldd_hl_a: function () {
    var addr = cpu.getAddr(cpu.h, cpu.l);
    memory.writeByte(cpu.a, addr);
    var data = cpu.getAddr(cpu.h, cpu.l);
    data--;
    cpu.l = data & 0xFF;
    cpu.h = (data >> 8) & 0xFF;
  },

  //0x33
  inc_sp: function () {
    cpu.sp++;
    cpu.sp &= 0xFFFF;
  },

  //0x34
  inc_hl_: function () {
    var data = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    if ((data & 0x0F) === 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    data++;
    data &= 0xFF;
    memory.writeByte(data, cpu.getAddr(cpu.h, cpu.l));
    if (data === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x35
  dec_hl_: function () {
    var data = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    data--;
    data &= 0xFF;
    memory.writeByte(data, cpu.getAddr(cpu.h, cpu.l));
    if ((data & 0x0F) === 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (data === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0x36
  ld_hl_n: function () {
    memory.writeByte(memory.readByte(cpu.pc + 1), cpu.getAddr(cpu.h, cpu.l));
  },

  //0x37
  scf: function () {
    cpu.setCarryFlag();
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
  },

  //0x38
  jr_c_n: function () {
    if (cpu.carryFlag()) {
      cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1));
    }
  },

  //0x39
  add_hl_sp: function () {
    var x = cpu.getAddr(cpu.h, cpu.l);
    var y = cpu.sp;
    var z = x + y;
    cpu.l = z & 0xFF;
    cpu.h = (z >> 8) & 0xFF;
    if (((x & 0x0FFF) + (y & 0x0FFF)) > 0x0FFF) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (z > 0xFFFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.resetSubFlag();
  },

  //0x3A
  ldd_a_hl: function () {
    var x = cpu.getAddr(cpu.h, cpu.l);
    cpu.a = memory.readByte(x);
    x--;
    cpu.h = (x >> 8) & 0xFF;
    cpu.l = x & 0x00FF;
  },

  //0x3B
  dec_sp: function () {
    cpu.sp--;
    cpu.sp &= 0xFFFF;
  },

  //0x3C
  inc_a: function () {
    if ((cpu.a & 0x0F) === 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    cpu.a++;
    cpu.a &= 0xFF;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x3D
  dec_a: function () {
    cpu.a--;
    cpu.a &= 0xFF;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    if ((cpu.a & 0x0F) === 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    cpu.setSubFlag();
  },

  //0x3E
  ld_a_n: function () {
    cpu.a = memory.readByte(cpu.pc + 1);
  },

  //0x3F
  ccf: function () {
    if (cpu.carryFlag()) {cpu.resetCarryFlag();} else {cpu.setCarryFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
  },

  //0x40
  ld_b_b: function () {
    cpu.b = cpu.b;
  },

  //0x41
  ld_b_c: function () {
    cpu.b = cpu.c;
  },

  //0x42
  ld_b_d: function () {
    cpu.b = cpu.d;
  },

  //0x43
  ld_b_e: function () {
    cpu.b = cpu.e;
  },

  //0x44
  ld_b_h: function () {
    cpu.b = cpu.h;
  },

  //0x45
  ld_b_l: function () {
    cpu.b = cpu.l;
  },

  //0x46
  ld_b_hl: function () {
    cpu.b = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
  },

  //0x47
  ld_b_a: function () {
    cpu.b = cpu.a;
  },

  //0x48
  ld_c_b: function () {
    cpu.c = cpu.b;
  },

  //0x49
  ld_c_c: function () {
    cpu.c = cpu.c;
  },

  //0x4A
  ld_c_d: function () {
    cpu.c = cpu.d;
  },

  //0x4B
  ld_c_e: function () {
    cpu.c = cpu.e;
  },

  //0x4C
  ld_c_h: function () {
    cpu.c = cpu.h;
  },

  //0x4D
  ld_c_l: function () {
    cpu.c = cpu.l;
  },

  //0x4E
  ld_c_hl: function () {
    cpu.c = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
  },

  //0x4F
  ld_c_a: function () {
    cpu.c = cpu.a;
  },

  //0x50
  ld_d_b: function () {
    cpu.d = cpu.b;
  },

  //0x51
  ld_d_c: function () {
    cpu.d = cpu.c;
  },

  //0x52
  ld_d_d: function () {
    cpu.d = cpu.d;
  },

  //0x53
  ld_d_e: function () {
    cpu.d = cpu.e;
  },

  //0x54
  ld_d_h: function () {
    cpu.d = cpu.h;
  },

  //0x55
  ld_d_l: function () {
    cpu.d = cpu.l;
  },

  //0x56
  ld_d_hl: function () {
    cpu.d = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
  },

  //0x57
  ld_d_a: function () {
    cpu.d = cpu.a;
  },

  //0x58
  ld_e_b: function () {
    cpu.e = cpu.b;
  },

  //0x59
  ld_e_c: function () {
    cpu.e = cpu.c;
  },

  //0x5A
  ld_e_d: function () {
    cpu.e = cpu.d;
  },

  //0x5B
  ld_e_e: function () {
    cpu.e = cpu.e;
  },

  //0x5C
  ld_e_h: function () {
    cpu.e = cpu.h;
  },

  //0x5D
  ld_e_l: function () {
    cpu.e = cpu.l;
  },

  //0x5E
  ld_e_hl: function () {
    cpu.e = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
  },

  //0x5F
  ld_e_a: function () {
    cpu.e = cpu.a;
  },

  //0x60
  ld_h_b: function () {
    cpu.h = cpu.b;
  },

  //0x61
  ld_h_c: function () {
    cpu.h = cpu.c;
  },

  //0x62
  ld_h_d: function () {
    cpu.h = cpu.d;
  },

  //0x63
  ld_h_e: function () {
    cpu.h = cpu.e;
  },

  //0x64
  ld_h_h: function () {
    cpu.h = cpu.h;
  },

  //0x65
  ld_h_l: function () {
    cpu.h = cpu.l;
  },

  //0x66
  ld_h_hl: function () {
    cpu.h = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
  },

  //0x67
  ld_h_a: function () {
    cpu.h = cpu.a;
  },

  //0x68
  ld_l_b: function () {
    cpu.l = cpu.b;
  },

  //0x69
  ld_l_c: function () {
    cpu.l = cpu.c;
  },

  //0x6A
  ld_l_d: function () {
    cpu.l = cpu.d;
  },

  //0x6B
  ld_l_e: function () {
    cpu.l = cpu.e;
  },

  //0x6C
  ld_l_h: function () {
    cpu.l = cpu.h;
  },

  //0x6D
  ld_l_l: function () {
    cpu.l = cpu.l;
  },

  //0x6E
  ld_l_hl: function () {
    cpu.l = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
  },

  //0x6F
  ld_l_a: function () {
    cpu.l = cpu.a;
  },

  //0x70
  ld_hl_b: function () {
    memory.writeByte(cpu.b, cpu.getAddr(cpu.h, cpu.l));
  },

  //0x71
  ld_hl_c: function () {
    memory.writeByte(cpu.c, cpu.getAddr(cpu.h, cpu.l));
  },

  //0x72
  ld_hl_d: function () {
    memory.writeByte(cpu.d, cpu.getAddr(cpu.h, cpu.l));
  },

  //0x73
  ld_hl_e: function () {
    memory.writeByte(cpu.e, cpu.getAddr(cpu.h, cpu.l));
  },

  //0x74
  ld_hl_h: function () {
    memory.writeByte(cpu.h, cpu.getAddr(cpu.h, cpu.l));
  },

  //0x75
  ld_hl_l: function () {
    memory.writeByte(cpu.l, cpu.getAddr(cpu.h, cpu.l));
  },

  //0x76
  halt: function () {

    if (cpu.ime === 1) {
      while (!((MEMORY[0xFF0F] & MEMORY[0xFFFF]) & 0x1F)) {  //normal behavior
        timer.step();
        display.step();
      }
    } else {
      if (((MEMORY[0xFFFF] & MEMORY[0xFF0F]) & 0x1F) === 0) {  //ime=0 IE&IF=0
        while (((MEMORY[0xFFFF] & MEMORY[0xFF0F]) & 0x1F) === 0) {
          timer.step();
          display.step();
        }
      } else {                  //halt bug, ime=0 IE&IF!=0
        cpu.ex(memory.readByte(cpu.pc + 1));
      }
    }
  },

  //0x77
  ld_hl_a: function () {
    memory.writeByte(cpu.a, cpu.getAddr(cpu.h, cpu.l));
  },

  //0x78
  ld_a_b: function () {
    cpu.a = cpu.b;
  },

  //0x79
  ld_a_c: function () {
    cpu.a = cpu.c;
  },

  //0x7A
  ld_a_d: function () {
    cpu.a = cpu.d;
  },

  //0x7B
  ld_a_e: function () {
    cpu.a = cpu.e;
  },

  //0x7C
  ld_a_h: function () {
    cpu.a = cpu.h;
  },

  //0x7D
  ld_a_l: function () {
    cpu.a = cpu.l;
  },

  //7E
  ld_a_hl: function () {
    cpu.a = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
  },

  //0x7F
  ld_a_a: function () {
    cpu.a = cpu.a;
  },

  //0x80
  add_a_b: function () {
    var result = cpu.a + cpu.b;
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) + (cpu.b & 0x0F)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0x81
  add_a_c: function () {
    var result = cpu.a + cpu.c;
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) + (cpu.c & 0x0F)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();

  },

  //0x82
  add_a_d: function () {
    var result = cpu.a + cpu.d;
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) + (cpu.d & 0x0F)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x83
  add_a_e: function () {
    var result = cpu.a + cpu.e;
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) + (cpu.e & 0x0F)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x84
  add_a_h: function () {
    var result = cpu.a + cpu.h;
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) + (cpu.h & 0x0F)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x85
  add_a_l: function () {
    var result = cpu.a + cpu.l;
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) + (cpu.l & 0x0F)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x86
  add_a_hl: function () {
    var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    var result = (cpu.a + value);
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) + (value & 0x0F)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x87
  add_a_a: function () {
    var result = cpu.a + cpu.a;
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) + (cpu.a & 0x0F)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x88
  adc_b_a: function () {
    var result = cpu.a + cpu.b;
    if (((cpu.a & 0x0F) + (cpu.b & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (cpu.carryFlag()) {result += 1;}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x89
  adc_c_a: function () {
    var result = cpu.a + cpu.c;
    if (((cpu.a & 0x0F) + (cpu.c & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (cpu.carryFlag()) {result += 1;}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x8A
  adc_d_a: function () {
    var result = cpu.a + cpu.d;
    if (((cpu.a & 0x0F) + (cpu.d & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (cpu.carryFlag()) {result += 1;}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x8B
  adc_e_a: function () {
    var result = cpu.a + cpu.e;
    if (((cpu.a & 0x0F) + (cpu.e & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (cpu.carryFlag()) {result += 1;}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x8C
  adc_h_a: function () {
    var result = cpu.a + cpu.h;
    if (((cpu.a & 0x0F) + (cpu.h & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (cpu.carryFlag()) {result += 1;}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x8D
  adc_l_a: function () {
    var result = cpu.a + cpu.l;
    if (((cpu.a & 0x0F) + (cpu.l & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (cpu.carryFlag()) {result += 1;}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result & 0xff;
    cpu.resetSubFlag();
  },

  //0x8E
  adc_hl_a: function () {
    var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    var result = cpu.a + value;
    if (((cpu.a & 0x0F) + (value & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (cpu.carryFlag()) {result += 1;}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x8F
  adc_a_a: function () {
    var result = cpu.a + cpu.a;
    if (cpu.carryFlag()) {result += 1;}
    if (((cpu.a & 0x0F) + (cpu.a & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0x90
  sub_b_a: function () {
    var result = cpu.a - cpu.b;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (cpu.b & 0x0F)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x91
  sub_c_a: function () {
    var result = cpu.a - cpu.c;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (cpu.c & 0x0F)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x92
  sub_d_a: function () {
    var result = cpu.a - cpu.d;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (cpu.d & 0x0F)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x93
  sub_e_a: function () {
    var result = cpu.a - cpu.e;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (cpu.e & 0x0F)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x94
  sub_h_a: function () {
    var result = cpu.a - cpu.h;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (cpu.h & 0x0F)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x95
  sub_l_a: function () {
    var result = cpu.a - cpu.l;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (cpu.l & 0x0F)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x96
  sub_hl_a: function () {
    var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    var result = cpu.a - value;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (value & 0x0F)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x97
  sub_a_a: function () {
    var result = cpu.a - cpu.a;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (cpu.a & 0x0F)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x98
  sbc_b_a: function () {
    var result = cpu.a - cpu.b;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (cpu.b & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x99
  sbc_c_a: function () {
    var result = cpu.a - cpu.c;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (cpu.c & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x9A
  sbc_d_a: function () {
    var result = cpu.a - cpu.d;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (cpu.d & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x9B
  sbc_e_a: function () {
    var result = cpu.a - cpu.e;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (cpu.e & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x9C
  sbc_h_a: function () {
    var result = cpu.a - cpu.h;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (cpu.h & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x9D
  sbc_l_a: function () {
    var result = cpu.a - cpu.l;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (cpu.l & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x9E
  sbc_hl_a: function () {
    var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    var result = cpu.a - value;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (value & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0x9F
  sbc_a_a: function () {
    var result = cpu.a - cpu.a;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (cpu.a & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0xA0
  and_b: function () {
    cpu.a &= cpu.b;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA1
  and_c: function () {
    cpu.a &= cpu.c;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA2
  and_d: function () {
    cpu.a &= cpu.d;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA3
  and_e: function () {
    cpu.a &= cpu.e;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA4
  and_h: function () {
    cpu.a &= cpu.h;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA5
  and_l: function () {
    cpu.a &= cpu.l;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA6
  and_hl: function () {
    cpu.a &= memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA7
  and_a: function () {
    cpu.a &= cpu.a;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA8
  xor_b: function () {
    cpu.a ^= cpu.b;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xA9
  xor_c: function () {
    cpu.a ^= cpu.c;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xAA
  xor_d: function () {
    cpu.a ^= cpu.d;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xAB
  xor_e: function () {
    cpu.a ^= cpu.e;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xAC
  xor_h: function () {
    cpu.a ^= cpu.h;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xAD
  xor_l: function () {
    cpu.a ^= cpu.l;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xAE
  xor_hl: function () {
    cpu.a ^= memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xAF
  xor_a: function () {
    cpu.a ^= cpu.a;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB0
  or_b: function () {
    cpu.a |= cpu.b;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB1
  or_c: function () {
    cpu.a |= cpu.c;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB2
  or_d: function () {
    cpu.a |= cpu.d;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB3
  or_e: function () {
    cpu.a |= cpu.e;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB4
  or_h: function () {
    cpu.a |= cpu.h;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB5
  or_l: function () {
    cpu.a |= cpu.l;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB6
  or_hl: function () {
    cpu.a |= memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB7
  or_a: function () {
    cpu.a |= cpu.a;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
    cpu.resetHalfFlag();
    cpu.resetCarryFlag();
  },

  //0xB8
  cp_b: function () {
    var result = cpu.a - cpu.b;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (cpu.b & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xB9
  cp_c: function () {
    var result = cpu.a - cpu.c;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (cpu.c & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xBA
  cp_d: function () {
    var result = cpu.a - cpu.d;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (cpu.d & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xBB
  cp_e: function () {
    var result = cpu.a - cpu.e;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (cpu.e & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xBC
  cp_h: function () {
    var result = cpu.a - cpu.h;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (cpu.h & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xBD
  cp_l: function () {
    var result = cpu.a - cpu.l;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (cpu.l & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xBE
  cp_hl: function () {
    var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    var result = cpu.a - value;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (value & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xBF
  cp_a: function () {
    var result = cpu.a - cpu.a;
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    if ((cpu.a & 0x0F) < (cpu.a & 0x0F)) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.setSubFlag();
  },

  //0xC0
  ret_nz: function () {
    if (!cpu.zeroFlag()) {
      cpu.pc = memory.readWord(cpu.sp);
      cpu.sp += 2;
    }
  },

  //0xC1
  pop_bc: function () {
    cpu.c = memory.readByte(cpu.sp);
    cpu.b = memory.readByte(cpu.sp + 1);
    cpu.sp += 2;
  },

  //0xC2
  jp_nz_nn: function () {
    if (!cpu.zeroFlag()) {
      cpu.pc = memory.readWord(cpu.pc + 1);
    }
  },

  //0xC3
  jp_nn: function () {
    cpu.pc = memory.readWord(cpu.pc + 1);
  },

  //0xC4
  call_nz_nn: function () {
    if (!cpu.zeroFlag()) {
      cpu.sp -= 2;
      memory.writeWord(cpu.pc + 3, cpu.sp);
      cpu.pc = memory.readWord(cpu.pc + 1);
    }
  },

  //0xC5
  push_bc: function () {
    cpu.sp -= 2;
    memory.writeByte(cpu.b, cpu.sp + 1);
    memory.writeByte(cpu.c, cpu.sp);
  },

  //0xC6
  add_a_n: function () {
    var value = memory.readByte(cpu.pc + 1);
    var result = cpu.a + value;
    if (result > 0xFF) {cpu.setCarryFlag();}else {cpu.resetCarryFlag();}
    if (((cpu.a & 0x0F) + (value & 0x0F)) > 0x0F) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    cpu.a = result & 0xFF;
    if (cpu.a === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetSubFlag();
  },

  //0xC7
  rst_0: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 1, cpu.sp);
    cpu.pc = 0x0000;
  },

  //0xC8
  ret_z: function () {
    if (cpu.zeroFlag()) {
      cpu.pc = memory.readWord(cpu.sp);
      cpu.sp += 2;
    }
  },

  //0xC9
  ret: function () {
    cpu.pc = memory.readWord(cpu.sp);
    cpu.sp += 2;
  },

  //0xCA
  jp_z_nn: function () {
    if (cpu.zeroFlag()) {
      cpu.pc = memory.readWord(cpu.pc + 1);
    }
  },

  //0xCB
  ext_ops: function () {
    twoByteInstructions[memory.readByte(cpu.pc + 1)]();
  },

  //0xCC
  call_z_nn: function () {
    if (cpu.zeroFlag()) {
      cpu.sp -= 2;
      memory.writeWord(cpu.pc + 3, cpu.sp);
      cpu.pc = memory.readWord(cpu.pc + 1);
    }
  },

  //0xCD
  call_nn: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 3, cpu.sp);
    cpu.pc = memory.readWord(cpu.pc + 1);
  },

  //0xCE
  adc_a_n: function () {
    var value = memory.readByte(cpu.pc + 1);
    var result = cpu.a + value;
    if (cpu.carryFlag()) {result += 1;}
    if (((cpu.a & 0x0F) + (value & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result > 0xFF) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.resetSubFlag();
  },

  //0xCF
  rst_8: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 1, cpu.sp);
    cpu.pc = 0x0008;
  },

  //0xD0
  ret_nc: function () {
    if (!cpu.carryFlag()) {
      cpu.pc = memory.readWord(cpu.sp);
      cpu.sp += 2;
    }
  },

  //0xD1
  pop_de: function () {
    cpu.e = memory.readByte(cpu.sp);
    cpu.d = memory.readByte(cpu.sp + 1);
    cpu.sp += 2;
  },

  //0xD2
  jp_nc_nn: function () {
    if (!cpu.carryFlag()) {
      cpu.pc = memory.readWord(cpu.pc + 1);
    }
  },

  //0xD3, 0XDB, 0xDD, 0xE3, 0xE4, 0xEB, 0xEC, 0xED, 0xF, 0xFC, 0xFD
  unused: function () {
    var iv = memory.readByte(cpu.pc);
    console.log('invalid opcode ', iv.toString(16), 'at ', cpu.pc.toString(16));
    window.clearInterval(cpu.timer);
  },

  //0xD4
  call_nc_nn: function () {
    if (!cpu.carryFlag()) {
      cpu.sp -= 2;
      memory.writeWord(cpu.pc + 3, cpu.sp);
      cpu.pc = memory.readWord(cpu.pc + 1);
    }
  },

  //0xD5
  push_de: function () {
    cpu.sp -= 2;
    memory.writeByte(cpu.d, cpu.sp + 1);
    memory.writeByte(cpu.e, cpu.sp);
  },

  //0xD6
  sub_a_n: function () {
    var value = memory.readByte(cpu.pc + 1);
    var result = cpu.a - value;
    if (result < 0) {cpu.setCarryFlag();}else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (((cpu.a & 0x0F) - (value & 0x0F)) < 0) {cpu.setHalfFlag();}else {cpu.resetHalfFlag();}
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0xD7
  rst_10: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 1, cpu.sp);
    cpu.pc = 0x0010;
  },

  //0xD8
  ret_c: function () {
    if (cpu.carryFlag()) {
      cpu.pc = memory.readWord(cpu.sp);
      cpu.sp += 2;
    }
  },

  //0xD9
  reti: function () {
    cpu.ime = 1;
    cpu.pc = memory.readWord(cpu.sp);
    cpu.sp += 2;
  },

  //0xDA
  jp_c_nn: function () {
    if (cpu.carryFlag()) {
      cpu.pc = memory.readWord(cpu.pc + 1);
    }
  },

  //0xDB
  //unused

  //0xDC
  call_c_nn: function () {
    if (cpu.carryFlag()) {
      cpu.sp -= 2;
      memory.writeWord(cpu.pc + 3, cpu.sp);
      cpu.pc = memory.readWord(cpu.pc + 1);
    }
  },

  //0xDD
  //unused

  //0xDE
  sbc_a_n: function () {
    var value = memory.readByte(cpu.pc + 1);
    var result = cpu.a - value;
    if (cpu.carryFlag()) {result -= 1;}
    if (((cpu.a & 0x0F) - (value & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag();} else {cpu.resetHalfFlag();}
    if (result < 0) {cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    result &= 0xFF;
    if (result === 0) {cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.a = result;
    cpu.setSubFlag();
  },

  //0xDF
  rst_18: function () {
    cpu.sp -= 2;
    memory.writeWord(cpu.pc + 1, cpu.sp);
    cpu.pc = 0x0018;
  },
};


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

  //---------------------//
  //-2 byte Instructions-//
  //---------------------//

  //0x00
  rlc_b: function () {
    var carry = (cpu.b >> 7) & 0x01;
    cpu.b = ((cpu.b << 1) & 0xFF) + carry;
    cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x01
  rlc_c: function () {
     var carry = (cpu.c >> 7) & 0x01;
     cpu.c = ((cpu.c << 1) & 0xFF) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.c, half: 0, sub: 0});
  },

  //0x02
  rlc_d: function () {
     var carry = (cpu.d >> 7) & 0x01;
     cpu.d = ((cpu.d << 1) & 0xFF) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.d, half: 0, sub: 0});
  },

  //0x03
  rlc_e: function () {
     var carry = (cpu.e >> 7) & 0x01;
     cpu.e = ((cpu.e << 1) & 0xFF) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.e, half: 0, sub: 0});
  },

  //0x04
  rlc_h: function () {
     var carry = (cpu.h >> 7) & 0x01;
     cpu.h = ((cpu.h << 1) & 0xFF) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.h, half: 0, sub: 0});
  },

  //0x05
  rlc_l: function () {
     var carry = (cpu.b >> 7) & 0x01;
     cpu.b = ((cpu.b << 1) & 0xFF) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x06
  rlc_hl: function () {
    var value = memory.readByte(cpu.hl());
    var carry = (value >> 7) & 0x01;
    value = ((value << 1) & 0xFF) + carry;
    cpu.setFlags({carry: carry, zero: !value, half: 0, sub: 0});
    memory.writeByte(value,cpu.hl());
  },

  //0x07
  rlc_a: function () {
     var carry = (cpu.a >> 7) & 0x01;
     cpu.a = ((cpu.a << 1) & 0xFF) + carrybit;
     cpu.setFlags({carry: carry, zero: !cpu.a, half: 0, sub: 0});
  },

  //0x08
   rrc_b: function () {
    var carry = (cpu.b << 7) & 0x80;
    cpu.b = (cpu.b >> 1) + carry;
    cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x09
  rrc_c: function () {
     var carry = (cpu.b << 7) & 0x80;
     cpu.b = (cpu.b >> 1) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x0A
  rrc_d: function () {
     var carry = (cpu.b << 7) & 0x80;
     cpu.b = (cpu.b >> 1) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x0B
  rrc_e: function () {
     var carry = (cpu.b << 7) & 0x80;
     cpu.b = (cpu.b >> 1) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },


  //0x0C
  rrc_h: function () {
     var carry = (cpu.b << 7) & 0x80;
     cpu.b = (cpu.b >> 1) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x0D
  rrc_l: function () {
     var carry = (cpu.b << 7) & 0x80;
     cpu.b = (cpu.b >> 1) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x0E
  rrc_hl: function () {
    var value = memory.readByte(cpu.hl());
    var carry = (cpu.b << 7) & 0x80;
    value = (value >> 1) + carry;
    cpu.setFlags({carry: carry, zero: !value, half: 0, sub: 0});
    memory.writeByte(value, cpu.hl());
  },

  //0x0F
  rrc_a: function () {
     var carry = (cpu.a << 7) & 0x80;
     cpu.a = (cpu.a >> 1) + carry;
     cpu.setFlags({carry: carry, zero: !cpu.a, half: 0, sub: 0});
  },

  //0x10
  rl_b: function () {
    var bit0 = cpu.carryFlag() ? 1 : 0;
    var carry = cpu.b & 0x80;
    cpu.b = ((cpu.b << 1) + bit0) & 0xFF;
    cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x11
  rl_c: function () {
     var bit0 = cpu.carryFlag() ? 1 : 0;
     var carry = cpu.b & 0x80;
     cpu.b = ((cpu.b << 1) + bit0) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x12
  rl_d: function () {
     var bit0 = cpu.carryFlag() ? 1 : 0;
     var carry = cpu.b & 0x80;
     cpu.b = ((cpu.b << 1) + bit0) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x13
  rl_e: function () {
     var bit0 = cpu.carryFlag() ? 1 : 0;
     var carry = cpu.b & 0x80;
     cpu.b = ((cpu.b << 1) + bit0) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x14
  rl_h: function () {
     var bit0 = cpu.carryFlag() ? 1 : 0;
     var carry = cpu.b & 0x80;
     cpu.b = ((cpu.b << 1) + bit0) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x15
  rl_l: function () {
     var bit0 = cpu.carryFlag() ? 1 : 0;
     var carry = cpu.b & 0x80;
     cpu.b = ((cpu.b << 1) + bit0) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x16
  rl_hl: function () {
    var value=memory.readByte(cpu.hl());
    var carry = cpu.carryFlag()?1:0;
    var bit0 = cpu.carryFlag() ? 1 : 0;
    var carry = cpu.b & 0x80;
    cpu.b = ((cpu.b << 1) + bit0) & 0xFF;
    cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
    memory.writeByte(value, cpu.hl());
  },

  //0x17
   rl_a: function(){
     var bit0 = cpu.carryFlag() ? 1 : 0;
     var carry = cpu.b & 0x80;
     cpu.b = ((cpu.b << 1) + bit0) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x18
   rr_b: function () {
    var carry = cpu.carryFlag() ? 0x80 : 0;
    var bit7 = (cpu.b & 0x01);
    cpu.b = ((cpu.b >> 1) + bit7) & 0xFF;
    cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x19
  rr_c: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0;
     var bit7 = (cpu.b & 0x01);
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x1A
  rr_d: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0;
     var bit7 = (cpu.b & 0x01);
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },


  //0x1B
  rr_e: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0;
     var bit7 = (cpu.b & 0x01);
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x1C
  rr_h: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0;
     var bit7 = (cpu.b & 0x01);
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x1D
  rr_l: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0;
     var bit7 = (cpu.b & 0x01);
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
  },

  //0x1E
  rr_hl: function () {
    var value = memory.readByte(cpu.hl());
    var carry = cpu.carryFlag() ? 0x80 : 0;
    var bit7 = (cpu.b & 0x01);
    cpu.b = ((cpu.b >> 1) + bit7) & 0xFF;
    cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0});
    memory.writeByte(value, cpu.hl());
  },

  //0x1F
   rr_a: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0;
     var bit7 = (cpu.a & 0x01);
     cpu.a = ((cpu.a >> 1) + bit7) & 0xFF;
     cpu.setFlags({carry: carry, zero: !cpu.a, half: 0, sub: 0});
  },

  // 0x20 - 0x27
  sla: function(reg, reg2) {
    if (reg2) {
      return () => {
        var value = memory.readByte(cpu.hl());
        var carry = value & 0x80;
        value = (value << 1) & 0xFF;
        cpu.setFlags({carry: carry, zero: !value, half: 0, sub: 0});
        memory.writeByte(value, cpu.hl());
      }
    } else {
      return () => {
        var carry = cpu.registers[reg] & 0x80;
        cpu.registers[reg] = (cpu.registers[reg] << 1) & 0xFF;
        cpu.setFlags({carry: carry, zero: !cpu.registers[reg], half: 0, sub: 0});
      }
    }
  }

  //0x28 - 0x2F
  sra: function(reg, reg2) {
    if (reg2) {
      return () => {
        var value = memory.readByte(cpu.hl());
        var carry = value & 0x80;
        var msb = cpu.registers[reg] & 0x80;
        value = (value >> 1) | msb) & 0xFF;
        cpu.setFlags({carry: carry, zero: !value, half: 0, sub: 0});
        memory.writeByte(value, cpu.hl());
      }
    } else {
      return () => {
        var carry = cpu.registers[reg] & 0x01;
        var msb = cpu.registers[reg] & 0x80;
        cpu.registers[reg] = ((cpu.registers[reg] >> 1) | msb) & 0xFF;
        cpu.setFlags({carry: carry, zero: !cpu.registers[reg], half: 0, sub: 0});
      }
    }
  }

  //0x30 - 0x37
  swap: function(reg, reg2) {
    if (reg2) {
      return () => {
        var value = memory.readByte(cpu.hl());
        var temp = value & 0x0F;
        value = (value >> 4) | (temp << 4);
        cpu.setFlags({carry: 0, zero: !cpu.registers[reg], half: 0, sub: 0});
        memory.writeByte(value, cpu.hl());
      }
    } else {
      return () => {
        var temp = cpu.registers[reg] & 0x0F;
        cpu.registers[reg] = ( cpu.registers[reg] >> 4) | (temp << 4);
        cpu.setFlags({carry: 0, zero: !cpu.registers[reg], half: 0, sub: 0});
      }
    }
  }

  //0x38
   srl_b: function () {
    if (cpu.b&0x01){cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.b=cpu.b>>1;
    if (cpu.b===0){cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
    cpu.resetSubFlag();


  },

  //0x39
   srl_c: function () {
    if (cpu.c&0x01){cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.c=cpu.c>>1;
    if (cpu.c===0){cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
    cpu.resetSubFlag();

  },

  //0x3A
   srl_d: function () {
    if (cpu.d&0x01){cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.d=cpu.d>>1;
    if (cpu.d===0){cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
    cpu.resetSubFlag();

  },

  //0x3B
   srl_e: function () {
    if (cpu.e&0x01){cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.e=cpu.e>>1;
    if (cpu.e===0){cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
    cpu.resetSubFlag();

  },

  //0x3C
   srl_h: function () {
    if (cpu.h&0x01){cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.h=cpu.h>>1;
    if (cpu.h===0){cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
    cpu.resetSubFlag();

  },

  //0x3D
   srl_l: function () {
    if (cpu.l&0x01){cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.l=cpu.l>>1;
    if (cpu.l===0){cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
    cpu.resetSubFlag();

  },

  //0x3E
   srl_hl: function () {
    var value=memory.readByte(cpu.getAddr(cpu.h, cpu.l));
    if (value&0x01){cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    value=value>>1;
    memory.writeByte(value, cpu.hl());
    if (value===0){cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
    cpu.resetSubFlag();
    cpu.m=2; cpu.t=16;
  },

  //0x3F
   srl_a: function () {
    if (cpu.a&0x01){cpu.setCarryFlag();} else {cpu.resetCarryFlag();}
    cpu.a=cpu.a>>1;
    if (cpu.a===0){cpu.setZeroFlag();} else {cpu.resetZeroFlag();}
    cpu.resetHalfFlag();
    cpu.resetSubFlag();

  },

  //0x40
   bit_0_b: function () {
    if(cpu.b&0x01){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x41
   bit_0_c: function () {
    if(cpu.c&0x01){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x42
   bit_0_d: function () {
    if(cpu.d&0x01){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x43
   bit_0_e: function () {
    if(cpu.e&0x01){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x44
   bit_0_h : function() {
    if(cpu.h&0x01){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x45
   bit_0_l : function() {
    if(cpu.l&0x01){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x46
   bit_0_hl : function() {
    var value=memory.readByte(cpu.hl());
    if(value&0x01){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.m=2; cpu.t=12;
  },

  //0x47
   bit_0_a : function() {
    if(cpu.a&0x01){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x48
   bit_1_b : function() {
    if(cpu.b&0x02){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x49
   bit_1_c : function() {
    if(cpu.c&0x02){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x4A
   bit_1_d : function() {
    if(cpu.d&0x02){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x4B
   bit_1_e : function() {
    if(cpu.e&0x02){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x4C
   bit_1_h : function() {
    if(cpu.h&0x02){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x4D
   bit_1_l : function() {
    if(cpu.l&0x02){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x4E
   bit_1_hl : function() {
    var value=memory.readByte(cpu.hl());
    if(value&0x02){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.m=2; cpu.t=12;
  },

  //0x4F
   bit_1_a : function() {
    if(cpu.a&0x02){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x50
   bit_2_b : function() {
    if(cpu.b&0x04){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x51
   bit_2_c : function() {
    if(cpu.c&0x04){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x52
   bit_2_d : function() {
    if(cpu.d&0x04){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x53
   bit_2_e : function() {
    if(cpu.e&0x04){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x54
   bit_2_h : function() {
    if(cpu.h&0x04){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x55
   bit_2_l : function() {
    if(cpu.l&0x04){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x56
   bit_2_hl : function() {
    var value=memory.readByte(cpu.hl());
    if(value&0x04){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.m=2; cpu.t=12;
  },

  //0x57
   bit_2_a : function() {
    if(cpu.a&0x04){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x58
   bit_3_b : function() {
    if(cpu.b&0x08){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x59
   bit_3_c : function() {
    if(cpu.c&0x08){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x5A
   bit_3_d : function() {
    if(cpu.d&0x08){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x5B
   bit_3_e : function() {
    if(cpu.e&0x08){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x5C
   bit_3_h : function() {
    if(cpu.h&0x08){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x5D
   bit_3_l : function() {
    if(cpu.l&0x08){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x5E
   bit_3_hl : function() {
    var value=memory.readByte(cpu.hl());
    if(value&0x08){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.m=2; cpu.t=12;
  },

  //0x5F
   bit_3_a : function() {
    if(cpu.a&0x08){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x60
   bit_4_b : function() {
    if(cpu.b&0x10){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x61
   bit_4_c : function() {
    if(cpu.c&0x10){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x62
   bit_4_d : function() {
    if(cpu.d&0x10){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x63
   bit_4_e : function() {
    if(cpu.e&0x10){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x64
   bit_4_h : function() {
    if(cpu.h&0x10){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x65
   bit_4_l : function() {
    if(cpu.l&0x10){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x66
   bit_4_hl : function() {
    var value=memory.readByte(cpu.hl());
    if(value&0x10){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.m=2; cpu.t=12;
  },


  //0x67
   bit_4_a : function() {
    if(cpu.a&0x10){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x68
   bit_5_b : function() {
    if(cpu.b&0x20){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x69
   bit_5_c : function() {
    if(cpu.c&0x20){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x6A
   bit_5_d : function() {
    if(cpu.d&0x20){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x6B
   bit_5_e : function() {
    if(cpu.e&0x20){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x6C
   bit_5_h : function() {
    if(cpu.h&0x20){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x6D
   bit_5_l : function() {
    if(cpu.l&0x20){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x6E
   bit_5_hl : function() {
    var value=memory.readByte(cpu.hl());
    if(value&0x20){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.m=2; cpu.t=12;
  },

  //0x6F
   bit_5_a : function() {
    if(cpu.a&0x20){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x70
   bit_6_b : function() {
    if(cpu.b&0x40){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x71
   bit_6_c : function() {
    if(cpu.c&0x40){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x72
   bit_6_d : function() {
    if(cpu.d&0x40){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x73
   bit_6_e : function() {
    if(cpu.e&0x40){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x74
   bit_6_h : function() {
    if(cpu.h&0x40){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x75
   bit_6_l : function() {
    if(cpu.l&0x40){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x76
   bit_6_hl : function() {
    var value=memory.readByte(cpu.hl());
    if(value&0x40){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.m=2; cpu.t=12;
  },

  //0x77
   bit_6_a : function() {
    if(cpu.a&0x40){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x78
   bit_7_b : function() {
    if(cpu.b&0x80){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x79
   bit_7_c : function() {
    if(cpu.c&0x80){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x7A
   bit_7_d : function() {
    if(cpu.d&0x80){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x7B
   bit_7_e : function() {
    if(cpu.e&0x80){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x7C
   bit_7_h : function() {
    if(cpu.h&0x80){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x7D
   bit_7_l : function() {
    if(cpu.l&0x80){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x7E
   bit_7_hl : function() {
    var value=memory.readByte(cpu.hl());
    if(value&0x80){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();
    cpu.m=2; cpu.t=12;
  },

  //0x7F
   bit_7_a : function() {
    if(cpu.a&0x80){cpu.resetZeroFlag();} else {cpu.setZeroFlag();}
    cpu.resetSubFlag();
    cpu.setHalfFlag();

  },

  //0x80
   res_0_b: function () {
    cpu.b&=0xFE;

  },

  //0x81
   res_0_c: function () {
    cpu.c&=0xFE;

  },

  //0x82
   res_0_d: function () {
    cpu.d&=0xFE;

  },

  //0x83
   res_0_e: function () {
    cpu.e&=0xFE;

  },

  //0x84
   res_0_h: function () {
    cpu.h&=0xFE;

  },

  //0x85
   res_0_l: function () {
    cpu.l&=0xFE;

  },

  //0x86
   res_0_hl: function () {
    var value=memory.readByte(cpu.hl());
    value&=0xFE;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0x87
   res_0_a: function () {
    cpu.a&=0xFE;

  },

  //0x88
   res_1_b: function () {
    cpu.b&=0xFD;

  },

  //0x89
   res_1_c: function () {
    cpu.c&=0xFD;

  },

  //0x8A
   res_1_d: function () {
    cpu.d&=0xFD;

  },

  //0x8B
   res_1_e: function () {
    cpu.e&=0xFD;

  },

  //0x8C
   res_1_h: function () {
    cpu.h&=0xFD;

  },

  //0x8D
   res_1_l: function () {
    cpu.l&=0xFD;

  },

  //0x8E
   res_1_hl: function () {
    var value=memory.readByte(cpu.hl());
    value&=0xFD;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0x8F
   res_1_a: function () {
    cpu.a&=0xFD;

  },

  //0x90
   res_2_b: function () {
    cpu.b&=0xFB;

  },

  //0x91
   res_2_c: function () {
    cpu.c&=0xFB;

  },

  //0x92
   res_2_d: function () {
    cpu.d&=0xFB;

  },

  //0x93
   res_2_e: function () {
    cpu.e&=0xFB;

  },

  //0x94
   res_2_h: function () {
    cpu.h&=0xFB;

  },

  //0x95
   res_2_l: function () {
    cpu.l&=0xFB;

  },

  //0x96
   res_2_hl: function () {
    var value=memory.readByte(cpu.hl());
    value&=0xFB;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0x97
   res_2_a: function () {
    cpu.a&=0xFB;

  },

  //0x98
   res_3_b: function () {
    cpu.b&=0xF7;

  },

  //0x99
   res_3_c: function () {
    cpu.c&=0xF7;

  },

  //0x9A
   res_3_d: function () {
    cpu.d&=0xF7;

  },

  //0x9B
   res_3_e: function () {
    cpu.e&=0xF7;

  },

  //0x9C
   res_3_h: function () {
    cpu.h&=0xF7;

  },

  //0x9D
   res_3_l: function () {
    cpu.l&=0xF7;

  },

  //0x9E
   res_3_hl: function () {
    var value=memory.readByte(cpu.hl());
    value&=0xF7;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0x9F
   res_3_a: function () {
    cpu.a&=0xF7;

  },

  //0xA0
   res_4_b: function () {
    cpu.b&=0xEF;

  },

  //0xA1
   res_4_c: function () {
    cpu.c&=0xEF;

  },

  //0xA2
   res_4_d: function () {
    cpu.d&=0xEF;

  },

  //0xA3
   res_4_e: function () {
    cpu.e&=0xEF;

  },

  //0xA4
   res_4_h: function () {
    cpu.h&=0xEF;

  },

  //0xA5
   res_4_l: function () {
    cpu.l&=0xEF;

  },

  //0xA6
   res_4_hl: function () {
    var value=memory.readByte(cpu.hl());
    value&=0xEF;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xA7
   res_4_a: function () {
    cpu.a&=0xEF;

  },

  //0xA8
   res_5_b: function () {
    cpu.b&=0xDF;

  },

  //0xA9
   res_5_c: function () {
    cpu.c&=0xDF;

  },

  //0xAA
   res_5_d: function () {
    cpu.d&=0xDF;

  },

  //0xAB
   res_5_e: function () {
    cpu.e&=0xDF;

  },

  //0xAC
   res_5_h: function () {
    cpu.h&=0xDF;

  },

  //0xAD
   res_5_l: function () {
    cpu.l&=0xDF;

  },

  //0xAE
   res_5_hl: function () {
    var value=memory.readByte(cpu.hl());
    value&=0xDF;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xAF
   res_5_a: function () {
    cpu.a&=0xDF;

  },

  //0xB0
   res_6_b: function () {
    cpu.b&=0xBF;

  },

  //0xB1
   res_6_c: function () {
    cpu.c&=0xBF;

  },

  //0xB2
   res_6_d: function () {
    cpu.d&=0xBF;

  },

  //0xB3
   res_6_e: function () {
    cpu.e&=0xBF;

  },

  //0xB4
   res_6_h: function () {
    cpu.h&=0xBF;

  },

  //0xB5
   res_6_l: function () {
    cpu.l&=0xBF;

  },

  //0xB6
   res_6_hl: function () {
    var value=memory.readByte(cpu.hl());
    value&=0xBF;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xB7
   res_6_a: function () {
    cpu.a&=0xBF;

  },

  //0xB8
   res_7_b: function () {
    cpu.b&=0x7F;

  },

  //0xB9
   res_7_c: function () {
    cpu.c&=0x7F;

  },

  //0xBA
   res_7_d: function () {
    cpu.d&=0x7F;

  },

  //0xBB
   res_7_e: function () {
    cpu.e&=0x7F;

  },

  //0xBC
   res_7_h: function () {
    cpu.h&=0x7F;

  },

  //0xBD
   res_7_l: function () {
    cpu.l&=0x7F;

  },

  //0xBE
   res_7_hl: function () {
    var value=memory.readByte(cpu.hl());
    value&=0x7F;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xBF
   res_7_a: function () {
    cpu.a&=0x7F;

  },

  //0xC0
   set_0_b: function () {
    cpu.b|=0x01;

  },

  //0xC1
   set_0_c: function () {
    cpu.c|=0x01;

  },

  //0xC2
   set_0_d: function () {
    cpu.d|=0x01;

  },

  //0xC3
   set_0_e: function () {
    cpu.e|=0x01;

  },

  //0xC4
   set_0_h: function () {
    cpu.h|=0x01;

  },

  //0xC5
   set_0_l: function () {
    cpu.l|=0x01;

  },

  //0xC6
   set_0_hl: function () {
    var value=memory.readByte(cpu.hl());
    value|=0x01;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xC7
   set_0_a: function () {
    cpu.a|=0x01;

  },

  //0xC8
   set_1_b: function () {
    cpu.b|=0x02;

  },

  //0xC9
   set_1_c: function () {
    cpu.c|=0x02;

  },

  //0xCA
   set_1_d: function () {
    cpu.d|=0x02;

  },

  //0xCB
   set_1_e: function () {
    cpu.e|=0x02;

  },

  //0xCC
   set_1_h: function () {
    cpu.h|=0x02;

  },

  //0xCD
   set_1_l: function () {
    cpu.l|=0x02;

  },

  //0xCE
   set_1_hl: function () {
    var value=memory.readByte(cpu.hl());
    value|=0x02;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xCF
   set_1_a: function () {
    cpu.a|=0x02;

  },

  //0xD0
   set_2_b: function () {
    cpu.b|=0x04;

  },

  //0xD1
   set_2_c: function () {
    cpu.c|=0x04;

  },

  //0xD2
   set_2_d: function () {
    cpu.d|=0x04;

  },

  //0xD3
   set_2_e: function () {
    cpu.e|=0x04;

  },

  //0xD4
   set_2_h: function () {
    cpu.h|=0x04;

  },

  //0xD5
   set_2_l: function () {
    cpu.l|=0x04;

  },

  //0xD6
   set_2_hl: function () {
    var value=memory.readByte(cpu.hl());
    value|=0x04;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xD7
   set_2_a: function () {
    cpu.a|=0x04;

  },

  //0xD8
   set_3_b: function () {
    cpu.b|=0x08;

  },

  //0xD9
   set_3_c: function () {
    cpu.c|=0x08;

  },

  //0xDA
   set_3_d: function () {
    cpu.d|=0x08;

  },

  //0xDB
   set_3_e: function () {
    cpu.e|=0x08;

  },

  //0xDC
   set_3_h: function () {
    cpu.h|=0x08;

  },

  //0xDD
   set_3_l: function () {
    cpu.l|=0x08;

  },

  //0xDE
   set_3_hl: function () {
    var value=memory.readByte(cpu.hl());
    value|=0x08;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xDF
   set_3_a: function () {
    cpu.a|=0x08;

  },

  //0xE0
   set_4_b: function () {
    cpu.b|=0x10;

  },

  //0xE1
   set_4_c: function () {
    cpu.c|=0x10;

  },

  //0xE2
   set_4_d: function () {
    cpu.d|=0x10;

  },

  //0xE3
   set_4_e: function () {
    cpu.e|=0x10;

  },

  //0xE4
   set_4_h: function () {
    cpu.h|=0x10;

  },

  //0xE5
   set_4_l: function () {
    cpu.l|=0x10;

  },

  //0xE6
   set_4_hl: function () {
    var value=memory.readByte(cpu.hl());
    value|=0x10;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xE7
   set_4_a: function () {
    cpu.a|=0x10;

  },

  //0xE8
   set_5_b: function () {
    cpu.b|=0x20;

  },

  //0xE9
   set_5_c: function () {
    cpu.c|=0x20;

  },

  //0xEA
   set_5_d: function () {
    cpu.d|=0x20;

  },

  //0xEB
   set_5_e: function () {
    cpu.e|=0x20;

  },

  //0xEC
   set_5_h: function () {
    cpu.h|=0x20;

  },

  //0xED
   set_5_l: function () {
    cpu.l|=0x20;

  },

  //0xEE
   set_5_hl: function () {
    var value=memory.readByte(cpu.hl());
    value|=0x20;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xEF
   set_5_a: function () {
    cpu.a|=0x20;

  },

  //0xF0
   set_6_b: function () {
    cpu.b|=0x40;

  },

  //0xF1
   set_6_c: function () {
    cpu.c|=0x40;

  },

  //0xF2
   set_6_d: function () {
    cpu.d|=0x40;

  },

  //0xF3
   set_6_e: function () {
    cpu.e|=0x40;

  },

  //0xF4
   set_6_h: function () {
    cpu.h|=0x40;

  },

  //0xF5
   set_6_l: function () {
    cpu.l|=0x40;

  },

  //0xF6
   set_6_hl: function () {
    var value=memory.readByte(cpu.hl());
    value|=0x40;
    memory.writeByte(value, cpu.hl());
  },

  //0xF7
   set_6_a: function () {
    cpu.a|=0x40;

  },

  //0xF8
   set_7_b: function () {
    cpu.b|=0x80;

  },

  //0xF9
   set_7_c: function () {
    cpu.c|=0x80;

  },

  //0xFA
   set_7_d: function () {
    cpu.d|=0x80;

  },

  //0xFB
   set_7_e: function () {
    cpu.e|=0x80;

  },

  //0xFC
   set_7_h: function () {
    cpu.h|=0x80;

  },

  //0xFD
   set_7_l: function () {
    cpu.l|=0x80;

  },

  //0xFE
   set_7_hl: function () {
    var value=memory.readByte(cpu.hl());
    value|=0x80;
    memory.writeByte(value, cpu.hl());
    cpu.m=2; cpu.t=16;
  },

  //0xFF
   set_7_a: function () {
    cpu.a|=0x80;

  },
};

module.exports = { instructions: instructions };
