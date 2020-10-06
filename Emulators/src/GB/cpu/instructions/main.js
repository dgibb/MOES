//0x00
nop: function () {},

//0x01
ld_bc_nn: function () {
  cpu.b = memory.readByte(cpu.pc + 2)
  cpu.c = memory.readByte(cpu.pc + 1)
},

//0x02
ld_bc_a: function () {
  var addr = cpu.b
  addr = addr << 8
  addr += cpu.c
  memory.writeByte(cpu.a, addr)
},

//0x03
inc_bc: function () {
  cpu.c++
  cpu.c &= 0xFF
  if (cpu.c === 0) {
    cpu.b++
    cpu.b &= 0xFF
  }
},

//0x04
inc_b: function () {
  if ((cpu.b & 0x0F) === 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  cpu.b++
  cpu.b &= 0xFF
  if (cpu.b === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x05
dec_b: function () {
  cpu.b--
  cpu.b &= 0xFF
  if (cpu.b === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  if ((cpu.b & 0x0F) === 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  cpu.setSubFlag()
},

//0x06
ld_b_n: function () {
  cpu.b = memory.readByte(cpu.pc + 1)
},

//0x07
rlca: function () {
  var carrybit = (cpu.a >> 7) & 0x01
  if (carrybit === 1) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.a = (cpu.a << 1) & 0xFF
  cpu.a |= carrybit
  cpu.resetZeroFlag()
  cpu.resetHalfFlag()
  cpu.resetSubFlag()
},

//0x08
ld_nn_sp: function () {
  memory.writeWord(cpu.sp, memory.readWord(cpu.pc + 1))
},

//0x09
add_hl_bc: function () {
  var x = cpu.getAddr(cpu.b, cpu.c)
  var y = cpu.getAddr(cpu.h, cpu.l)
  var z = x + y
  cpu.l = z & 0xFF
  cpu.h = (z >> 8) & 0xFF
  if (((x & 0x0FFF) + (y & 0x0FFF)) & 0x1000) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (z > 0xFFFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.resetSubFlag()
},

//0x0A
ld_a_bc: function () {
  cpu.a = memory.readByte(cpu.getAddr(cpu.b, cpu.c))
},

//0x0B
dec_bc: function () {
  var x = cpu.getAddr(cpu.b, cpu.c)
  x--
  cpu.b = (x >> 8) & 0xFF
  cpu.c = x & 0x00FF
},

//0x0C
inc_c: function () {
  if ((cpu.c & 0x0F) === 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  cpu.c++
  cpu.c &= 0xFF
  if (cpu.c === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x0D
dec_c: function () {
  cpu.c--
  cpu.c &= 0xFF
  if (cpu.c === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  if ((cpu.c & 0x0F) === 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  cpu.setSubFlag()
},

//0x0E
ld_c_n: function () {
  cpu.c = memory.readByte(cpu.pc + 1)
},

//0x0F
rrca: function () {
  var carrybit = (cpu.a << 7) & 0x80
  if (carrybit === 0x80) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.a = cpu.a >> 1
  cpu.a |= carrybit
  cpu.resetZeroFlag() cpu.resetSubFlag() cpu.resetHalfFlag()
},

//0x10
stop: function () {
  console.log('stop opcode hit')
},

//0x11
ld_de_nn: function () {
  cpu.d = memory.readByte(cpu.pc + 2)
  cpu.e = memory.readByte(cpu.pc + 1)
},

//0x12
ld_de_a: function () {
  var addr = cpu.getAddr(cpu.d, cpu.e)
  memory.writeByte(cpu.a, addr)
},

//0x13
inc_de: function () {
  cpu.e++
  cpu.e &= 0xFF
  if (cpu.e === 0) {
    cpu.d++
    cpu.d &= 0xFF
  }
},

//0x14
inc_d: function () {
  if ((cpu.d & 0x0F) === 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  cpu.d++
  cpu.d &= 0xFF
  if (cpu.d === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x15
dec_d: function () {
  cpu.d--
  cpu.d &= 0xFF
  if (cpu.d === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  if ((cpu.d & 0x0F) === 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  cpu.setSubFlag()
},

//0x16
ld_d_n: function () {
  cpu.d = memory.readByte(cpu.pc + 1)
},

//0x17
rla: function () {
  var carry = cpu.carryFlag() ? 1 : 0
  if (cpu.a & 0x80) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.a = cpu.a << 1
  cpu.a += carry
  cpu.a &= 0xFF
  cpu.resetZeroFlag() cpu.resetHalfFlag() cpu.resetSubFlag()
},

//0x18
jr_n: function () {
  cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1))
},

//0x19
add_hl_de: function () {
  var x = cpu.getAddr(cpu.d, cpu.e)
  var y = cpu.getAddr(cpu.h, cpu.l)
  var z =  x + y
  cpu.l = z & 0x00FF
  cpu.h = (z >> 8) & 0xFF
  if (((x & 0x0FFF) + (y & 0x0FFF)) & 0x1000) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (z > 0xFFFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.resetSubFlag()
},

//0x1A
ld_a_de: function () {
  cpu.a = memory.readByte(cpu.getAddr(cpu.d, cpu.e))
},

//0x1B
dec_de: function () {
  var x = cpu.getAddr(cpu.d, cpu.e)
  x--
  cpu.d = (x >> 8) & 0xFF
  cpu.e = x & 0x00FF
},

//0x1C
inc_e: function () {
  if ((cpu.e & 0x0F) === 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  cpu.e++
  cpu.e &= 0xFF
  if (cpu.e === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x1D
dec_e: function () {
  cpu.e--
  cpu.e &= 0xFF
  if (cpu.e === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  if ((cpu.e & 0x0F) === 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  cpu.setSubFlag()
},

//0x1E
ld_e_n: function () {
  cpu.e = memory.readByte(cpu.pc + 1)
},

//0x1F
rra: function () {
  var carry = cpu.carryFlag() ? 0x80 : 0
  if (cpu.a & 0x01) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.a = cpu.a >> 1
  cpu.a += carry
  cpu.a &= 0xFF
  cpu.resetZeroFlag() cpu.resetHalfFlag() cpu.resetSubFlag()
},

//0x20
jr_nz_n: function () {
  if (!cpu.zeroFlag()) {
    cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1))
  }
},

//0x21
ld_hl_nn: function () {
  cpu.h = memory.readByte(cpu.pc + 2)
  cpu.l = memory.readByte(cpu.pc + 1)
},

//0x22
ldi_hl_a: function () {
  var addr = cpu.getAddr(cpu.h, cpu.l)
  memory.writeByte(cpu.a, addr)
  cpu.l++
  cpu.l &= 0xFF
  if (cpu.l === 0) {
    cpu.h++
    cpu.h &= 0xFF
  }
},

//0x23
inc_hl: function () {
  cpu.l++
  cpu.l &= 0xFF
  if (cpu.l === 0) {
    cpu.h++
    cpu.h &= 0xFF
  }
},

//0x24
inc_h: function () {
  if ((cpu.h & 0x0F) === 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  cpu.h++
  cpu.h &= 0xFF
  if (cpu.h === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x25
dec_h: function () {
  cpu.h--
  cpu.h &= 0xFF
  if (cpu.h === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  if ((cpu.h & 0x0F) === 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  cpu.setSubFlag()
},

//0x26
ld_h_n: function () {
  cpu.h = memory.readByte(cpu.pc + 1)
},

//0x27
daa: function () {
  if (!cpu.subFlag()) {
    if (((cpu.a & 0x0F) > 9) || (cpu.halfFlag())) {cpu.a += 0x06}
    if ((((cpu.a & 0xFF0) >> 4) > 9) || cpu.carryFlag()) {cpu.a += 0x60 cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  } else {
    if (cpu.halfFlag()) {cpu.a -= 0x06 cpu.resetHalfFlag()}
    if (cpu.carryFlag()) {cpu.a -= 0x60 cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  }
  cpu.a &= 0xFF
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetHalfFlag()
},

//0x28
jr_z_n: function () {
  if (cpu.zeroFlag()) {
    cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1))
  }
},

//0x29
add_hl_hl: function () {
  var x = cpu.getAddr(cpu.h, cpu.l)
  var y = 2 * x
  cpu.l = (y & 0x00FF)
  cpu.h = (y >> 8)
  cpu.h = cpu.h & 0x00FF
  if (((x & 0x0FFF) + (x & 0x0FFF)) & 0x1000) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (y > 0xFFFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.resetSubFlag()
},

//0x2A
ldi_a_hl: function () {
  cpu.a = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  cpu.l++
  cpu.l &= 0xFF
  if (cpu.l === 0) {
    cpu.h++
    cpu.h &= 0xFF
  }
},

//0x2B
dec_hl: function () {
  var x = cpu.getAddr(cpu.h, cpu.l)
  x--
  cpu.h = (x >> 8) & 0xFF
  cpu.l = x & 0xFF
},

//0x2C
inc_l: function () {
  if ((cpu.l & 0x0F) === 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  cpu.l++
  cpu.l &= 0xFF
  if (cpu.l === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x2D
dec_l: function () {
  cpu.l--
  cpu.l &= 0xFF
  if (cpu.l === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  if ((cpu.l & 0x0F) === 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  cpu.setSubFlag()
},

//0x2E
ld_l_n: function () {
  cpu.l = memory.readByte(cpu.pc + 1)
},

//0x2F
cpl: function () {
  cpu.a = ~cpu.a
  cpu.a &= 0xFF
  cpu.setHalfFlag()
  cpu.setSubFlag()
},

//0x30
jr_nc_n: function () {
  if (!cpu.carryFlag()) {
    cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1))
  }
},

//0x31
ld_sp_nn: function () {
  cpu.sp = memory.readWord(cpu.pc + 1)
},

//0x32
ldd_hl_a: function () {
  var addr = cpu.getAddr(cpu.h, cpu.l)
  memory.writeByte(cpu.a, addr)
  var data = cpu.getAddr(cpu.h, cpu.l)
  data--
  cpu.l = data & 0xFF
  cpu.h = (data >> 8) & 0xFF
},

//0x33
inc_sp: function () {
  cpu.sp++
  cpu.sp &= 0xFFFF
},

//0x34
inc_hl_: function () {
  var data = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  if ((data & 0x0F) === 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  data++
  data &= 0xFF
  memory.writeByte(data, cpu.getAddr(cpu.h, cpu.l))
  if (data === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x35
dec_hl_: function () {
  var data = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  data--
  data &= 0xFF
  memory.writeByte(data, cpu.getAddr(cpu.h, cpu.l))
  if ((data & 0x0F) === 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (data === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0x36
ld_hl_n: function () {
  memory.writeByte(memory.readByte(cpu.pc + 1), cpu.getAddr(cpu.h, cpu.l))
},

//0x37
scf: function () {
  cpu.setCarryFlag()
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
},

//0x38
jr_c_n: function () {
  if (cpu.carryFlag()) {
    cpu.pc += cpu.signDecode(memory.readByte(cpu.pc + 1))
  }
},

//0x39
add_hl_sp: function () {
  var x = cpu.getAddr(cpu.h, cpu.l)
  var y = cpu.sp
  var z = x + y
  cpu.l = z & 0xFF
  cpu.h = (z >> 8) & 0xFF
  if (((x & 0x0FFF) + (y & 0x0FFF)) > 0x0FFF) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (z > 0xFFFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.resetSubFlag()
},

//0x3A
ldd_a_hl: function () {
  var x = cpu.getAddr(cpu.h, cpu.l)
  cpu.a = memory.readByte(x)
  x--
  cpu.h = (x >> 8) & 0xFF
  cpu.l = x & 0x00FF
},

//0x3B
dec_sp: function () {
  cpu.sp--
  cpu.sp &= 0xFFFF
},

//0x3C
inc_a: function () {
  if ((cpu.a & 0x0F) === 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  cpu.a++
  cpu.a &= 0xFF
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x3D
dec_a: function () {
  cpu.a--
  cpu.a &= 0xFF
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  if ((cpu.a & 0x0F) === 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  cpu.setSubFlag()
},

//0x3E
ld_a_n: function () {
  cpu.a = memory.readByte(cpu.pc + 1)
},

//0x3F
ccf: function () {
  if (cpu.carryFlag()) {cpu.resetCarryFlag()} else {cpu.setCarryFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
},

//0x40
ld_b_b: function () {
  cpu.b = cpu.b
},

//0x41
ld_b_c: function () {
  cpu.b = cpu.c
},

//0x42
ld_b_d: function () {
  cpu.b = cpu.d
},

//0x43
ld_b_e: function () {
  cpu.b = cpu.e
},

//0x44
ld_b_h: function () {
  cpu.b = cpu.h
},

//0x45
ld_b_l: function () {
  cpu.b = cpu.l
},

//0x46
ld_b_hl: function () {
  cpu.b = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
},

//0x47
ld_b_a: function () {
  cpu.b = cpu.a
},

//0x48
ld_c_b: function () {
  cpu.c = cpu.b
},

//0x49
ld_c_c: function () {
  cpu.c = cpu.c
},

//0x4A
ld_c_d: function () {
  cpu.c = cpu.d
},

//0x4B
ld_c_e: function () {
  cpu.c = cpu.e
},

//0x4C
ld_c_h: function () {
  cpu.c = cpu.h
},

//0x4D
ld_c_l: function () {
  cpu.c = cpu.l
},

//0x4E
ld_c_hl: function () {
  cpu.c = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
},

//0x4F
ld_c_a: function () {
  cpu.c = cpu.a
},

//0x50
ld_d_b: function () {
  cpu.d = cpu.b
},

//0x51
ld_d_c: function () {
  cpu.d = cpu.c
},

//0x52
ld_d_d: function () {
  cpu.d = cpu.d
},

//0x53
ld_d_e: function () {
  cpu.d = cpu.e
},

//0x54
ld_d_h: function () {
  cpu.d = cpu.h
},

//0x55
ld_d_l: function () {
  cpu.d = cpu.l
},

//0x56
ld_d_hl: function () {
  cpu.d = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
},

//0x57
ld_d_a: function () {
  cpu.d = cpu.a
},

//0x58
ld_e_b: function () {
  cpu.e = cpu.b
},

//0x59
ld_e_c: function () {
  cpu.e = cpu.c
},

//0x5A
ld_e_d: function () {
  cpu.e = cpu.d
},

//0x5B
ld_e_e: function () {
  cpu.e = cpu.e
},

//0x5C
ld_e_h: function () {
  cpu.e = cpu.h
},

//0x5D
ld_e_l: function () {
  cpu.e = cpu.l
},

//0x5E
ld_e_hl: function () {
  cpu.e = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
},

//0x5F
ld_e_a: function () {
  cpu.e = cpu.a
},

//0x60
ld_h_b: function () {
  cpu.h = cpu.b
},

//0x61
ld_h_c: function () {
  cpu.h = cpu.c
},

//0x62
ld_h_d: function () {
  cpu.h = cpu.d
},

//0x63
ld_h_e: function () {
  cpu.h = cpu.e
},

//0x64
ld_h_h: function () {
  cpu.h = cpu.h
},

//0x65
ld_h_l: function () {
  cpu.h = cpu.l
},

//0x66
ld_h_hl: function () {
  cpu.h = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
},

//0x67
ld_h_a: function () {
  cpu.h = cpu.a
},

//0x68
ld_l_b: function () {
  cpu.l = cpu.b
},

//0x69
ld_l_c: function () {
  cpu.l = cpu.c
},

//0x6A
ld_l_d: function () {
  cpu.l = cpu.d
},

//0x6B
ld_l_e: function () {
  cpu.l = cpu.e
},

//0x6C
ld_l_h: function () {
  cpu.l = cpu.h
},

//0x6D
ld_l_l: function () {
  cpu.l = cpu.l
},

//0x6E
ld_l_hl: function () {
  cpu.l = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
},

//0x6F
ld_l_a: function () {
  cpu.l = cpu.a
},

//0x70
ld_hl_b: function () {
  memory.writeByte(cpu.b, cpu.getAddr(cpu.h, cpu.l))
},

//0x71
ld_hl_c: function () {
  memory.writeByte(cpu.c, cpu.getAddr(cpu.h, cpu.l))
},

//0x72
ld_hl_d: function () {
  memory.writeByte(cpu.d, cpu.getAddr(cpu.h, cpu.l))
},

//0x73
ld_hl_e: function () {
  memory.writeByte(cpu.e, cpu.getAddr(cpu.h, cpu.l))
},

//0x74
ld_hl_h: function () {
  memory.writeByte(cpu.h, cpu.getAddr(cpu.h, cpu.l))
},

//0x75
ld_hl_l: function () {
  memory.writeByte(cpu.l, cpu.getAddr(cpu.h, cpu.l))
},

//0x76
halt: function () {

  if (cpu.ime === 1) {
    while (!((MEMORY[0xFF0F] & MEMORY[0xFFFF]) & 0x1F)) {  //normal behavior
      timer.step()
      display.step()
    }
  } else {
    if (((MEMORY[0xFFFF] & MEMORY[0xFF0F]) & 0x1F) === 0) {  //ime=0 IE&IF=0
      while (((MEMORY[0xFFFF] & MEMORY[0xFF0F]) & 0x1F) === 0) {
        timer.step()
        display.step()
      }
    } else {                  //halt bug, ime=0 IE&IF!=0
      cpu.ex(memory.readByte(cpu.pc + 1))
    }
  }
},

//0x77
ld_hl_a: function () {
  memory.writeByte(cpu.a, cpu.getAddr(cpu.h, cpu.l))
},

//0x78
ld_a_b: function () {
  cpu.a = cpu.b
},

//0x79
ld_a_c: function () {
  cpu.a = cpu.c
},

//0x7A
ld_a_d: function () {
  cpu.a = cpu.d
},

//0x7B
ld_a_e: function () {
  cpu.a = cpu.e
},

//0x7C
ld_a_h: function () {
  cpu.a = cpu.h
},

//0x7D
ld_a_l: function () {
  cpu.a = cpu.l
},

//7E
ld_a_hl: function () {
  cpu.a = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
},

//0x7F
ld_a_a: function () {
  cpu.a = cpu.a
},

//0x80
add_a_b: function () {
  var result = cpu.a + cpu.b
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) + (cpu.b & 0x0F)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0x81
add_a_c: function () {
  var result = cpu.a + cpu.c
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) + (cpu.c & 0x0F)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()

},

//0x82
add_a_d: function () {
  var result = cpu.a + cpu.d
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) + (cpu.d & 0x0F)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x83
add_a_e: function () {
  var result = cpu.a + cpu.e
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) + (cpu.e & 0x0F)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x84
add_a_h: function () {
  var result = cpu.a + cpu.h
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) + (cpu.h & 0x0F)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x85
add_a_l: function () {
  var result = cpu.a + cpu.l
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) + (cpu.l & 0x0F)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x86
add_a_hl: function () {
  var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  var result = (cpu.a + value)
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) + (value & 0x0F)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x87
add_a_a: function () {
  var result = cpu.a + cpu.a
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) + (cpu.a & 0x0F)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x88
adc_b_a: function () {
  var result = cpu.a + cpu.b
  if (((cpu.a & 0x0F) + (cpu.b & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (cpu.carryFlag()) {result += 1}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x89
adc_c_a: function () {
  var result = cpu.a + cpu.c
  if (((cpu.a & 0x0F) + (cpu.c & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (cpu.carryFlag()) {result += 1}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x8A
adc_d_a: function () {
  var result = cpu.a + cpu.d
  if (((cpu.a & 0x0F) + (cpu.d & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (cpu.carryFlag()) {result += 1}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x8B
adc_e_a: function () {
  var result = cpu.a + cpu.e
  if (((cpu.a & 0x0F) + (cpu.e & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (cpu.carryFlag()) {result += 1}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x8C
adc_h_a: function () {
  var result = cpu.a + cpu.h
  if (((cpu.a & 0x0F) + (cpu.h & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (cpu.carryFlag()) {result += 1}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x8D
adc_l_a: function () {
  var result = cpu.a + cpu.l
  if (((cpu.a & 0x0F) + (cpu.l & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (cpu.carryFlag()) {result += 1}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result & 0xff
  cpu.resetSubFlag()
},

//0x8E
adc_hl_a: function () {
  var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  var result = cpu.a + value
  if (((cpu.a & 0x0F) + (value & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (cpu.carryFlag()) {result += 1}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x8F
adc_a_a: function () {
  var result = cpu.a + cpu.a
  if (cpu.carryFlag()) {result += 1}
  if (((cpu.a & 0x0F) + (cpu.a & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0x90
sub_b_a: function () {
  var result = cpu.a - cpu.b
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (cpu.b & 0x0F)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x91
sub_c_a: function () {
  var result = cpu.a - cpu.c
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (cpu.c & 0x0F)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x92
sub_d_a: function () {
  var result = cpu.a - cpu.d
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (cpu.d & 0x0F)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x93
sub_e_a: function () {
  var result = cpu.a - cpu.e
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (cpu.e & 0x0F)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x94
sub_h_a: function () {
  var result = cpu.a - cpu.h
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (cpu.h & 0x0F)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x95
sub_l_a: function () {
  var result = cpu.a - cpu.l
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (cpu.l & 0x0F)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x96
sub_hl_a: function () {
  var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  var result = cpu.a - value
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (value & 0x0F)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x97
sub_a_a: function () {
  var result = cpu.a - cpu.a
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (cpu.a & 0x0F)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x98
sbc_b_a: function () {
  var result = cpu.a - cpu.b
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (cpu.b & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x99
sbc_c_a: function () {
  var result = cpu.a - cpu.c
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (cpu.c & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x9A
sbc_d_a: function () {
  var result = cpu.a - cpu.d
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (cpu.d & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x9B
sbc_e_a: function () {
  var result = cpu.a - cpu.e
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (cpu.e & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x9C
sbc_h_a: function () {
  var result = cpu.a - cpu.h
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (cpu.h & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x9D
sbc_l_a: function () {
  var result = cpu.a - cpu.l
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (cpu.l & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x9E
sbc_hl_a: function () {
  var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  var result = cpu.a - value
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (value & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0x9F
sbc_a_a: function () {
  var result = cpu.a - cpu.a
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (cpu.a & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0xA0
and_b: function () {
  cpu.a &= cpu.b
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xA1
and_c: function () {
  cpu.a &= cpu.c
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xA2
and_d: function () {
  cpu.a &= cpu.d
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xA3
and_e: function () {
  cpu.a &= cpu.e
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xA4
and_h: function () {
  cpu.a &= cpu.h
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xA5
and_l: function () {
  cpu.a &= cpu.l
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xA6
and_hl: function () {
  cpu.a &= memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xA7
and_a: function () {
  cpu.a &= cpu.a
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xA8
xor_b: function () {
  cpu.a ^= cpu.b
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xA9
xor_c: function () {
  cpu.a ^= cpu.c
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xAA
xor_d: function () {
  cpu.a ^= cpu.d
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xAB
xor_e: function () {
  cpu.a ^= cpu.e
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xAC
xor_h: function () {
  cpu.a ^= cpu.h
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xAD
xor_l: function () {
  cpu.a ^= cpu.l
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xAE
xor_hl: function () {
  cpu.a ^= memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xAF
xor_a: function () {
  cpu.a ^= cpu.a
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB0
or_b: function () {
  cpu.a |= cpu.b
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB1
or_c: function () {
  cpu.a |= cpu.c
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB2
or_d: function () {
  cpu.a |= cpu.d
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB3
or_e: function () {
  cpu.a |= cpu.e
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB4
or_h: function () {
  cpu.a |= cpu.h
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB5
or_l: function () {
  cpu.a |= cpu.l
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB6
or_hl: function () {
  cpu.a |= memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB7
or_a: function () {
  cpu.a |= cpu.a
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xB8
cp_b: function () {
  var result = cpu.a - cpu.b
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (cpu.b & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xB9
cp_c: function () {
  var result = cpu.a - cpu.c
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (cpu.c & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xBA
cp_d: function () {
  var result = cpu.a - cpu.d
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (cpu.d & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xBB
cp_e: function () {
  var result = cpu.a - cpu.e
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (cpu.e & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xBC
cp_h: function () {
  var result = cpu.a - cpu.h
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (cpu.h & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xBD
cp_l: function () {
  var result = cpu.a - cpu.l
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (cpu.l & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xBE
cp_hl: function () {
  var value = memory.readByte(cpu.getAddr(cpu.h, cpu.l))
  var result = cpu.a - value
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (value & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xBF
cp_a: function () {
  var result = cpu.a - cpu.a
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (cpu.a & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xC0
ret_nz: function () {
  if (!cpu.zeroFlag()) {
    cpu.pc = memory.readWord(cpu.sp)
    cpu.sp += 2
  }
},

//0xC1
pop_bc: function () {
  cpu.c = memory.readByte(cpu.sp)
  cpu.b = memory.readByte(cpu.sp + 1)
  cpu.sp += 2
},

//0xC2
jp_nz_nn: function () {
  if (!cpu.zeroFlag()) {
    cpu.pc = memory.readWord(cpu.pc + 1)
  }
},

//0xC3
jp_nn: function () {
  cpu.pc = memory.readWord(cpu.pc + 1)
},

//0xC4
call_nz_nn: function () {
  if (!cpu.zeroFlag()) {
    cpu.sp -= 2
    memory.writeWord(cpu.pc + 3, cpu.sp)
    cpu.pc = memory.readWord(cpu.pc + 1)
  }
},

//0xC5
push_bc: function () {
  cpu.sp -= 2
  memory.writeByte(cpu.b, cpu.sp + 1)
  memory.writeByte(cpu.c, cpu.sp)
},

//0xC6
add_a_n: function () {
  var value = memory.readByte(cpu.pc + 1)
  var result = cpu.a + value
  if (result > 0xFF) {cpu.setCarryFlag()}else {cpu.resetCarryFlag()}
  if (((cpu.a & 0x0F) + (value & 0x0F)) > 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  cpu.a = result & 0xFF
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
},

//0xC7
rst_0: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 1, cpu.sp)
  cpu.pc = 0x0000
},

//0xC8
ret_z: function () {
  if (cpu.zeroFlag()) {
    cpu.pc = memory.readWord(cpu.sp)
    cpu.sp += 2
  }
},

//0xC9
ret: function () {
  cpu.pc = memory.readWord(cpu.sp)
  cpu.sp += 2
},

//0xCA
jp_z_nn: function () {
  if (cpu.zeroFlag()) {
    cpu.pc = memory.readWord(cpu.pc + 1)
  }
},

//0xCB
ext_ops: function () {
  twoByteInstructions[memory.readByte(cpu.pc + 1)]()
},

//0xCC
call_z_nn: function () {
  if (cpu.zeroFlag()) {
    cpu.sp -= 2
    memory.writeWord(cpu.pc + 3, cpu.sp)
    cpu.pc = memory.readWord(cpu.pc + 1)
  }
},

//0xCD
call_nn: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 3, cpu.sp)
  cpu.pc = memory.readWord(cpu.pc + 1)
},

//0xCE
adc_a_n: function () {
  var value = memory.readByte(cpu.pc + 1)
  var result = cpu.a + value
  if (cpu.carryFlag()) {result += 1}
  if (((cpu.a & 0x0F) + (value & 0x0F) + ((cpu.f >> 4) & 0x01)) > 0x0F) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.resetSubFlag()
},

//0xCF
rst_8: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 1, cpu.sp)
  cpu.pc = 0x0008
},

//0xD0
ret_nc: function () {
  if (!cpu.carryFlag()) {
    cpu.pc = memory.readWord(cpu.sp)
    cpu.sp += 2
  }
},

//0xD1
pop_de: function () {
  cpu.e = memory.readByte(cpu.sp)
  cpu.d = memory.readByte(cpu.sp + 1)
  cpu.sp += 2
},

//0xD2
jp_nc_nn: function () {
  if (!cpu.carryFlag()) {
    cpu.pc = memory.readWord(cpu.pc + 1)
  }
},

//0xD3, 0XDB, 0xDD, 0xE3, 0xE4, 0xEB, 0xEC, 0xED, 0xF, 0xFC, 0xFD
unused: function () {
  var iv = memory.readByte(cpu.pc)
  console.log('invalid opcode ', iv.toString(16), 'at ', cpu.pc.toString(16))
  window.clearInterval(cpu.timer)
},

//0xD4
call_nc_nn: function () {
  if (!cpu.carryFlag()) {
    cpu.sp -= 2
    memory.writeWord(cpu.pc + 3, cpu.sp)
    cpu.pc = memory.readWord(cpu.pc + 1)
  }
},

//0xD5
push_de: function () {
  cpu.sp -= 2
  memory.writeByte(cpu.d, cpu.sp + 1)
  memory.writeByte(cpu.e, cpu.sp)
},

//0xD6
sub_a_n: function () {
  var value = memory.readByte(cpu.pc + 1)
  var result = cpu.a - value
  if (result < 0) {cpu.setCarryFlag()}else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (((cpu.a & 0x0F) - (value & 0x0F)) < 0) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0xD7
rst_10: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 1, cpu.sp)
  cpu.pc = 0x0010
},

//0xD8
ret_c: function () {
  if (cpu.carryFlag()) {
    cpu.pc = memory.readWord(cpu.sp)
    cpu.sp += 2
  }
},

//0xD9
reti: function () {
  cpu.ime = 1
  cpu.pc = memory.readWord(cpu.sp)
  cpu.sp += 2
},

//0xDA
jp_c_nn: function () {
  if (cpu.carryFlag()) {
    cpu.pc = memory.readWord(cpu.pc + 1)
  }
},

//0xDB
//unused

//0xDC
call_c_nn: function () {
  if (cpu.carryFlag()) {
    cpu.sp -= 2
    memory.writeWord(cpu.pc + 3, cpu.sp)
    cpu.pc = memory.readWord(cpu.pc + 1)
  }
},

//0xDD
//unused

//0xDE
sbc_a_n: function () {
  var value = memory.readByte(cpu.pc + 1)
  var result = cpu.a - value
  if (cpu.carryFlag()) {result -= 1}
  if (((cpu.a & 0x0F) - (value & 0x0F) - ((cpu.f >> 4) & 0x01)) < 0) {cpu.setHalfFlag()} else {cpu.resetHalfFlag()}
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  result &= 0xFF
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.a = result
  cpu.setSubFlag()
},

//0xDF
rst_18: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 1, cpu.sp)
  cpu.pc = 0x0018
},
}


//0xE0
ldh_n_a: function () {
  var addr = 0xFF00 | memory.readByte(cpu.pc + 1)
  memory.writeByte(cpu.a, addr)
},

//0xE1
pop_hl: function () {
  cpu.l = memory.readByte(cpu.sp)
  cpu.h = memory.readByte(cpu.sp + 1)
  cpu.sp += 2
},

//0xE2
ldh_c_a: function () {
  var addr = 0xFF00 + cpu.c
  memory.writeByte(cpu.a, addr)
},

//0xE3, 0xE4
//unused

//0xE5
push_hl: function () {
  cpu.sp -= 2
  memory.writeByte(cpu.h, cpu.sp + 1)
  memory.writeByte(cpu.l, cpu.sp)
},

//0xE6
and_n: function () {
  var value = memory.readByte(cpu.pc + 1)
  cpu.a &= value
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.setHalfFlag()
  cpu.resetCarryFlag()
},

//0xE7
rst_20: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 1, cpu.sp)
  cpu.pc = 0x0020
},

//0xE8
add_sp_d: function () {
  var value = memory.readByte(cpu.pc + 1)
  if (value & 0x80) {value |= 0xFF00}
  var result = cpu.sp + value
  cpu.resetZeroFlag()
  cpu.resetSubFlag()
  if (((cpu.sp & 0x0F) + (value & 0x0F)) > 0x0F) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (((cpu.sp & 0xFF) + (value & 0xFF)) > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.sp = result & 0xFFFF
},

//0xE9
jp_hl: function () {
  cpu.pc = cpu.getAddr(cpu.h, cpu.l)
},

//0xEA
ld_nn_a: function () {
  memory.writeByte(cpu.a, memory.readWord(cpu.pc + 1))
},

//0xEE
xor_n: function () {
  var value = memory.readByte(cpu.pc + 1)
  cpu.a ^= value
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xEF
rst_28: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 1, cpu.sp)
  cpu.pc = 0x0028
},

//0xF0
ldh_a_n: function () {
  var addr = 0xFF00 + memory.readByte(cpu.pc + 1)
  cpu.a = memory.readByte(addr)
},

//0xF1
pop_af: function () {
  cpu.f = memory.readByte(cpu.sp)
  cpu.f &= 0xF0
  cpu.a = memory.readByte(cpu.sp + 1)
  cpu.sp += 2
  cpu.m = 1 cpu.t = 12
},

//0xF2
ldh_a_c: function () {
  var addr = 0xFF00 | cpu.c
  cpu.a = memory.readByte(addr)
},

//0xF3
di: function () {
  cpu.ime = 0
},

//0xF5
push_af: function () {
  cpu.sp -= 2
  memory.writeByte(cpu.a, cpu.sp + 1)
  memory.writeByte(cpu.f, cpu.sp)
},

//0xF6
or_n: function () {
  cpu.a |= memory.readByte(cpu.pc + 1)
  if (cpu.a === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.resetSubFlag()
  cpu.resetHalfFlag()
  cpu.resetCarryFlag()
},

//0xF7
rst_30: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 1, cpu.sp)
  cpu.pc = 0x0030
},

//0xF8
ldhl_sp_d: function () {
  var value = memory.readByte(cpu.pc + 1)
  if (value & 0x80) {value |= 0xFF00}
  var result = cpu.sp + value
  cpu.h = (result >> 8) & 0xFF
  cpu.l = result & 0xFF
  if ((((cpu.sp & 0x0F) + (value & 0x0F)) > 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (((cpu.sp & 0xFF) + (value & 0xFF)) > 0xFF) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  cpu.resetZeroFlag()
  cpu.resetSubFlag()
},

//0xF9
ld_sp_hl: function () {
  cpu.sp = cpu.getAddr(cpu.h, cpu.l)
},

//0xFA
ld_a_nn: function () {
  cpu.a = memory.readByte(memory.readWord(cpu.pc + 1))
},

//0xFB
ei: function () {
  cpu.ime = 1
},

//0xFE
cp_n: function () {
  var value = memory.readByte(cpu.pc + 1)
  var result = cpu.a - value
  if (result < 0) {cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
  if ((cpu.a & 0x0F) < (value & 0x0F)) {cpu.setHalfFlag()}else {cpu.resetHalfFlag()}
  if (result === 0) {cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
  cpu.setSubFlag()
},

//0xFF
rst_38: function () {
  cpu.sp -= 2
  memory.writeWord(cpu.pc + 1, cpu.sp)
  cpu.pc = 0x0038
},
