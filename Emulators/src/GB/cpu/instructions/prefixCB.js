// 0x00 - 0x07
var rlc = function (cpu, memory, reg, reg2) {
  if (reg2) {
    return () => {
      var value = memory.readByte(cpu.hl())
      var carry = (value >> 7) & 0x01
      value = ((value << 1) & 0xFF) + carry
      cpu.setFlags({ carry: carry, zero: !value, half: 0, sub: 0 })
      memory.writeByte(value, cpu.hl())
    }
  } else {
    return () => {
      var carry = (cpu.registers[reg] & 0x80) ? 1 : 0
      cpu.registers[reg] = ((cpu.registers[reg] << 1) & 0xFF) + carry
      cpu.setFlags({ carry: carry, zero: !cpu.registers[reg], half: 0, sub: 0 })
    }
  }
}

// 0x08 - 0x0F
var rrc = function (cpu, memory, reg, reg2) {
  if (reg2) {
    return () => {
      var value = memory.readByte(cpu.hl())
      var carry = (value & 0x01) ? 0x80 : 0
      value = ((value >> 1) & 0xFF) + carry
      cpu.setFlags({ carry: carry, zero: !value, half: 0, sub: 0 })
      memory.writeByte(value, cpu.hl())
    }
  } else {
    return () => {
      var carry = (cpu.registers[reg] & 0x01) ? 0x80 : 0
      cpu.registers[reg] = ((cpu.registers[reg] >> 1) & 0xFF) + carry
      cpu.setFlags({ carry: carry, zero: !cpu.registers[reg], half: 0, sub: 0 })
    }
  }
}

// 0x10 - 0x017
var rl = function (cpu, memory, reg, reg2) {
  if (reg2) {
    return () => {
      var value = memory.readByte(cpu.hl())
      var carryIn = (cpu.getFlags().carry) ? 1 : 0
      var carry = value & 0x80
      value = ((value << 1) + carryIn) & 0xFF
      cpu.setFlags({ carry: carry, zero: !cpu.b, half: 0, sub: 0 })
      memory.writeByte(value, cpu.hl())
    }
  } else {
    return () => {
      var carryIn = (cpu.getFlags().carry) ? 1 : 0
      var carry = cpu.registers[reg] & 0x80
      cpu.registers[reg] = ((cpu.registers[reg] << 1) & 0xFF) + carryIn
      cpu.setFlags({ carry: carry, zero: !cpu.registers[reg], half: 0, sub: 0 })
    }
  }
}

/*

  //0x18
   rr_b: function () {
    var carry = cpu.carryFlag() ? 0x80 : 0
    var bit7 = (cpu.b & 0x01)
    cpu.b = ((cpu.b >> 1) + bit7) & 0xFF
    cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0})
  },

  //0x19
  rr_c: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0
     var bit7 = (cpu.b & 0x01)
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0})
  },

  //0x1A
  rr_d: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0
     var bit7 = (cpu.b & 0x01)
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0})
  },

  //0x1B
  rr_e: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0
     var bit7 = (cpu.b & 0x01)
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0})
  },

  //0x1C
  rr_h: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0
     var bit7 = (cpu.b & 0x01)
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0})
  },

  //0x1D
  rr_l: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0
     var bit7 = (cpu.b & 0x01)
     cpu.b = ((cpu.b >> 1) + bit7) & 0xFF
     cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0})
  },

  //0x1E
  rr_hl: function () {
    var value = memory.readByte(cpu.hl())
    var carry = cpu.carryFlag() ? 0x80 : 0
    var bit7 = (cpu.b & 0x01)
    cpu.b = ((cpu.b >> 1) + bit7) & 0xFF
    cpu.setFlags({carry: carry, zero: !cpu.b, half: 0, sub: 0})
    memory.writeByte(value, cpu.hl())
  },

  //0x1F
   rr_a: function () {
     var carry = cpu.carryFlag() ? 0x80 : 0
     var bit7 = (cpu.a & 0x01)
     cpu.a = ((cpu.a >> 1) + bit7) & 0xFF
     cpu.setFlags({carry: carry, zero: !cpu.a, half: 0, sub: 0})
  },

  // 0x20 - 0x27
  sla: function(reg, reg2) {
    if (reg2) {
      return () => {
        var value = memory.readByte(cpu.hl())
        var carry = value & 0x80
        value = (value << 1) & 0xFF
        cpu.setFlags({carry: carry, zero: !value, half: 0, sub: 0})
        memory.writeByte(value, cpu.hl())
      }
    } else {
      return () => {
        var carry = cpu.registers[reg] & 0x80
        cpu.registers[reg] = (cpu.registers[reg] << 1) & 0xFF
        cpu.setFlags({carry: carry, zero: !cpu.registers[reg], half: 0, sub: 0})
      }
    }
  }

  //0x28 - 0x2F
  sra: function(reg, reg2) {
    if (reg2) {
      return () => {
        var value = memory.readByte(cpu.hl())
        var carry = value & 0x80
        var msb = cpu.registers[reg] & 0x80
        value = (value >> 1) | msb) & 0xFF
        cpu.setFlags({carry: carry, zero: !value, half: 0, sub: 0})
        memory.writeByte(value, cpu.hl())
      }
    } else {
      return () => {
        var carry = cpu.registers[reg] & 0x01
        var msb = cpu.registers[reg] & 0x80
        cpu.registers[reg] = ((cpu.registers[reg] >> 1) | msb) & 0xFF
        cpu.setFlags({carry: carry, zero: !cpu.registers[reg], half: 0, sub: 0})
      }
    }
  }

  //0x30 - 0x37
  swap: function(reg, reg2) {
    if (reg2) {
      return () => {
        var value = memory.readByte(cpu.hl())
        var temp = value & 0x0F
        value = (value >> 4) | (temp << 4)
        cpu.setFlags({carry: 0, zero: !cpu.registers[reg], half: 0, sub: 0})
        memory.writeByte(value, cpu.hl())
      }
    } else {
      return () => {
        var temp = cpu.registers[reg] & 0x0F
        cpu.registers[reg] = ( cpu.registers[reg] >> 4) | (temp << 4)
        cpu.setFlags({carry: 0, zero: !cpu.registers[reg], half: 0, sub: 0})
      }
    }
  }

  //0x38
   srl_b: function () {
    if (cpu.b&0x01){cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
    cpu.b=cpu.b>>1
    if (cpu.b===0){cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
    cpu.resetHalfFlag()
    cpu.resetSubFlag()

  },

  //0x39
   srl_c: function () {
    if (cpu.c&0x01){cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
    cpu.c=cpu.c>>1
    if (cpu.c===0){cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
    cpu.resetHalfFlag()
    cpu.resetSubFlag()

  },

  //0x3A
   srl_d: function () {
    if (cpu.d&0x01){cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
    cpu.d=cpu.d>>1
    if (cpu.d===0){cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
    cpu.resetHalfFlag()
    cpu.resetSubFlag()

  },

  //0x3B
   srl_e: function () {
    if (cpu.e&0x01){cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
    cpu.e=cpu.e>>1
    if (cpu.e===0){cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
    cpu.resetHalfFlag()
    cpu.resetSubFlag()

  },

  //0x3C
   srl_h: function () {
    if (cpu.h&0x01){cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
    cpu.h=cpu.h>>1
    if (cpu.h===0){cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
    cpu.resetHalfFlag()
    cpu.resetSubFlag()

  },

  //0x3D
   srl_l: function () {
    if (cpu.l&0x01){cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
    cpu.l=cpu.l>>1
    if (cpu.l===0){cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
    cpu.resetHalfFlag()
    cpu.resetSubFlag()

  },

  //0x3E
   srl_hl: function () {
    var value=memory.readByte(cpu.getAddr(cpu.h, cpu.l))
    if (value&0x01){cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
    value=value>>1
    memory.writeByte(value, cpu.hl())
    if (value===0){cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
    cpu.resetHalfFlag()
    cpu.resetSubFlag()
    cpu.m=2 cpu.t=16
  },

  //0x3F
   srl_a: function () {
    if (cpu.a&0x01){cpu.setCarryFlag()} else {cpu.resetCarryFlag()}
    cpu.a=cpu.a>>1
    if (cpu.a===0){cpu.setZeroFlag()} else {cpu.resetZeroFlag()}
    cpu.resetHalfFlag()
    cpu.resetSubFlag()

  },

  // 0x40 - 0x7F
  var bit = function (cpu, memory, reg, bitMask, reg2) {
    if (reg2) {
      return () => {
        var value = memory.readByte(cpu.hl())
        cpu.setFlags({ carry: null, zero: !(value & bitMask), half: 1, sub: 0 })
      }
    } else {
      return () => {
        cpu.setFlags({ carry: null, zero: !(cpu.registers[reg] & bitMask), half: 1, sub: 0 })
      }
    }
  }

  //0x80 - 0xBF
  var res = function (cpu, memory, reg, bitMask, reg2) {
    if (reg2) {
      return () => {
        var value = memory.readByte(cpu.hl())
        value &= bitMask
        memory.writeByte(value, cpu.hl())
      }
    } else {
      return () => {
        cpu.registers[reg] |= bitMask
      }
    }
  }

  //0xC0 - 0xFF
  var set = function (cpu, memory, reg, bitMask, reg2) {
    if (reg2) {
      return () => {
      var value = memory.readByte(cpu.hl())
      value |= bitMask
      memory.writeByte(value, cpu.hl())
      }
    } else {
      return () => {
        cpu.registers[reg] |= bitMask
      }
    }
  }

  //0x40
   bit_0_b: function () {
    if(cpu.b&0x01){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x41
   bit_0_c: function () {
    if(cpu.c&0x01){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x42
   bit_0_d: function () {
    if(cpu.d&0x01){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x43
   bit_0_e: function () {
    if(cpu.e&0x01){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x44
   bit_0_h : function() {
    if(cpu.h&0x01){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x45
   bit_0_l : function() {
    if(cpu.l&0x01){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x46
   bit_0_hl : function() {
    var value=memory.readByte(cpu.hl())
    if(value&0x01){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()
    cpu.m=2 cpu.t=12
  },

  //0x47
   bit_0_a : function() {
    if(cpu.a&0x01){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x48
   bit_1_b : function() {
    if(cpu.b&0x02){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x49
   bit_1_c : function() {
    if(cpu.c&0x02){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x4A
   bit_1_d : function() {
    if(cpu.d&0x02){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x4B
   bit_1_e : function() {
    if(cpu.e&0x02){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x4C
   bit_1_h : function() {
    if(cpu.h&0x02){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x4D
   bit_1_l : function() {
    if(cpu.l&0x02){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x4E
   bit_1_hl : function() {
    var value=memory.readByte(cpu.hl())
    if(value&0x02){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()
    cpu.m=2 cpu.t=12
  },

  //0x4F
   bit_1_a : function() {
    if(cpu.a&0x02){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x50
   bit_2_b : function() {
    if(cpu.b&0x04){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x51
   bit_2_c : function() {
    if(cpu.c&0x04){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x52
   bit_2_d : function() {
    if(cpu.d&0x04){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x53
   bit_2_e : function() {
    if(cpu.e&0x04){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x54
   bit_2_h : function() {
    if(cpu.h&0x04){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x55
   bit_2_l : function() {
    if(cpu.l&0x04){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x56
   bit_2_hl : function() {
    var value=memory.readByte(cpu.hl())
    if(value&0x04){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()
    cpu.m=2 cpu.t=12
  },

  //0x57
   bit_2_a : function() {
    if(cpu.a&0x04){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x58
   bit_3_b : function() {
    if(cpu.b&0x08){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x59
   bit_3_c : function() {
    if(cpu.c&0x08){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x5A
   bit_3_d : function() {
    if(cpu.d&0x08){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x5B
   bit_3_e : function() {
    if(cpu.e&0x08){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x5C
   bit_3_h : function() {
    if(cpu.h&0x08){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x5D
   bit_3_l : function() {
    if(cpu.l&0x08){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x5E
   bit_3_hl : function() {
    var value=memory.readByte(cpu.hl())
    if(value&0x08){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()
    cpu.m=2 cpu.t=12
  },

  //0x5F
   bit_3_a : function() {
    if(cpu.a&0x08){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x60
   bit_4_b : function() {
    if(cpu.b&0x10){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x61
   bit_4_c : function() {
    if(cpu.c&0x10){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x62
   bit_4_d : function() {
    if(cpu.d&0x10){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x63
   bit_4_e : function() {
    if(cpu.e&0x10){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x64
   bit_4_h : function() {
    if(cpu.h&0x10){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x65
   bit_4_l : function() {
    if(cpu.l&0x10){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x66
   bit_4_hl : function() {
    var value=memory.readByte(cpu.hl())
    if(value&0x10){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()
    cpu.m=2 cpu.t=12
  },

  //0x67
   bit_4_a : function() {
    if(cpu.a&0x10){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x68
   bit_5_b : function() {
    if(cpu.b&0x20){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x69
   bit_5_c : function() {
    if(cpu.c&0x20){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x6A
   bit_5_d : function() {
    if(cpu.d&0x20){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x6B
   bit_5_e : function() {
    if(cpu.e&0x20){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x6C
   bit_5_h : function() {
    if(cpu.h&0x20){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x6D
   bit_5_l : function() {
    if(cpu.l&0x20){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x6E
   bit_5_hl : function() {
    var value=memory.readByte(cpu.hl())
    if(value&0x20){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()
    cpu.m=2 cpu.t=12
  },

  //0x6F
   bit_5_a : function() {
    if(cpu.a&0x20){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x70
   bit_6_b : function() {
    if(cpu.b&0x40){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x71
   bit_6_c : function() {
    if(cpu.c&0x40){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x72
   bit_6_d : function() {
    if(cpu.d&0x40){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x73
   bit_6_e : function() {
    if(cpu.e&0x40){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x74
   bit_6_h : function() {
    if(cpu.h&0x40){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x75
   bit_6_l : function() {
    if(cpu.l&0x40){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x76
   bit_6_hl : function() {
    var value=memory.readByte(cpu.hl())
    if(value&0x40){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()
    cpu.m=2 cpu.t=12
  },

  //0x77
   bit_6_a : function() {
    if(cpu.a&0x40){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x78
   bit_7_b : function() {
    if(cpu.b&0x80){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x79
   bit_7_c : function() {
    if(cpu.c&0x80){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x7A
   bit_7_d : function() {
    if(cpu.d&0x80){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x7B
   bit_7_e : function() {
    if(cpu.e&0x80){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x7C
   bit_7_h : function() {
    if(cpu.h&0x80){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x7D
   bit_7_l : function() {
    if(cpu.l&0x80){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x7E
   bit_7_hl : function() {
    var value=memory.readByte(cpu.hl())
    if(value&0x80){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()
    cpu.m=2 cpu.t=12
  },

  //0x7F
   bit_7_a : function() {
    if(cpu.a&0x80){cpu.resetZeroFlag()} else {cpu.setZeroFlag()}
    cpu.resetSubFlag()
    cpu.setHalfFlag()

  },

  //0x80
   res_0_b: function () {
    cpu.b&=0xFE

  },

  //0x81
   res_0_c: function () {
    cpu.c&=0xFE

  },

  //0x82
   res_0_d: function () {
    cpu.d&=0xFE

  },

  //0x83
   res_0_e: function () {
    cpu.e&=0xFE

  },

  //0x84
   res_0_h: function () {
    cpu.h&=0xFE

  },

  //0x85
   res_0_l: function () {
    cpu.l&=0xFE

  },

  //0x86
   res_0_hl: function () {
    var value=memory.readByte(cpu.hl())
    value&=0xFE
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0x87
   res_0_a: function () {
    cpu.a&=0xFE

  },

  //0x88
   res_1_b: function () {
    cpu.b&=0xFD

  },

  //0x89
   res_1_c: function () {
    cpu.c&=0xFD

  },

  //0x8A
   res_1_d: function () {
    cpu.d&=0xFD

  },

  //0x8B
   res_1_e: function () {
    cpu.e&=0xFD

  },

  //0x8C
   res_1_h: function () {
    cpu.h&=0xFD

  },

  //0x8D
   res_1_l: function () {
    cpu.l&=0xFD

  },

  //0x8E
   res_1_hl: function () {
    var value=memory.readByte(cpu.hl())
    value&=0xFD
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0x8F
   res_1_a: function () {
    cpu.a&=0xFD

  },

  //0x90
   res_2_b: function () {
    cpu.b&=0xFB

  },

  //0x91
   res_2_c: function () {
    cpu.c&=0xFB

  },

  //0x92
   res_2_d: function () {
    cpu.d&=0xFB

  },

  //0x93
   res_2_e: function () {
    cpu.e&=0xFB

  },

  //0x94
   res_2_h: function () {
    cpu.h&=0xFB

  },

  //0x95
   res_2_l: function () {
    cpu.l&=0xFB

  },

  //0x96
   res_2_hl: function () {
    var value=memory.readByte(cpu.hl())
    value&=0xFB
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0x97
   res_2_a: function () {
    cpu.a&=0xFB

  },

  //0x98
   res_3_b: function () {
    cpu.b&=0xF7

  },

  //0x99
   res_3_c: function () {
    cpu.c&=0xF7

  },

  //0x9A
   res_3_d: function () {
    cpu.d&=0xF7

  },

  //0x9B
   res_3_e: function () {
    cpu.e&=0xF7

  },

  //0x9C
   res_3_h: function () {
    cpu.h&=0xF7

  },

  //0x9D
   res_3_l: function () {
    cpu.l&=0xF7

  },

  //0x9E
   res_3_hl: function () {
    var value=memory.readByte(cpu.hl())
    value&=0xF7
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0x9F
   res_3_a: function () {
    cpu.a&=0xF7

  },

  //0xA0
   res_4_b: function () {
    cpu.b&=0xEF

  },

  //0xA1
   res_4_c: function () {
    cpu.c&=0xEF

  },

  //0xA2
   res_4_d: function () {
    cpu.d&=0xEF

  },

  //0xA3
   res_4_e: function () {
    cpu.e&=0xEF

  },

  //0xA4
   res_4_h: function () {
    cpu.h&=0xEF

  },

  //0xA5
   res_4_l: function () {
    cpu.l&=0xEF

  },

  //0xA6
   res_4_hl: function () {
    var value=memory.readByte(cpu.hl())
    value&=0xEF
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xA7
   res_4_a: function () {
    cpu.a&=0xEF

  },

  //0xA8
   res_5_b: function () {
    cpu.b&=0xDF

  },

  //0xA9
   res_5_c: function () {
    cpu.c&=0xDF

  },

  //0xAA
   res_5_d: function () {
    cpu.d&=0xDF

  },

  //0xAB
   res_5_e: function () {
    cpu.e&=0xDF

  },

  //0xAC
   res_5_h: function () {
    cpu.h&=0xDF

  },

  //0xAD
   res_5_l: function () {
    cpu.l&=0xDF

  },

  //0xAE
   res_5_hl: function () {
    var value=memory.readByte(cpu.hl())
    value&=0xDF
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xAF
   res_5_a: function () {
    cpu.a&=0xDF

  },

  //0xB0
   res_6_b: function () {
    cpu.b&=0xBF

  },

  //0xB1
   res_6_c: function () {
    cpu.c&=0xBF

  },

  //0xB2
   res_6_d: function () {
    cpu.d&=0xBF

  },

  //0xB3
   res_6_e: function () {
    cpu.e&=0xBF

  },

  //0xB4
   res_6_h: function () {
    cpu.h&=0xBF

  },

  //0xB5
   res_6_l: function () {
    cpu.l&=0xBF

  },

  //0xB6
   res_6_hl: function () {
    var value=memory.readByte(cpu.hl())
    value&=0xBF
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xB7
   res_6_a: function () {
    cpu.a&=0xBF

  },

  //0xB8
   res_7_b: function () {
    cpu.b&=0x7F

  },

  //0xB9
   res_7_c: function () {
    cpu.c&=0x7F

  },

  //0xBA
   res_7_d: function () {
    cpu.d&=0x7F

  },

  //0xBB
   res_7_e: function () {
    cpu.e&=0x7F

  },

  //0xBC
   res_7_h: function () {
    cpu.h&=0x7F

  },

  //0xBD
   res_7_l: function () {
    cpu.l&=0x7F

  },

  //0xBE
   res_7_hl: function () {
    var value=memory.readByte(cpu.hl())
    value&=0x7F
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xBF
   res_7_a: function () {
    cpu.a&=0x7F

  },

  //0xC0
   set_0_b: function () {
    cpu.b|=0x01

  },

  //0xC1
   set_0_c: function () {
    cpu.c|=0x01

  },

  //0xC2
   set_0_d: function () {
    cpu.d|=0x01

  },

  //0xC3
   set_0_e: function () {
    cpu.e|=0x01

  },

  //0xC4
   set_0_h: function () {
    cpu.h|=0x01

  },

  //0xC5
   set_0_l: function () {
    cpu.l|=0x01

  },

  //0xC6
   set_0_hl: function () {
    var value=memory.readByte(cpu.hl())
    value|=0x01
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xC7
   set_0_a: function () {
    cpu.a|=0x01

  },

  //0xC8
   set_1_b: function () {
    cpu.b|=0x02

  },

  //0xC9
   set_1_c: function () {
    cpu.c|=0x02

  },

  //0xCA
   set_1_d: function () {
    cpu.d|=0x02

  },

  //0xCB
   set_1_e: function () {
    cpu.e|=0x02

  },

  //0xCC
   set_1_h: function () {
    cpu.h|=0x02

  },

  //0xCD
   set_1_l: function () {
    cpu.l|=0x02

  },

  //0xCE
   set_1_hl: function () {
    var value=memory.readByte(cpu.hl())
    value|=0x02
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xCF
   set_1_a: function () {
    cpu.a|=0x02

  },

  //0xD0
   set_2_b: function () {
    cpu.b|=0x04

  },

  //0xD1
   set_2_c: function () {
    cpu.c|=0x04

  },

  //0xD2
   set_2_d: function () {
    cpu.d|=0x04

  },

  //0xD3
   set_2_e: function () {
    cpu.e|=0x04

  },

  //0xD4
   set_2_h: function () {
    cpu.h|=0x04

  },

  //0xD5
   set_2_l: function () {
    cpu.l|=0x04

  },

  //0xD6
   set_2_hl: function () {
    var value=memory.readByte(cpu.hl())
    value|=0x04
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xD7
   set_2_a: function () {
    cpu.a|=0x04

  },

  //0xD8
   set_3_b: function () {
    cpu.b|=0x08

  },

  //0xD9
   set_3_c: function () {
    cpu.c|=0x08

  },

  //0xDA
   set_3_d: function () {
    cpu.d|=0x08

  },

  //0xDB
   set_3_e: function () {
    cpu.e|=0x08

  },

  //0xDC
   set_3_h: function () {
    cpu.h|=0x08

  },

  //0xDD
   set_3_l: function () {
    cpu.l|=0x08

  },

  //0xDE
   set_3_hl: function () {
    var value=memory.readByte(cpu.hl())
    value|=0x08
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xDF
   set_3_a: function () {
    cpu.a|=0x08

  },

  //0xE0
   set_4_b: function () {
    cpu.b|=0x10

  },

  //0xE1
   set_4_c: function () {
    cpu.c|=0x10

  },

  //0xE2
   set_4_d: function () {
    cpu.d|=0x10

  },

  //0xE3
   set_4_e: function () {
    cpu.e|=0x10

  },

  //0xE4
   set_4_h: function () {
    cpu.h|=0x10

  },

  //0xE5
   set_4_l: function () {
    cpu.l|=0x10

  },

  //0xE6
   set_4_hl: function () {
    var value=memory.readByte(cpu.hl())
    value|=0x10
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xE7
   set_4_a: function () {
    cpu.a|=0x10

  },

  //0xE8
   set_5_b: function () {
    cpu.b|=0x20

  },

  //0xE9
   set_5_c: function () {
    cpu.c|=0x20

  },

  //0xEA
   set_5_d: function () {
    cpu.d|=0x20

  },

  //0xEB
   set_5_e: function () {
    cpu.e|=0x20

  },

  //0xEC
   set_5_h: function () {
    cpu.h|=0x20

  },

  //0xED
   set_5_l: function () {
    cpu.l|=0x20

  },

  //0xEE
   set_5_hl: function () {
    var value=memory.readByte(cpu.hl())
    value|=0x20
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xEF
   set_5_a: function () {
    cpu.a|=0x20

  },

  //0xF0
   set_6_b: function () {
    cpu.b|=0x40

  },

  //0xF1
   set_6_c: function () {
    cpu.c|=0x40

  },

  //0xF2
   set_6_d: function () {
    cpu.d|=0x40

  },

  //0xF3
   set_6_e: function () {
    cpu.e|=0x40

  },

  //0xF4
   set_6_h: function () {
    cpu.h|=0x40

  },

  //0xF5
   set_6_l: function () {
    cpu.l|=0x40

  },

  //0xF6
   set_6_hl: function () {
    var value=memory.readByte(cpu.hl())
    value|=0x40
    memory.writeByte(value, cpu.hl())
  },

  //0xF7
   set_6_a: function () {
    cpu.a|=0x40

  },

  //0xF8
   set_7_b: function () {
    cpu.b|=0x80

  },

  //0xF9
   set_7_c: function () {
    cpu.c|=0x80

  },

  //0xFA
   set_7_d: function () {
    cpu.d|=0x80

  },

  //0xFB
   set_7_e: function () {
    cpu.e|=0x80

  },

  //0xFC
   set_7_h: function () {
    cpu.h|=0x80

  },

  //0xFD
   set_7_l: function () {
    cpu.l|=0x80

  },

  //0xFE
   set_7_hl: function () {
    var value=memory.readByte(cpu.hl())
    value|=0x80
    memory.writeByte(value, cpu.hl())
    cpu.m=2 cpu.t=16
  },

  //0xFF
   set_7_a: function () {
    cpu.a|=0x80

  },
}

*/

function PrefixCB (registers, getFlags, setFlags, readByte, writeByte) {
  var cpu = { registers, getFlags, setFlags }
  var memory = { readByte, writeByte }
  return [
    rlc(cpu, memory, 'b'),
    rlc(cpu, memory, 'c'),
    rlc(cpu, memory, 'd'),
    rlc(cpu, memory, 'e'),
    rlc(cpu, memory, 'h'),
    rlc(cpu, memory, 'l'),
    rlc(cpu, memory, 'h', 'l'),
    rlc(cpu, memory, 'a'),
    rrc(cpu, memory, 'b'),
    rrc(cpu, memory, 'c'),
    rrc(cpu, memory, 'd'),
    rrc(cpu, memory, 'e'),
    rrc(cpu, memory, 'h'),
    rrc(cpu, memory, 'l'),
    rrc(cpu, memory, 'h', 'l'),
    rrc(cpu, memory, 'a'),
    rl(cpu, memory, 'b'),
    rl(cpu, memory, 'c'),
    rl(cpu, memory, 'd'),
    rl(cpu, memory, 'e'),
    rl(cpu, memory, 'h'),
    rl(cpu, memory, 'l'),
    rl(cpu, memory, 'h', 'l'),
    rl(cpu, memory, 'a')
  ]
}

module.exports = { PrefixCB: PrefixCB }
