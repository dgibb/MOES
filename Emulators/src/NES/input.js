import {apu} from './apu'

export var input={

shiftRegisters1:[0,0,0,0,0,0,0,0],    //player1
strobe1:0,

shiftRegisters2:[0,0,0,0,0,0,0,0],    //player2
strobe2:0,

keyDown: function(e){
  switch(e.keyCode){
		case 65: input.shiftRegisters1[0] =1 ; break;//A
    case 83: input.shiftRegisters1[1] =1; break;//B
    case 38: input.shiftRegisters1[4] =1; break;//up
    case 40: input.shiftRegisters1[5] =1; break;//Down
    case 37: input.shiftRegisters1[6] =1; break;//Left
    case 39: input.shiftRegisters1[7] =1; break;//Right
    case 13: input.shiftRegisters1[3] =1; break;//Start
    case 16: input.shiftRegisters1[2] =1; break;//Select
	}
},

keyUp: function(e){
  switch(e.keyCode){
    case 65: input.shiftRegisters1[0] =0 ; break;//A
    case 83: input.shiftRegisters1[1] =0; break;//B
    case 38: input.shiftRegisters1[4] =0; break;//up
    case 40: input.shiftRegisters1[5] =0; break;//Down
    case 37: input.shiftRegisters1[6] =0; break;//Left
    case 39: input.shiftRegisters1[7] =0; break;//Right
    case 13: input.shiftRegisters1[3] =0; break;//Start
    case 16: input.shiftRegisters1[2] =0; break;//Select
  }
},

step: function(){
  if(apu.joypad1){
    input.strobe1=0;
  }

  if(apu.joypad2){
    input.strobe2=0;
  }
}

};
