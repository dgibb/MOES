function timer() {

  this.div = 0
  this.divCnt = 0

  this.tima = 0
  this.timaCnt = 0

  this.timaMod = 0

  this.timaSpeed = 1024
  this.timaOn = 0
  this.timerCtrl = 0

  this.step = function (cycles) {
    timer.divCnt += cycles
    if (timer.timaOn) {
      timer.timaCnt += cycles
    }

    if (timer.divCnt > 0xFF) {
      timer.divCnt = timer.divCnt % 0xFF
      this.div += 1
      this.div %= 256
    }

    if (timer.timaCnt > timer.timaSpeed) {
      var x = Math.floor(timer.timaCnt / timer.timaSpeed)
      timer.timaCnt = timer.timaCnt % timer.timaSpeed
      this.tima += x
      if (this.tima > 0xFF) {
        MEMORY[0xFF0F] |= 0x04
        this.tima = this.timaMOd
      }
    }
  }

  this.setTimaSpeed = function (val) {
    this.timaSpeed = timaSpeeds[val]
  }

  this.readByte = function (addr) {
    switch (addr) {
      case 0xFF04:
        return this.divCnt

      case 0xFF05:
        return this.timaCnt

      case 0xFF06:
        return this.timaMod

      case 0xFF07:
        return this.timerCtrl
    }
  }

  this.writeByte = function (data, addr) {
    switch (addr) {
      case 0xFF04:
        this.divCnt = 0x00
        break

      case 0xFF05:
        this.timaCnt = data
        break

      case 0xFF06:
        this.timaMod = data
        break

      case 0xFF07:
        this.timerCtrl = data
        this.timaOn = (data >> 2) & 0x01
        this.timaSpeed = timaSpeeds[data & 0x03]
        break
    }
  }
}

var timaSpeeds = [1024, 16, 64, 256]
