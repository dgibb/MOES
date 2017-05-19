//David Gibb

import {cpu} from './cpu'
import {memory, prgRom} from './memory'
import {ppu, chrRom} from './gpu'

export var mapper0={

 unused:0,
 interrupts:0,

  readByte: function(addr){

    switch (addr&0xF000){

      case 0x0000:
      case 0x1000:
      case 0x2000:
      case 0x3000:
      console.log('mapper0.readByte Invalid addr');
      break;

      case 0x4000:
      case 0x5000:
      if (mapper0.unused=0){
        console.log('memory.readByte(): unused space');
        cpu.showFunc();
        cpu.showState();
        console.log(addr);
        mapper0.unused=1;
    }
      break;

      case 0x6000:
      case 0x7000:
        return mapper0.prgRam[addr-0x6000]
      break;

      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
        return prgRom[addr-0x8000];
      break;
    }
  },

  writeByte: function(addr, data){

    switch (addr&0xF000){

      case 0x0000:
      case 0x1000:
      case 0x2000:
      case 0x3000:
      console.log('mapper0.readByte Invalid addr');
      break;

      case 0x4000:
      case 0x5000:
      if (mapper0.unused=0){
        console.log('memory.readByte(): unused space');
        cpu.showFunc();
        cpu.showState();
        console.log(addr);
        mapper0.unused=1;
    }
      break;

      case 0x6000:
      case 0x7000:
        mapper0.prgRam[addr-0x6000]=data;
      break;

      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
        prgRom[addr-0x8000]=data;
      break;
    }
  },

  readVRam: function(addr){

    switch (addr&0xF000){

      case 0x0000:
      case 0x1000:
        return chrRom[addr];
      break;

      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
        console.log('mapper0.readVram: unused address space');
      break;
    }
  },

  writeVRam: function(addr,data){

    switch (addr&0xF000){

      case 0x0000:
      case 0x1000:
        chrRom[addr]=data;
      break;

      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
        console.log('mapper0.writeVram: unused address space');
      break;
    }
  },

  init:function(){
    if (prgRom.length===0x4000){
      //prgRom=prgRom.concat(prgRom);
    }else if(prgRom.length>0x8000){
      console.log('Mapper0.init; ROM too big');
    }
    mapper0.prgRam= new Array(0x2000);
    //mapper0.unusedSpace=new Array(0x2000);
    ppu.patternTableOffset=0x0000;
  },

  step:function(){
  }

};

export var mapper1={

  romBankMode:0,
  chrBankMode:0,
  romBankSelect:0,
  chrBankSelect:[0,0],
  romBankOffset:[0,0x4000],
  chrBankOffset:[0,0x1000],
  shiftReg:0,
  shiftWrites:0,

  readByte: function(addr){

    switch (addr&0xF000){

      case 0x0000:
      case 0x1000:
      case 0x2000:
      case 0x3000:
      console.log('mapper1.readByte Invalid addr');
      break;

      case 0x4000:
      case 0x5000:
        console.log('mapper1.readByte unused address space');
      break;

      case 0x6000:
      case 0x7000:
      return mapper1.prgRam[addr-0x6000]
      break;

      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      return prgRom[addr-0x8000+mapper4.romBankOffset[0]];
      break;

      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
      return prgRom[addr-0xC000+mapper4.romBankOffset[1]];
      break;
    }
  },

  writeByte: function(addr, data){

    switch (addr&0xF000){

      case 0x0000:
      case 0x1000:
      case 0x2000:
      case 0x3000:
      console.log('mapper1.writeByte: Invalid addr');
      break;

      case 0x4000:
      case 0x5000:
        console.log('mapper1.readByte: unused address space');
      break;

      case 0x6000:
      case 0x7000:
      mapper1.prgRam[addr-0x6000]=data;
      break;

      case 0x8000:
      case 0x9000:
      if (data&0x80){mapper1.shiftReg=0;mapper1.shiftWrites=0;
      }else{
        mapper1.shiftReg>>=1;
        mapper1.shiftReg|=((data&0x01)<<4);
        mapper1.shiftWrites++;
        if(mapper1.shiftWrites===5){
          mapper1.shiftWrites=0;
          mapper1.setReg89();
        }
      }
      break;

      case 0xA000:
      case 0xB000:
      if (data&0x80){mapper1.shiftReg=0;mapper1.shiftWrites=0;
      }else{
        mapper1.shiftReg>>=1;
        mapper1.shiftReg|=((data&0x01)<<4);
        mapper1.shiftWrites++;
        if(mapper1.shiftWrites===5){
          mapper1.shiftWrites=0;
          mapper1.setRegAB();
        }
      }
      break;

      case 0xC000:
      case 0xD000:
      if (data&0x80){mapper1.shiftReg=0;mapper1.shiftWrites=0;
      }else{
        mapper1.shiftReg>>=1;
        mapper1.shiftReg|=((data&0x01)<<4);
        mapper1.shiftWrites++;
        if(mapper1.shiftWrites===5){
          mapper1.shiftWrites=0;
          mapper1.setRegCD();
        }
      }
      break;

      case 0xE000:
      case 0xF000:
      if (data&0x80){mapper1.shiftReg=0;mapper1.shiftWrites=0;
      }else{
        mapper1.shiftReg>>=1;
        mapper1.shiftReg|=((data&0x01)<<4);
        mapper1.shiftWrites++;
        if(mapper1.shiftWrites===5){
          mapper1.shiftWrites=0;
          mapper1.setRegEF();
        }
      }

      break;
    }
  },

  readVRam:function(addr){

    switch (addr&0x3000){

      case 0x0000:
        return chrRom[addr+mapper1.chrBankOffset[0]];
      break;


      case 0x1000:
        return chrRom[addr+mapper1.chrBankOffset[1]-0x1000];
      break;

      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
        console.log('mapper1.readVRam invalid addr');
      break;
    }
  },

  writeVRam:function(addr, data){

    switch (addr&0x3000){

      case 0x0000:
        chrRom[addr+mapper1.chrBankOffset[0]]=data;
      break;

      case 0x1000:
        chrRom[addr+mapper1.chrBankOffset[1]-0x1000]=data;
      break;

      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
        console.log('mapper1.readVRam invalid addr');
      break;
    }
  },

  setReg89:function(){
    ppu.mirroring=mapper1.shiftReg&0x03;
    mapper1.shiftReg>>=2;
    mapper1.setRomBankMode();
    mapper1.shiftReg>>=2;
    mapper1.setChrBankMode();
    mapper1.shiftReg=0;
  },

  setRegAB:function(){
    mapper1.setChrBank0();
    mapper1.shiftReg=0;
  },

  setRegCD:function(){
    mapper1.setChrBank1();
    mapper1.shiftReg=0;
  },

  setRegEF:function(){
    mapper1.setRomBank();
    mapper1.shiftReg=0;
  },

  setRomBankMode:function(){
    mapper1.romBankMode=mapper1.shiftReg&0x3;
    if(mapper1.romBankMode<=1){
      mapper1.romBankOffset[0]=mapper1.romBankSelect*0x4000;
      mapper1.romBankOffset[1]=mapper1.romBankOffset[0]+0x4000;
    } else if(mapper1.romBankMode===2){
      mapper1.romBankOffset[0]=0x8000;
      mapper1.romBankOffset[1]=mapper1.romBankSelect*0x4000;
    }else if(mapper1.romBankMode===3){
      mapper1.romBankOffset[0]=mapper1.romBankSelect*0x4000;
      mapper1.romBankOffset[1]=prgRom.length-0x4000;
    }
  },

  setChrBankMode:function(){
    mapper1.chrBankMode=mapper1.shiftReg;
    if(mapper1.chrBankMode===0){
      mapper1.chrBankOffset[0]=mapper1.chrBankSelect[0]*0x1000;
      mapper1.chrBankOffset[1]=mapper1.chrBankOffset[0]+0x1000;
    } else if(mapper1.chrBankMode===1){
      mapper1.chrBankOffset[0]=mapper1.chrBankSelect[0]*0x1000;
      mapper1.romBankOffset[1]=mapper1.chrBankSelect[1]*0x1000;
    }
  },

  setChrBank0:function(){
    if(mapper1.chrBankMode===0){
      mapper1.chrBankSelect[0]=mapper1.shiftReg&0x1E;
      mapper1.chrBankOffset[0]=mapper1.chrBankSelect[0]*0x1000;
      mapper1.chrBankOffset[1]=mapper1.chrBankOffset[0]+0x1000;
    }else{
      mapper1.chrBankSelect[0]=mapper1.shiftReg;
      mapper1.chrBankOffset[0]=mapper1.chrBankSelect[0]*0x1000;
    }
  },

  setChrBank1:function(){
    if(mapper1.chrBankMode===1){
      mapper1.chrBankSelect[1]=mapper1.shiftReg;
      mapper1.chrBankOffset[1]=mapper1.chrBankOffset[1]*0x1000;
    }
  },

  setRomBank:function(){
    if(mapper1.romBankMode<=1){
      mapper1.romBankSelect=mapper1.shiftReg&0x1E;
      mapper1.romBankOffset[0]=mapper1.romBankSelect*0x4000;
      mapper1.romBankOffset[1]=mapper1.romBankOffset[0]+0x4000;
    } else if(mapper1.romBankMode===2){
      mapper1.romBankSelect=mapper1.shiftReg;
      mapper1.romBankOffset[0]=0x8000;
      mapper1.romBankOffset[1]=mapper1.romBankSelect*0x4000;
    }else if(mapper1.romBankMode===3){
      mapper1.romBankSelect=mapper1.shiftReg;
      mapper1.romBankOffset[0]=mapper1.romBankSelect*0x4000;
      mapper1.romBankOffset[1]=prgRom.length-0x4000;
    }
  },

  init:function(){
    mapper1.prgRam= new Array(0x2000);
  },

  irqStep:function(){}

};

export var mapper4={

  prgRam:[],


  //0x8000-0x9FFF
  prgRomBankMode:0,       //0x8000&0x80
  chrRomBankMode:0,      //0x8000&0x40
  bankSelect:0,          //0x8000 & 0x07
  bankRegister:[0,0,0,0,0,0,0,0],
  romBankOffset:[0,0,0,0],
  chrBankOffset:[0,0,0,0,0,0,0,0],



  //0xA000-0xBFFF
  nametableMirroring:0,
  writeProtect:0,
  ramChipEnable:0,

  //0xC000-0xDFFF
  irqLatch:0,
  irqReloadRequest:0,

  //0xE0000-0xFFFF
  irqEnable:0,

  //irq
  irqCounter:0,
  lastEdge:0,
  intCycles:0,
  interrupts:1,


  readByte: function(addr){

    switch (addr&0xF000){

      case 0x0000:
      case 0x1000:
      case 0x2000:
      case 0x3000:
      console.log('mapper4.readByte Invalid addr');
      break;

      case 0x4000:
      case 0x5000:
        console.log('mapper4.readByte unused address space');
      break;

      case 0x6000:
      case 0x7000:
      return mapper4.prgRam[addr-0x6000]
      break;

      case 0x8000:
      case 0x9000:
      return prgRom[addr-0x8000+mapper4.romBankOffset[0]];
      break;

      case 0xA000:
      case 0xB000:
      return prgRom[addr-0xA000+mapper4.romBankOffset[1]];
      break;

      case 0xC000:
      case 0xD000:
      return prgRom[addr-0xC000+mapper4.romBankOffset[2]];
      break;

      case 0xE000:
      case 0xF000:
      return prgRom[addr-0xE000+mapper4.romBankOffset[3]];
      break;
    }
  },

  writeByte: function(addr, data){

    switch (addr&0xF000){

    case 0x0000:
    case 0x1000:
    case 0x2000:
    case 0x3000:
    console.log('mapper4.readByte: Invalid addr');
    break;

    case 0x4000:
    case 0x5000:
      console.log('mapper4.readByte: unused address space');
    break;

    case 0x6000:
    case 0x7000:
    mapper4.prgRam[addr-0x6000]=data;
    break;

    case 0x8000:
    case 0x9000:

        if(!(addr%2)){
          if(mapper4.chrRomBankMode!==((data&0x80)>>7)){
          mapper4.setChrBankMode((data&0x80)>>7);
          }
          if(mapper4.prgRomBankMode!==((data&0x40)>>6)){
          mapper4.setRomBankMode((data&0x40)>>6);
          }
          mapper4.bankSelect=data&0x07;
        }else{
          switch(mapper4.bankSelect){
            case 0:
            mapper4.bankRegister[0]=data;
            if (!mapper4.chrRomBankMode){
              mapper4.chrBankOffset[0]=(data&0xFE)*0x400;
              mapper4.chrBankOffset[1]=(data|0x01)*0x400;
            }else{
              mapper4.chrBankOffset[4]=(data&0xFE)*0x400;
              mapper4.chrBankOffset[5]=(data|0x01)*0x400;
            }
            break;

            case 1:
            mapper4.bankRegister[1]=data;
            if (!mapper4.chrRomBankMode){
              mapper4.chrBankOffset[2]=(data&0xFE)*0x400;
              mapper4.chrBankOffset[3]=(data|0x01)*0x400;
            }else{
              mapper4.chrBankOffset[6]=(data&0xFE)*0x400;
              mapper4.chrBankOffset[7]=(data|0x01)*0x400;
            }
            break;

            case 2:
            mapper4.bankRegister[2]=data;
            if (!mapper4.chrRomBankMode){
              mapper4.chrBankOffset[4]=(data)*0x400;
            }else{
              mapper4.chrBankOffset[0]=(data)*0x400;
            }
            break;

            case 3:
            mapper4.bankRegister[3]=data;
            if (!mapper4.chrRomBankMode){
              mapper4.chrBankOffset[5]=(data)*0x400;
            }else{
             mapper4.chrBankOffset[1]=(data)*0x400;
            }
            break;

            case 4:
            mapper4.bankRegister[4]=data;
            if (!mapper4.chrRomBankMode){
              mapper4.chrBankOffset[6]=(data)*0x400;
            }else{
              mapper4.chrBankOffset[2]=(data)*0x400;
            }
            break;

            case 5:
            mapper4.bankRegister[5]=data;
            if (!mapper4.chrRomBankMode){
              mapper4.chrBankOffset[7]=(data)*0x400;
            }else{
              mapper4.chrBankOffset[3]=(data)*0x400;
            }
            break;

            case 6:
            mapper4.bankRegister[6]=data;
            if (mapper4.prgRomBankMode){
              mapper4.romBankOffset[2]=(data&0x3F)*0x2000;
            }else{
              mapper4.romBankOffset[0]=(data&0x3F)*0x2000;
            }
            break;

            case 7:
            mapper4.bankRegister[7]=data;
            mapper4.romBankOffset[1]=(data&0x3F)*0x2000;
            break;

            default:
            console.log('mmc.writeByte: invalid bankSelect')
            break;
          }
        }
    break;

    case 0xA000:
    case 0xB000:

    if(!(addr%2)){
    mapper4.nametableMirroring=data&0x01;
    }else{
    mapper4.ramChipEnable=(data&0x07)>>7;
    mapper4.writeProtect=((data&0x06)>>6)&0x01;
    }
    break;

    case 0xC000:
    case 0xD000:

    if(!(addr%2)){
    mapper4.irqLatch=data;
    }else{
    mapper4.irqReloadRequest=1;
    mapper4.irqCounter=0;
    }
    break;

    case 0xE000:
    case 0xF000:

    if(!(addr%2)){
    mapper4.irqEnable=0;
    }else{
    mapper4.irqEnable=1;
    break;
    }
    }
  },

  readVRam:function(addr){

    switch (addr&0x3000){

    case 0x0000:

      switch (addr&0x0F00){

        case 0x000:
        case 0x100:
        case 0x200:
        case 0x300:
          return chrRom[addr+mapper4.chrBankOffset[0]]
        break;

        case 0x400:
        case 0x500:
        case 0x600:
        case 0x700:
          return chrRom[addr+mapper4.chrBankOffset[1]-0x400]
        break;

        case 0x800:
        case 0x900:
        case 0xA00:
        case 0xB00:
          return chrRom[addr+mapper4.chrBankOffset[2]-0x800]
        break;

        case 0xC00:
        case 0xD00:
        case 0xE00:
        case 0xF00:
          return chrRom[addr+mapper4.chrBankOffset[3]-0xC00]
        break;

      }

    break;

    case 0x1000:

    switch (addr&0x0F00){

      case 0x000:
      case 0x100:
      case 0x200:
      case 0x300:
        return chrRom[addr+mapper4.chrBankOffset[4]-0x1000]
      break;

      case 0x400:
      case 0x500:
      case 0x600:
      case 0x700:
        return chrRom[addr+mapper4.chrBankOffset[5]-0x1400]
      break;

      case 0x800:
      case 0x900:
      case 0xA00:
      case 0xB00:
        return chrRom[addr+mapper4.chrBankOffset[6]-0x1800]
      break;

      case 0xC00:
      case 0xD00:
      case 0xE00:
      case 0xF00:
        return chrRom[addr+mapper4.chrBankOffset[7]-0x1C00]
      break;

    }

    break;

      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
        console.log('mapper4.readVRam invalid addr');
      break;
    }
  },

  writeVRam:function(addr, data){

    switch (addr&0x3000){

      case 0x0000:

        switch (addr&0x0F00){

          case 0x000:
          case 0x100:
          case 0x200:
          case 0x300:
            chrRom[addr+mapper4.chrBankOffset[0]]=data;
          break;

          case 0x400:
          case 0x500:
          case 0x600:
          case 0x700:
            chrRom[addr+mapper4.chrBankOffset[1]-0x400] =data;
          break;

          case 0x800:
          case 0x900:
          case 0xA00:
          case 0xB00:
          chrRom[addr+mapper4.chrBankOffset[2]-0x800]=data;
          break;

          case 0xC00:
          case 0xD00:
          case 0xE00:
          case 0xF00:
           chrRom[addr+mapper4.chrBankOffset[3]-0xC00]=data;
          break;

        }

      break;

      case 0x1000:

      switch (addr&0x0F00){

        case 0x000:
        case 0x100:
        case 0x200:
        case 0x300:
          chrRom[addr+mapper4.chrBankOffset[4]-0x1000]=data;
        break;

        case 0x400:
        case 0x500:
        case 0x600:
        case 0x700:
         chrRom[addr+mapper4.chrBankOffset[5]-0x1400]=data;
        break;

        case 0x800:
        case 0x900:
        case 0xA00:
        case 0xB00:
         chrRom[addr+mapper4.chrBankOffset[6]-0x1800]=data;
        break;

        case 0xC00:
        case 0xD00:
        case 0xE00:
        case 0xF00:
         chrRom[addr+mapper4.chrBankOffset[7]-0x1C00]=data;
        break;
      }

      break;

      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
      case 0xF000:
        console.log('mapper4.writeVRam invalid addr');
      break;
    }
  },

  setRomBankMode:function(mode){
    mapper4.prgRomBankMode=mode;
    switch(mode){

    case 0:
    mapper4.romBankOffset[2]=prgRom.length-0x4000;
    mapper4.romBankOffset[0]=(mapper4.bankRegister[6]&0x3F)*0x2000;
    break;

    case 1:
    mapper4.romBankOffset[0]=prgRom.length-0x4000;
    mapper4.romBankOffset[2]=(mapper4.bankRegister[6]&0x3F)*0x2000;
    break;

    default:
    console.log('mapper4.setRomBankMode: invalid mode');
    break;
    }

  },

  setChrBankMode:function(mode){
    mapper4.chrRomBankMode=mode;
    switch(mode){

    case 0:
    mapper4.chrBankOffset[0]=(mapper4.bankRegister[0]&0xFE)*0x400;
    mapper4.chrBankOffset[1]=(mapper4.bankRegister[0]|0x01)*0x400;
    mapper4.chrBankOffset[2]=(mapper4.bankRegister[1]&0xFE)*0x400;
    mapper4.chrBankOffset[3]=(mapper4.bankRegister[1]|0x01)*0x400;
    mapper4.chrBankOffset[4]=mapper4.bankRegister[2]*0x400;
    mapper4.chrBankOffset[5]=mapper4.bankRegister[3]*0x400;
    mapper4.chrBankOffset[6]=mapper4.bankRegister[4]*0x400;
    mapper4.chrBankOffset[7]=mapper4.bankRegister[5]*0x400;
    break;

    case 1:
    mapper4.chrBankOffset[4]=(mapper4.bankRegister[0]&0xFE)*0x400;
    mapper4.chrBankOffset[5]=(mapper4.bankRegister[0]|0x01)*0x400;
    mapper4.chrBankOffset[6]=(mapper4.bankRegister[1]&0xFE)*0x400;
    mapper4.chrBankOffset[7]=(mapper4.bankRegister[1]|0x01)*0x400;
    mapper4.chrBankOffset[0]=mapper4.bankRegister[2]*0x400;
    mapper4.chrBankOffset[1]=mapper4.bankRegister[3]*0x400;
    mapper4.chrBankOffset[2]=mapper4.bankRegister[4]*0x400;
    mapper4.chrBankOffset[3]=mapper4.bankRegister[5]*0x400;
    break;

    default:
    console.log('mapper4.setChrBankMode: invalid mode');
    break;
    }

  },

  init:function(){
    mapper4.romBankOffset[3]=prgRom.length-0x2000;
    mapper4.romBankOffset[2]=prgRom.length-0x4000;
    mapper4.romBankOffset[1]=0x2000;
    mapper4.chrBankOffset[1]=0x400;
    mapper4.chrBankOffset[2]=0x800;
    mapper4.chrBankOffset[3]=0xC00;
    mapper4.chrBankOffset[4]=0x1000;
    mapper4.chrBankOffset[5]=0x1400;
    mapper4.chrBankOffset[6]=0x1800;
    mapper4.chrBankOffset[7]=0x1C00;
    mapper4.prgRam= new Array(0x2000);
  },

  step:function(){

    if (ppu.a12){

      mapper4.irqCounter--;
      ppu.a12=0;

      if(mapper4.irqReloadRequest){
        mapper4.irqCounter=mapper4.irqLatch;
        mapper4.irqReloadRequest=0;
      }

      if ((mapper4.irqCounter===-1)&&(mapper4.irqEnable)&&(!(cpu.interruptFlag()))){
        memory.writeWord((cpu.sp|0x100)-1, cpu.pc);
        cpu.sp=(cpu.sp-2)&0xFF;
        memory.writeByte(cpu.sp|0x100, cpu.sr|0x20);
        cpu.sp=(cpu.sp-1)&0xFF;
        cpu.pc=memory.readWord(memory.irqVector);
        mapper4.irqCounter=mapper4.irqLatch;
        cpu.setInterruptFlag();
        if(mapper4.intCycles===1){ppu.queuedIntCycles=21;}
        //console.log('MMC3 irq taken');
      }
    }
  },

};

export var mapperInit = function(mapper){
  memory.mapper=mapperMap[mapper];
  memory.mapper.init();
};

var mapperMap=[mapper0,mapper1,0,0,mapper4];
