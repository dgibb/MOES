//David Gibb
var apu = {

  joypad1: 0, //0x4016 (write/set strobe)
  joypad2: 0, //0x4017 (write/set strobe)

  readByte(addr) {
    switch (addr) {
      case 0x4016:
        var out = input.shiftRegisters1[input.strobe1];
        input.strobe1 = (input.strobe1 + 1) % 8;
        return out;
        break;

      case 0x4017:
        var out = input.shiftRegisters2[input.strobe2];
        input.strobe2 = (input.strobe2 + 1) % 8;
        return out;
        break;

      default:
        //aconsole.log('apu.readByte: unimplemented byte', addr);
        break;

    }

  },

  writeByte(addr, data) {
    switch (addr) {
      case 0x4016:
        apu.joypad1 = data & 0x01;
        break;

      case 0x4017:
        apu.joypad2 = data & 0x01;
        break;

      default:
        //console.log('apu.writeByte: unimplemented byte', addr);
        break;

    }

  },

  /*
  var Audio=new AudioContext();
  var gainNode1 = Audio.createGain();

  var oscillator1 = Audio.createOscillator();
  var oscillator2 = Audio.createOscillator();

  oscillator1.connect(gainNode1);
  oscillator2.connect(gainNode1);

  gainNode1.connect(Audio.destination);

  oscillator2.frequency.value=1024;
  */

};
