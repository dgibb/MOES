function input() {

  this.keys = [0xFF, 0xFF],

  this.keyDown = function(e){
      MEMORY[0xFF0F]|=0x10;
      //if (cpu.stop=1){emulator.runGame();}
      //console.log(e.keyCode);
        switch(e.keyCode)
    {
        case 65: input.keys[1] &= 0xE; break;//A
              case 83: input.keys[1] &= 0xD; break;//B
              case 38: input.keys[0] &= 0xB; break;//up
              case 40: input.keys[0] &= 0x7; break;//Down
              case 37: input.keys[0] &= 0xD; break;//Left
              case 39: input.keys[0] &= 0xE; break;//Right
              case 13: input.keys[1] &= 0x7; break;//Start
              case 16: input.keys[1] &= 0xB; break;//Select
    }
  }

      keyUp = function(e){
        switch(e.keyCode){
        case 65:  input.keys[1] |= 0x1; break;//A
              case 83:  input.keys[1] |= 0x2; break;//B
              case 38:  input.keys[0] |= 0x4; break;//up
              case 40:  input.keys[0] |= 0x8; break;//down
              case 37:  input.keys[0] |= 0x2; break;//left
              case 39:  input.keys[0] |= 0x1; break;//right
              case 13:  input.keys[1] |= 0x8; break;//Start
              case 16:  input.keys[1] |= 0x4; break;//Select
      }
    }
};
