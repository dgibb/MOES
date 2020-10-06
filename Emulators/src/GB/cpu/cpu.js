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

  // ----------------- //
  // ----- debug ----- //
  // ----------------- //

  this.printStack = function () {
    console.log('STACK:')
    var i = 0
    while (((this.sp + i) & 0xFF) !== 0xFF) {
      console.log((mmu.sp + i).toString(16), ': ', mmu.readByte(this.sp + i))
      i += 2
    }
  }

  this.runInstruction = function () {
    this.showFunc()
    this.ex(mmu.readByte(this.pc))
    this.showState()
    display.showState()
  }

  this.showFunc = function () {
    var pc = (this.pc).toString(16);
    var instructionName = this.maps.instructions[mmu.readByte(this.pc)].name
    var instructionHex = mmu.readByte(this.pc).toString(16)
    console.log('executing: MEMORY[', pc, '], ', instructionName, ', hex ', instructionHex)
  }

  this.showState = function () {
    console.log('current state: ')
    console.log('AF: ', this.toHex(this.a), this.toHex(this.registers.f))
    console.log('BC: ', this.toHex(this.b), this.toHex(this.c))
    console.log('DE: ', this.toHex(this.d), this.toHex(this.e))
    console.log('HL: ', this.toHex(this.h), this.toHex(this.l))
    console.log('sp: ', this.sp.toString(16))
    console.log('pc: ', this.pc.toString(16))
    console.log('m: ', this.m)
    console.log('t: ', this.t)
    console.log('divCnt: ', this.toHex(timer.divCnt))
    console.log('DIV(FF04):', this.toHex(MEMORY[0xFF04]))
    console.log('timaCnt: ', this.toHex(timer.timaCnt))
    console.log('TIMA(FF05):', this.toHex(MEMORY[0xFF05]))
    console.log('TMA(FF06):', this.toHex(MEMORY[0xFF06]))
    console.log('TAC(FF07):', this.toHex(MEMORY[0xFF07]))
    console.log('IF:', this.toHex(MEMORY[0xFF0F]))
    console.log('IE:', this.toHex(MEMORY[0xFFFF]))
  }

  this.toHex = function (n) {
    var hex = n.toString(16)
    while (hex.length < 2) {
      hex = '0' + hex
    }
    return hex
  }
}

module.exports = { CPU: CPU }
