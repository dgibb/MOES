function Input (interruptRelay) {
  this.keys = [0xFF, 0xFF]

  this.keyDown = function (e) {
    interruptRelay[0xFF0F] |= 0x10
    // if (cpu.stop=1){emulator.runGame();}
    // console.log(e.keyCode);
    switch (e.keyCode) {
      case 65: this.keys[1] &= 0x0E; break // A
      case 83: this.keys[1] &= 0x0D; break // B
      case 38: this.keys[0] &= 0x0B; break // up
      case 40: this.keys[0] &= 0x07; break // Down
      case 37: this.keys[0] &= 0x0D; break // Left
      case 39: this.keys[0] &= 0x0E; break // Right
      case 13: this.keys[1] &= 0x07; break // Start
      case 16: this.keys[1] &= 0x0B; break // Select
    }
  }

  this.keyUp = function (e) {
    switch (e.keyCode) {
      case 65: this.keys[1] |= 0x01; break // A
      case 83: this.keys[1] |= 0x02; break // B
      case 38: this.keys[0] |= 0x04; break // Up
      case 40: this.keys[0] |= 0x08; break // Down
      case 37: this.keys[0] |= 0x02; break // Left
      case 39: this.keys[0] |= 0x01; break // Right
      case 13: this.keys[1] |= 0x08; break // Start
      case 16: this.keys[1] |= 0x04; break // Select
    }
  }
};

module.exprots = { Input: Input }
