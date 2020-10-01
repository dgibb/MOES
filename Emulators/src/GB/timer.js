var timer = {

  divCnt: 0,
  timaCnt: 0,
  timaSpeed: 1024,
  timaOn: 0,

  step: function (opcode) {

    timer.divCnt += cpu.maps.instruction_timings.t[opcode];
    if (timer.timaOn) {timer.timaCnt += cpu.maps.instruction_timings.t[opcode];}
    if ((MEMORY[0xFF07] & 0x4) !== 0) {timer.timaOn = 1;} else {timer.timaOn = 0; timer.timaCnt = 0;}

    if (timer.divCnt > 255) {
      timer.divCnt = timer.divCnt % 256;
      MEMORY[0xFF04] += 1;
      MEMORY[0xFF04] %= 256;
    }

    if (timer.timaCnt > timer.timaSpeed) {
      var x = Math.floor(timer.timaCnt / timer.timaSpeed);
      timer.timaCnt = timer.timaCnt % timer.timaSpeed;
      MEMORY[0xFF05] += x;
      if (MEMORY[0xFF05] > 0xFF) {
        MEMORY[0xFF0F] |= 0x04;
        MEMORY[0xFF05] = MEMORY[0xFF06];
      }
    }
  },
};
