import {memory} from "./memory"

export var interrupt={

  step:function(){
    memory.mapper.irqStep();
  },
};
