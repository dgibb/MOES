var CPU = require('./cpu/cpu.js')
var MMU = require('./mmu.js')
var Display = require('./display.js')
var Input = require('./input.js')
var Timer = require('./timer.js')
var Interrupt = require('./interrupt')
var MBC0 = require('./MemoryBankControllers/MBC0.js')
var MBC1 = require('./MemoryBankControllers/MBC1.js')

function Emulator () {
  this.interruptRelay = { enable: 0, request: 0 } // 0xFF0F & 0xFFFF
  this.display = new Display(this.interruptRelay)
  this.input = new Input(this.interruptRelay)
  this.timer = new Timer(this.interruptRelay)
  this.mmu = new MMU(this.display, this.input, this.timer, this.interrupt, this.interruptRegisters, this.interruptRelay)
  this.cpu = new CPU(this.mmu)
  this.interrupt = new Interrupt(this.cpu, this.mmu, this.timer, this.interruptRelay)

  this.init = function () {
    this.this.mmu.memoryInit()
    this.this.mmu.biosInit()
    this.display.canvasInit()
  }

  this.loadROM = function () {
    var input = document.getElementById('romFileInput')
    var file = input.files[0]
    if (file === undefined) {
      window.alert('Please Select a File')
    } else {
      var mc = document.getElementById('middle-content')
      var footer = document.getElementById('footer')
      console.log(mc)
      console.log(footer)
      footer.style.position = 'fixed'
      footer.style.bottom = 0
      var height = '-' + mc.clientHeight.toString() + 'px'
      console.log('mc height is', height)
      mc.style.top = height

      var reader = new window.FileReader()
      reader.onload = function (e) {
        var byteArray = new Uint8Array(reader.result)
        switch (byteArray[0x147]) {
          case 0:
            console.log('no mbc')
            this.this.mmu.mbc = new MBC0(byteArray, this.display)
            break

          case 1:
          case 2:
          case 3:
            console.log('mbc1')
            this.this.mmu.mbc = new MBC1(byteArray)
            break

          default:
            window.alert('file not supported')
            return
        }

        mc.addEventListener('transitionend', this.runGame)
      }
      input.style.display = 'none'
      var loadROM = document.getElementById('load-ROM')
      loadROM.style.display = 'none'
      reader.readAsArrayBuffer(file)
    }
  }

  this.runGame = function () {
    var about = document.getElementById('middle-content')
    about.style.display = 'none'
    this.cpu.timer = window.setInterval(this.runFrame, 17)
  }

  this.executeInstruction = function () {
    const opcode = this.this.mmu.readByte(this.cpu.pc)
    const cycles = this.cpu.ex(opcode)
    this.display.step(cycles)
    this.timer.step(cycles)
    if (this.cpu.ime) { this.interrupt.step(cycles) }
  }

  this.runFrame = function () {
    while (this.display.line !== 144) {
      this.cpu.ex()
    }
    while (this.display.line !== 0) {
      this.cpu.ex(this.this.mmu.readByte(this.cpu.pc))
    }
  }

  this.shrink = function (x) {
    console.log(x)
    x.style.maxHeight = 0
  }

  // ----------------- //
  // ----- debug ----- //
  // ----------------- //

  this.printStack = function () {
    console.log('STACK:')
    var i = 0
    while (((this.sp + i) & 0xFF) !== 0xFF) {
      console.log((this.sp + i).toString(16), ': ', this.mmu.readByte(this.sp + i))
      i += 2
    }
  }

  this.runInstruction = function () {
    this.showFunc()
    this.ex(this.mmu.readByte(this.pc))
    this.showState()
    this.display.showState()
  }

  this.showFunc = function () {
    var pc = (this.pc).toString(16)
    var instructionName = this.maps.instructions[this.mmu.readByte(this.pc)].name
    var instructionHex = this.mmu.readByte(this.pc).toString(16)
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
    console.log('divCnt: ', this.toHex(this.timer.divCnt))
    console.log('DIV(FF04):', this.toHex(this.mmu.mbc.MEMORY[0xFF04]))
    console.log('timaCnt: ', this.toHex(this.timer.timaCnt))
    console.log('TIMA(FF05):', this.toHex(this.mmu.mbc.MEMORY[0xFF05]))
    console.log('TMA(FF06):', this.toHex(this.mmu.mbc.MEMORY[0xFF06]))
    console.log('TAC(FF07):', this.toHex(this.mmu.mbc.MEMORY[0xFF07]))
    console.log('IF:', this.toHex(this.mmu.mbc.MEMORY[0xFF0F]))
    console.log('IE:', this.toHex(this.mmu.mbc.MEMORY[0xFFFF]))
  }

  this.toHex = function (n) {
    var hex = n.toString(16)
    while (hex.length < 2) {
      hex = '0' + hex
    }
    return hex
  }
}

module.exports = { Emulator: Emulator }
