var instructions = require('./instruction/main.js')
var prefixCB = require('./instructions/prefixCB.js')
var { instructionTimings, instructionLengths } = require('./cpu_maps.js')

function CPU (memory) {
  this.registers = {
    a: 0x01,
    b: 0x00,
    c: 0x13,
    d: 0x00,
    e: 0xD8,
    h: 0x01,
    l: 0x00,
    f: 0 // flags
  }

  this.timer = 0
  this.pc = 0x100
  this.pcPrev = 0
  this.sp = 0xffe
  this.m = 0
  this.t = 0
  this.ime = 0

  this.instructions = instructions(this.registers, this.setFlags, this.getFlags, this.hl, memory.readByte, memory.writeByte)
  this.prefixCB = prefixCB(this.registers, this.setFlags, this.getFlags, this.hl, memory.readByte, memory.writeByte)
  this.instructionTimings = instructionTimings
  this.instructionLengths = instructionLengths

  // ----------------- //
  // ----- FLAGS ----- //
  // ----------------- //

  this.getFlags = function () {
    return {
      zero: this.registers.f & 0x80,
      sub: this.registers.f & 0x40,
      half: this.registers.f & 0x20,
      carry: this.registers.f & 0x10
    }
  }

  this.setFlags = function (flags) {
    if (flags.carry !== null) { this.registers.f = (flags.carry) ? this.registers.f | 0x10 : this.registers.f & 0xE0 }
    if (flags.zero !== null) { this.registers.f = (flags.zero) ? this.registers.f | 0x80 : this.registers.f & 0x70 }
    if (flags.sub !== null) { this.registers.f = (flags.sub) ? this.registers.f | 0x40 : this.registers.f & 0xB0 }
    if (flags.half !== null) { this.registers.f = (flags.half) ? this.registers.f | 0x20 : this.registers.f & 0xD0 }
  }

  this.interruptEnabled = function () {
    return this.ime !== 0
  }

  // ------------------- //
  // ----- execute ----- //
  // ------------------- //

  this.ex = function (opcode) {
    this.pcPrev = this.pc
    this.instructions[opcode]()
    this.pc += this.instruction_lengths[opcode] & 0xFFFF
  }

  // ------------------- //
  // ----- Helpers ----- //
  // ------------------- //

  // finds and returns 16bit address of two 8bit registers
  this.getAddr = function (a, b) {
    var addr = a
    addr = addr << 8
    addr |= b
    return addr
  }

  this.signDecode = function (val) {
    var neg = val & 0x80
    if (neg) {
      val = ~val & 0xFF
      val++
      val = -val
    }
    return val
  }

  this.hl = function () {
    return this.getAddr(this.registers.h, this.registers.l)
  }

}

module.exports = { CPU: CPU }
