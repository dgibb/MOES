package emulator

/*---------------//
//------CPU------//
//---------------*/

var Registers registers
var Cpu cpu
var ARM_Pipeline Pipeline
var Thumb_Pipeline Pipeline

/*------------------//
//------MEMORY------//
//------------------*/

var ROM []uint8
var WRAM_256 []uint8
var WRAM_32 []uint8
var IO_Reg []uint8
var Pallete_Ram []uint8
var Video_Ram []uint8
var OAM []uint8

/*--------------------------//
//------Initialization------//
//--------------------------*/

func init() {
  inst_length = 4
  registerInit()
  pipelineInit()
  cpuInit()
}

func Reset() {
  inst_length = 4
  registerInit()
  cpuInit()
}

func registerInit(){
  Registers.r0 = 0
  Registers.r1 = 0
  Registers.r2 = 0
  Registers.r3 = 0
  Registers.r4 = 0
  Registers.r5 = 0
  Registers.r6 = 0
  Registers.r7 = 0
  Registers.r8 = 0
  Registers.r9 = 0
  Registers.r10 = 0
  Registers.r11 = 0
  Registers.r12 = 0
  Registers.r13 = 0
  Registers.r14 = 0
  Registers.r15 = 0x08000000
  Registers.r8_fiq = 0
  Registers.r9_fiq = 0
  Registers.r10_fiq = 0
  Registers.r11_fiq = 0
  Registers.r12_fiq = 0
  Registers.r13_fiq = 0
  Registers.r14_fiq = 0
  Registers.r13_svc = 0
  Registers.r14_svc = 0
  Registers.r13_abt = 0
  Registers.r14_abt = 0
  Registers.r13_irq = 0
  Registers.r14_irq = 0
  Registers.r13_und = 0
  Registers.r14_und = 0
  Registers.SPSR_fiq = 0
  Registers.SPSR_svc = 0
  Registers.SPSR_abt = 0
  Registers.SPSR_irq = 0
  Registers.SPSR_und = 0
}

func cpuInit(){
  Cpu.R[0] = &(Registers.r0)
  Cpu.R[1] = &(Registers.r1)
  Cpu.R[2] = &(Registers.r2)
  Cpu.R[3] = &(Registers.r3)
  Cpu.R[4] = &(Registers.r4)
  Cpu.R[5] = &(Registers.r5)
  Cpu.R[6] = &(Registers.r6)
  Cpu.R[7] = &(Registers.r7)
  Cpu.R[8] = &(Registers.r8)
  Cpu.R[9] = &(Registers.r9)
  Cpu.R[10] = &(Registers.r10)
  Cpu.R[11] = &(Registers.r11)
  Cpu.R[12] = &(Registers.r12)
  Cpu.R[13] = &(Registers.r13_svc)
  Cpu.R[14] = &(Registers.r14_svc)
  Cpu.R[15] = &(Registers.r15)
  Cpu.CPSR = 0x000000D3
  Cpu.SPSR = &(Registers.SPSR_svc)
  Cpu.Decode_reg.Function = skip
  Cpu.Decode_reg.Condition = 0x0E
  Cpu.Pipeline = &ARM_Pipeline
}

func pipelineInit(){
  ARM_Pipeline.Instruction_Fetch = ARM_Instruction_Fetch
  ARM_Pipeline.Instruction_Decode = ARM_Instruction_Decode
  ARM_Pipeline.Instruction_Execute = ARM_Instruction_Execute
  Thumb_Pipeline.Instruction_Fetch = Thumb_Instruction_Fetch
  Thumb_Pipeline.Instruction_Decode = Thumb_Instruction_Decode
  Thumb_Pipeline.Instruction_Execute = Thumb_Instruction_Execute
}
