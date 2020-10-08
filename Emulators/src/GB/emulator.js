var CPU = require('./cpu/cpu.js')
var MMU = require('./mmu.js')
var Display = require('./display.js')
var Input = require('./input.js')
var Timer = require('./timer.js')
var Interrupt = require('./interrupt')
var MBC0 = require('./MemoryBankControllers/MBC0.js')
var MBC1 = require('./MemoryBankControllers/MBC1.js')

function Emulator () {
  this.cpu = new CPU()
  this.mmu = new MMU()
  this.display = new Display(mmu)
  this.input = new Input()
  this.timer = new Timer()
  this.interrupt = new Interrupt()

  this.init = function () {
    this.memory.memoryInit()
    this.memory.biosInit()
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
            this.memory.mbc = new MBC0(byteArray, this.display)
            break

          case 1:
          case 2:
          case 3:
            console.log('mbc1')
            this.memory.mbc = new MBC1(byteArray)
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
    const opcode = this.memory.readByte(this.cpu.pc)
    const cycles = this.cpu.ex(opcode)
    this.display.step(cycles)
    this.timer.step(cycles)
    this.interrupt.step(cycles)
  }

  this.runFrame = function () {
    while (this.display.line !== 144) {
      this.cpu.ex()
    }
    while (this.display.line !== 0) {
      this.cpu.ex(this.memory.readByte(this.cpu.pc))
    }
  }

  this.shrink = function (x) {
    console.log(x)
    x.style.maxHeight = 0
  }
}

module.exports = { Emulator: Emulator }
