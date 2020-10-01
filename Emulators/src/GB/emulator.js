var CPU = require('./cpu/cpu.js')
var MMU = require('./mmu.js')
var Display = require('./display.js')
var Input = require('./input.js')
var Timer = require('./timer.js')
var Interrupt = require('./interrupt')

function emulator () {

  this.cpu = new CPU()
  this.cpu = new MMU()
  this.display = new Display()
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
      alert('Please Select a File')
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

      var reader = new FileReader()
      reader.onload = function (e) {
        var byteArray = new Uint8Array(reader.result)
        switch (byteArray[0x147]) {
          case 0:
            console.log('no mbc')
            MBC0.init(byteArray)
            break

          case 1:
          case 2:
          case 3:
            console.log('mbc1')
            MBC1.init(byteArray)
            break

          default:
            alert('file not supported')
            return
        }

        mc.addEventListener('transitionend', emulator.runGame)
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
    cpu.timer = window.setInterval(emulator.runFrame, 17)
  }

  this.runFrame = function () {
    while (this.display.line !== 144) {
      this.cpu.ex(this.memory.readByte(this.cpu.pc))
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

module.exports = { emulator: emulator }
