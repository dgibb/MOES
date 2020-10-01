var instructions  = require('./cpu-instructions.js');
var maps  = require('./cpu-instructions.js');

function CPU() {

  this.registers = {
    a: 0x01,
    b: 0x00,
    c: 0x13,
    d: 0x00,
    e: 0xD8,
    h: 0x01,
    l: 0x,
    f: 0, // flags
  };

  this.instructions = instructions;
  this.maps = maps;

  this.timer = 0;
  this.pc = 0x100;
  this.pcPrev = 0;
  this.sp = 0xffe;
  this.m = 0;
  this.t = 0;
  this.ime = 0;

  //-----------------//
  //----- FLAGS -----//
  //-----------------//


  this.zeroFlag = function () {
    return this.registers.f & 0x80;
  };

  this.setZeroFlag = function () {
    this.registers.f |= 0x80;
  };

  this.resetZeroFlag = function () {
    this.registers.f &= 0x70;
  };

  this.subFlag = function () {
    return this.registers.f & 0x40;
  };

  this.setSubFlag = function () {
    this.registers.f |= 0x40;
  };

  this.resetSubFlag = function () {
    this.registers.f &= 0xB0;
  };

  this.halfFlag = function () {
    return this.registers.f & 0x20;
  };

  this.setHalfFlag = function () {
    this.registers.f |= 0x20;
  };

  this.resetHalfFlag = function () {
    this.registers.f &= 0xD0;
  };

  this.carryFlag = function () {
    return this.registers.f & 0x10;
  };

  this.setCarryFlag = function () {
    this.registers.f |= 0x10;
  };

  this.resetCarryFlag = function () {
    this.registers.f &= 0xE0;
  };

  this.interruptEnabled = function () {
    return this.ime != 0;
  };

  this.setFlags = function (flags) {
    if (flags.carry !== null) {
      if (flags.carry) {
        this.setCarryFlag();
      } else {
        this.resetCarryFlag();}
    }

    if (flags.zero !== null) {
      if (flags.carry) {
        this.setZeroFlag();
      } else {
        this.resetZeroFlag();
      }
    }

    if (flags.sub !== null) {
      if (flags.carry) {
        this.setSubFlag();
      } else {
        this.resetSubFlag();
      }
    }

    if (flags.half !== null) {
      if (flags.carry) {
        this.setHalfFlag();
      } else {
        this.resetHalfFlag();
      }
    }
  };

  //-------------------//
  //----- execute -----//
  //-------------------//

  this.ex = function (opcode) {
    this.pcPrev = this.pc;
    this.maps.instructions[opcode]();
    this.pc += this.maps.instruction_lengths[opcode];
    this.pc &= 0xFFFF;
    display.step();
    timer.step(opcode);
    interrupt.step();
  };

  //-------------------//
  //----- Helpers -----//
  //-------------------//

  this.getAddr = function (a, b) { //finds and returns combined address of two 8bit registers
    var addr = a;
    addr = addr << 8;
    addr |= b;
    return addr;
  };

  this.signDecode = function (val) {
    var neg = val & 0x80;
    if (neg) {
      val = ~val & 0xFF;
      val++;
      val = -val;
    }

    return val;
  };

  this.hl = function () {
    return this.getAddr(this.registers.h, this.registers.l);
  };

  //-----------------//
  //----- debug -----//
  //-----------------//

  this.printStack = function () {
    console.log('STACK:')
    var i = 0
    while (((this.sp + i) & 0xFF) !== 0xFF) {
      console.log((mmu.sp + i).toString(16), ': ', mmu.readByte(this.sp + i))
      i += 2
    }
  }

  this.runInstruction = function () {
    this.showFunc();
    this.ex(mmu.readByte(this.pc));
    this.showState();
    display.showState();
  };

  this.showFunc = function () {
    console.log('executing: MEMORY[', (this.pc).toString(16), '], ', oneByteInstructions[mmu.readByte(this.pc)].name, ', hex ', mmu.readByte(this.pc).toString(16));
  };

  this.showState = function () {
    console.log('current state: ');
    console.log('AF: ', this.toHex(this.a), this.toHex(this.registers.f));
    console.log('BC: ', this.toHex(this.b), this.toHex(this.c));
    console.log('DE: ', this.toHex(this.d), this.toHex(this.e));
    console.log('HL: ', this.toHex(this.h), this.toHex(this.l));
    console.log('sp: ', this.sp.toString(16));
    console.log('pc: ', this.pc.toString(16));
    console.log('m: ', this.m);
    console.log('t: ', this.t);
    console.log('divCnt: ', this.toHex(timer.divCnt));
    console.log('DIV(FF04):', this.toHex(MEMORY[0xFF04]));
    console.log('timaCnt: ', this.toHex(timer.timaCnt));
    console.log('TIMA(FF05):', this.toHex(MEMORY[0xFF05]));
    console.log('TMA(FF06):', this.toHex(MEMORY[0xFF06]));
    console.log('TAC(FF07):', this.toHex(MEMORY[0xFF07]));
    console.log('IF:', this.toHex(MEMORY[0xFF0F]));
    console.log('IE:', this.toHex(MEMORY[0xFFFF]));
  },

  this.toHex = function (n) {
    var hex = n.toString(16);
    while (hex.length < 2) {
      hex = '0' + hex;
    }

    return hex;
  };

}
