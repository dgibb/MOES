package emulator

import (
  "fmt"
)

/*-------------------------------------------------//
//----Data Structures & hardware Implementation----//
//-------------------------------------------------*/

var inst_length uint32

type cpu struct {
  R [16]*uint32
  CPSR uint32
  SPSR *uint32
  Pipeline *Pipeline
  Fetch_reg uint32 // IF pipeline register, contains fetched, undecoded instruction
  Decode_reg instruction // ID pipeline register, contains decoded instruction
  Branch_Flag bool
}

type Pipeline struct {
  Instruction_Fetch func()
  Instruction_Decode func()
  Instruction_Execute func()
}

type registers struct {
  r0 uint32
  r1 uint32
  r2 uint32
  r3 uint32
  r4 uint32
  r5 uint32
  r6 uint32
  r7 uint32
  r8 uint32
  r9 uint32
  r10 uint32
  r11 uint32
  r12 uint32
  r13 uint32
  r14 uint32
  r15 uint32
  r8_fiq uint32
  r9_fiq uint32
  r10_fiq uint32
  r11_fiq uint32
  r12_fiq uint32
  r13_fiq uint32
  r14_fiq uint32
  r13_svc uint32
  r14_svc uint32
  r13_abt uint32
  r14_abt uint32
  r13_irq uint32
  r14_irq uint32
  r13_und uint32
  r14_und uint32
  SPSR_fiq uint32
  SPSR_svc uint32
  SPSR_abt uint32
  SPSR_irq uint32
  SPSR_und uint32
}

type instruction struct {
  Condition uint8
  Function func()
  Address uint32
  Offset uint32
  op1 *uint32
  op2 *uint32
  op1I uint32
  op2I uint32
  Dest_reg *uint32
  carry bool
}

/*--------------------------//
//----Cpu Pipeline Logic----//
//--------------------------*/

func Clock_Tick() {
  Cpu.Pipeline.Instruction_Execute()
  Cpu.Pipeline.Instruction_Decode()
  Cpu.Pipeline.Instruction_Fetch()
  fmt.Println("---------------------------------------------")
}

/*---------------------//
//----Cpu ARM Logic----//
//---------------------*/

func ARM_Instruction_Fetch() {

  Cpu.Fetch_reg = readWord(*(Cpu.R[15]))
  fmt.Printf("IF: fetched %X from %X\n", Cpu.Fetch_reg, *(Cpu.R[15]))
  *(Cpu.R[15]) += inst_length
}

func lli() bool {
  var val uint32 = *(Cpu.R[Cpu.Fetch_reg&0xF])
  var shift uint32 = (Cpu.Fetch_reg>>7)&0x1F
  Cpu.Decode_reg.op2I = val<<(shift-1)
  var carry bool = (Cpu.Decode_reg.op2I&0x80000000)!=0
  Cpu.Decode_reg.op2I <<= 1
  return carry
}

func llr() bool {
  var val uint32 = *(Cpu.R[Cpu.Fetch_reg&0xF])
  var shift uint32 =  (*(Cpu.R[(Cpu.Fetch_reg>>8)&0xF]))&0xF
  Cpu.Decode_reg.op2I = val<<(shift-1)
  var carry bool = (Cpu.Decode_reg.op2I&0x80000001)!=0
  Cpu.Decode_reg.op2I <<= 1
  return carry
}

func lri() bool {
  var val uint32 = *(Cpu.R[Cpu.Fetch_reg&0xF])
  var shift uint32 = (Cpu.Fetch_reg>>7)&0x1F
  Cpu.Decode_reg.op2I = val>>(shift-1)
  var carry bool = (Cpu.Decode_reg.op2I&0x00000001)!=0
  Cpu.Decode_reg.op2I >>= 1
  return carry
}

func lrr() bool {
  var val uint32 = *(Cpu.R[Cpu.Fetch_reg&0xF])
  var shift uint32 =  (*(Cpu.R[(Cpu.Fetch_reg>>8)&0xF]))&0xF
  Cpu.Decode_reg.op2I = val<<(shift-1)
  var carry bool = (Cpu.Decode_reg.op2I&0x00000001)!=0
  Cpu.Decode_reg.op2I <<= 1
  return carry
}

func ari() bool {
  Cpu.Decode_reg.op2I = *(Cpu.R[Cpu.Fetch_reg&0xF])
  var shift uint32 = (Cpu.Fetch_reg>>7)&0x1F
  var signExtend uint32 = Cpu.Decode_reg.op2I&0x80000000
  var i uint32 = 0
  for i<(shift-1){
    Cpu.Decode_reg.op2I >>= 1
    Cpu.Decode_reg.op2I&=0x7FFFFFFF
    Cpu.Decode_reg.op2I|=signExtend
    i++
  }
  var carry bool = (Cpu.Decode_reg.op2I&0x00000001)!=0
  Cpu.Decode_reg.op2I >>= 1
  return carry
}

func arr() bool {
  Cpu.Decode_reg.op2I = *(Cpu.R[Cpu.Fetch_reg&0xF])
  var shift uint32 =  (*(Cpu.R[(Cpu.Fetch_reg>>8)&0xF]))&0xF
  var signExtend uint32 = Cpu.Decode_reg.op2I&0x80000000
  var i uint32 = 0
    for i<(shift-1){
    Cpu.Decode_reg.op2I >>= 1
    Cpu.Decode_reg.op2I&=0x7FFFFFFF
    Cpu.Decode_reg.op2I|=signExtend
    i++
  }
  var carry bool = (Cpu.Decode_reg.op2I&0x00000001)!=0
  Cpu.Decode_reg.op2I >>= 1
  return carry
}

func rri() bool {
  Cpu.Decode_reg.op2I = *(Cpu.R[Cpu.Fetch_reg&0xF])
  var shift uint32 = (Cpu.Fetch_reg>>7)&0x1F
  var i uint32 = 0
    for i<(shift-1){
    var signExtend uint32 = Cpu.Decode_reg.op2I&0x80000000
    Cpu.Decode_reg.op2I >>= 1
    Cpu.Decode_reg.op2I&=0x7FFFFFFF
    Cpu.Decode_reg.op2I|=signExtend
    i++
  }
  var carry bool = (Cpu.Decode_reg.op2I&0x00000001)!=0
  var signExtend = Cpu.Decode_reg.op2I&0x80000000
  Cpu.Decode_reg.op2I >>= 1
  Cpu.Decode_reg.op2I&=0x7FFFFFFF
  Cpu.Decode_reg.op2I|=signExtend
  return carry
}

func rrr() bool {
  Cpu.Decode_reg.op2I = *(Cpu.R[Cpu.Fetch_reg&0xF])
  var shift uint32 =  (*(Cpu.R[(Cpu.Fetch_reg>>8)&0xF]))&0xF
  var i uint32 = 0
  for i<(shift-1){
    var signExtend uint32 = Cpu.Decode_reg.op2I&0x80000000
    Cpu.Decode_reg.op2I >>= 1
    Cpu.Decode_reg.op2I&=0x7FFFFFFF
    Cpu.Decode_reg.op2I|=signExtend
    i++
  }
  var carry bool = (Cpu.Decode_reg.op2I&0x00000001)!=0
  var signExtend uint32 = Cpu.Decode_reg.op2I&0x80000000
  Cpu.Decode_reg.op2I >>= 1
  Cpu.Decode_reg.op2I&=0x7FFFFFFF
  Cpu.Decode_reg.op2I|=signExtend
  return carry
}

func ARM_Instruction_Decode() {

    Cpu.Decode_reg.Condition=uint8(Cpu.Fetch_reg>>28)

    switch (Cpu.Fetch_reg&0x0E000000) {

      case 0x00000000:

        var inst uint32 = ((Cpu.Fetch_reg>>4)&0xF)|((Cpu.Fetch_reg>>16)&0x0FF0)

        switch(inst){

          case 0x000:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            Cpu.Decode_reg.carry = lli()

          case 0x001:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            llr()

          case 0x002:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            lri()

          case 0x003:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            lrr()

          case 0x004:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            ari()

          case 0x005:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            arr()

            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            rri()

          case 0x007:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            rrr()

          case 0x008:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            lli()

          case 0x009:
            Cpu.Decode_reg.Function=MUL
            // To Do

          case 0x00A:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            lri()

          case 0x00B:
            Cpu.Decode_reg.Function=STRH
            // To Do

          case 0x00C:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            ari()

          case 0x00D:
            Cpu.Decode_reg.Function=LDRD
            //To Do

          case 0x00E:
            Cpu.Decode_reg.Function=AND
            Cpu.Decode_reg.op1 = Cpu.R[((Cpu.Fetch_reg>>16)&0xF)]
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            rri()

          case 0x00F:
            Cpu.Decode_reg.Function=STRD
            // To Do

          case 0x120:
            Cpu.Decode_reg.Function=MSRC
            Cpu.Decode_reg.Dest_reg = &Cpu.CPSR
            Cpu.Decode_reg.op2 = Cpu.R[(Cpu.Fetch_reg&0xF)]

        }

      case 0x02000000, 0x04000000:

        fmt.Println("ID: reached 0x02 + 0x04 block")

        switch(Cpu.Fetch_reg&0x0FF00000) {

          case 0x02000000:
            fmt.Printf("ID: AND immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02100000:
            fmt.Printf("ID: ANDS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02200000:
            fmt.Printf("ID: EOR immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02300000:
            fmt.Printf("ID: EORS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02400000:
            fmt.Printf("ID: SUB immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02500000:
            fmt.Printf("ID: SUBS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02600000:
            fmt.Printf("ID: RSB immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02700000:
            fmt.Printf("ID: RSBS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02800000:
            fmt.Printf("ID: ADD immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02900000:
            fmt.Printf("ID: ADDS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02A00000:
            fmt.Printf("ID: ADC immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02B00000:
            fmt.Printf("ID: ADCS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02C00000:
            fmt.Printf("ID: SBC immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02D00000:
            fmt.Printf("ID: SBCS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02E00000:
            fmt.Printf("ID: RSC immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x02F00000:
            fmt.Printf("ID: RSCS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03000000:
            fmt.Printf("ID: TST immediate,  results trashed no flags, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03100000:
            fmt.Printf("ID: TSTS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03200000:
            if((Cpu.Fetch_reg&0x000FF000)==0x008F000){
              fmt.Printf("ID: MSR,  unimplemented, inserting NOP\n")
              Cpu.Decode_reg.Function=NOP
            } else {
              fmt.Printf("ID: TEQ immediate,  results trashed no flags, inserting NOP\n")
              Cpu.Decode_reg.Function=NOP
            }

          case 0x03300000:
            fmt.Printf("ID: TEQS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03400000:
            fmt.Printf("ID: CMP immediate,  results trashed no flags, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03500000:
            fmt.Printf("ID: CMPS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03600000:
            if((Cpu.Fetch_reg&0x000FF000)==0x008F000){
              fmt.Printf("ID: MSR,  unimplemented, inserting NOP\n")
              Cpu.Decode_reg.Function=NOP
            } else {
              fmt.Printf("ID: CMN immediate,  results trashed no flags, inserting NOP\n")
              Cpu.Decode_reg.Function=NOP
            }

          case 0x03700000:
            fmt.Printf("ID: CMNS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03800000:
            fmt.Printf("ID: ORR immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03900000:
            fmt.Printf("ID: ORRS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03A00000:

            Cpu.Decode_reg.Function = MOV
            Cpu.Decode_reg.Dest_reg = Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            Cpu.Decode_reg.op2I = (Cpu.Fetch_reg&0xFF)<<((Cpu.Fetch_reg>>8)&0xF)
            fmt.Printf("ID: MOV immediate, rD=Cpu.R[%v], op2I = %X \n",((Cpu.Fetch_reg>>12)&0xF), Cpu.Decode_reg.op2I)

          case 0x03B00000:
            fmt.Printf("ID: MOVS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03C00000:
            fmt.Printf("ID: BIC immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03D00000:
            fmt.Printf("ID: BICS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03E00000:
            fmt.Printf("ID: MVN immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x03F00000:
            fmt.Printf("ID: MVNS immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04000000:
            fmt.Printf("ID: STR immediate post dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04100000:
            fmt.Printf("ID: LDR immediate post dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04200000:
            fmt.Printf("ID: STR from user immediate post dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04300000:
            fmt.Printf("ID: LDR to user immediate post dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04400000:
            fmt.Printf("ID: STR byte immediate post dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04500000:
            fmt.Printf("ID: LDR byte immediate post dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04600000:
            fmt.Printf("ID: STR byte from user immediate post dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04700000:
            fmt.Printf("ID: LDR byte to user immediate post dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04800000:
            fmt.Printf("ID: STR immediate post inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04900000:
            fmt.Printf("ID: LDR immediate post inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04A00000:
            fmt.Printf("ID: STR from user immediate post inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04B00000:
            fmt.Printf("ID: LDR to user immediate post inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04C00000:
              fmt.Printf("ID: STR byte immediate post inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04D00000:
            fmt.Printf("ID: LDR byte immediate post inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04E00000:
            fmt.Printf("ID: STR byte from user immediate post inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x04F00000:
              fmt.Printf("ID: LDR byte to user immediate post inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05000000:
            fmt.Printf("ID: STR negative immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05100000:
            fmt.Printf("ID: LDR negative immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05200000:
            fmt.Printf("ID: STR immediate pre dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05300000:
            fmt.Printf("ID: LDR immediate pre dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05400000:
            fmt.Printf("ID: STR byte negative immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05500000:
            fmt.Printf("ID: LDR byte negative immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05600000:
            fmt.Printf("ID: STR byte immediate pre dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05700000:
            fmt.Printf("ID: LDR byte immediate pre dec,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05800000:
            Cpu.Decode_reg.Function=STR
            Cpu.Decode_reg.op2=Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            Cpu.Decode_reg.Address=*(Cpu.R[((Cpu.Fetch_reg>>16)&0xF)])+(Cpu.Fetch_reg&0xFFF)
            fmt.Printf("ID: STR immediate offset, src_Reg=Cpu.R[%v], address = %X \n", ((Cpu.Fetch_reg>>12)&0xF), Cpu.Decode_reg.Address)

          case 0x05900000:
            Cpu.Decode_reg.Function=LDR
            Cpu.Decode_reg.Dest_reg=Cpu.R[((Cpu.Fetch_reg>>12)&0xF)]
            Cpu.Decode_reg.Address=*(Cpu.R[((Cpu.Fetch_reg>>16)&0xF)])+(Cpu.Fetch_reg&0xFFF)
            fmt.Printf("ID: LDR immediate offset, rD=Cpu.R[%v], address = %X \n", ((Cpu.Fetch_reg>>12)&0xF), Cpu.Decode_reg.Address)

          case 0x05A00000:
            fmt.Printf("ID: STR from user immediate pre inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function = NOP

          case 0x05B00000:
            fmt.Printf("ID: LDR to user immediate pre inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05C00000:
              fmt.Printf("ID: STR byte positive immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05D00000:
            fmt.Printf("ID: LDR byte positive immediate,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05E00000:
            fmt.Printf("ID: STR byte from user immediate pre inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP

          case 0x05F00000:
              fmt.Printf("ID: LDR byte to user immediate pre inc,  unimplemented, inserting NOP\n")
            Cpu.Decode_reg.Function=NOP
        }

      case 0x06000000:
        if((Cpu.Fetch_reg&0x00000010)!=0){
          fmt.Printf("ID: Invalid/undefined instruction, inserting NOP\n")
        } else {
          //LDR/STR Do This Later
        }

      case 0x08000000:

      case 0x0A000000:
        if((Cpu.Fetch_reg&0x01000000)!=0){
          Cpu.Decode_reg.Function=BL
          Cpu.Decode_reg.Offset=(offsetCalc(Cpu.Fetch_reg & 0x00FFFFFF))
        }else{
          Cpu.Decode_reg.Function=B
          Cpu.Decode_reg.Offset=(offsetCalc(Cpu.Fetch_reg & 0x00FFFFFF))
          fmt.Printf("ID: Decoded Branch Correctly\n")
        }

      case 0x0C000000:
        fmt.Printf("ID: coprocessor instruction, inserting NOP\n")
        Cpu.Decode_reg.Function=NOP

        if((Cpu.Fetch_reg&0x01000000)!=0){
          fmt.Printf("ID: software interrupt, inserting NOP\n")
        } else {
          fmt.Printf("ID: coprocessor instruction, inserting NOP\n")
        }

    }
}

func ARM_Instruction_Execute() {
    if (eval_condition(Cpu.Decode_reg.Condition)){
    fmt.Printf("EX: condition passed, Executing " )
    Cpu.Decode_reg.Function();
  } else {
    fmt.Println("EX: condition failed, not executing instruction" )
  }
}

func eval_condition(condition uint8) bool {
  switch (condition) {

    case 0:
      return (Cpu.CPSR&0x40000000)!=0

    case 1:
      return !((Cpu.CPSR&0x40000000)!=0)

    case 2:
      return (Cpu.CPSR&0x20000000)!=0

    case 3:
      return !((Cpu.CPSR&0x20000000)!=0)

    case 4:
      return (Cpu.CPSR&0x80000000)!=0

    case 5:
      return !((Cpu.CPSR&0x80000000)!=0)

    case 6:
      return (Cpu.CPSR&0x10000000)!=0

    case 7:
      return !((Cpu.CPSR&0x10000000)!=0)

    case 8:
      return ((Cpu.CPSR&0x30000000)==0x20000000)

    case 9:
      return (((Cpu.CPSR&0x20000000)==0)||(Cpu.CPSR&0x40000000!=0))

    case 10:
      return ((Cpu.CPSR&0x80000000)>>3)==(Cpu.CPSR&0x10000000)

    case 11:
      return ((Cpu.CPSR&0x80000000)>>3)!=(Cpu.CPSR&0x10000000)

    case 12:
      return (((Cpu.CPSR&0x80000000)>>3)==(Cpu.CPSR&0x10000000))&&((Cpu.CPSR&0x40000000)==0)

    case 13:
      return (((Cpu.CPSR&0x80000000)>>3)!=(Cpu.CPSR&0x10000000))||((Cpu.CPSR&0x40000000)!=0)

    case 14:
      return true

    default:
      fmt.Println("EX: illegal Condition code 0xF")
      return false

  }
}

/*-----------------------//
//----Cpu Thumb Logic----//
//-----------------------*/

func Thumb_Instruction_Fetch() {
    if (Cpu.Branch_Flag){
      Cpu.Fetch_reg=0xE3000000
      Cpu.Branch_Flag=false
    } else {
      Cpu.Fetch_reg = readWord(*(Cpu.R[15]))
    }
    fmt.Printf("IF: fetched %X\n", Cpu.Fetch_reg )
}

func Thumb_Instruction_Decode() {
  //Do nothing yet
}

func Thumb_Instruction_Execute() {
    if (eval_condition(Cpu.Decode_reg.Condition)){
    fmt.Printf("EX: condition passed, Executing " )
    Cpu.Decode_reg.Function();
  } else {
    fmt.Println("EX: condition failed, not executing instruction" )
  }
}


/*--------------------------//
//---Cpu Helper Functions---//
//--------------------------*/

func offsetCalc(offset uint32) uint32{
  if ((offset&0x00800000)!=0){
    offset = offset|0xFF000000
    offset = ^offset
    offset +=1
  }
  offset<<=2
  fmt.Printf("offsetCalc: result = %X \n", offset)
  return offset
}

/*----------------------//
//---Arm instructions---//
//----------------------*/

var skip = func(){
  fmt.Println("skip")
}

var NOP = func(){
  fmt.Println("NOP")
}

var B = func (){  //Branch
  fmt.Println("Branch")
  fmt.Printf("%X + %X = %X \n", *(Cpu.R[15]), Cpu.Decode_reg.Offset, *(Cpu.R[15])+Cpu.Decode_reg.Offset )
  *(Cpu.R[15]) += Cpu.Decode_reg.Offset
  Cpu.Pipeline.Instruction_Fetch()
}

var BL = func (){  //Branch and Link
  fmt.Println("Branch and Link")
  *(Cpu.R[14]) = *(Cpu.R[15])
  *(Cpu.R[15]) += Cpu.Decode_reg.Offset
  Cpu.Decode_reg.Function = NOP
  Cpu.Fetch_reg=0xE1A00000
  Cpu.Branch_Flag=true;
}


var AND = func (){  //And
  fmt.Println("AND")
  *(Cpu.Decode_reg.Dest_reg) = (*(Cpu.Decode_reg.op1))&Cpu.Decode_reg.op2I
}

var MOV = func(){
  fmt.Println("MOV")
  *(Cpu.Decode_reg.Dest_reg) = Cpu.Decode_reg.op2I
}

var LDR = func (){
  fmt.Println("Load Register (LDR)")
  *(Cpu.Decode_reg.Dest_reg)=readWord(Cpu.Decode_reg.Address)
}

var STR = func (){
  fmt.Println("Store Register (STR)")
  writeWord(Cpu.Decode_reg.Address, *(Cpu.Decode_reg.op2))
}

var LDRD = func (){
  fmt.Println("Load Register Double Word ")
}

var STRD = func (){
  fmt.Println("Store Register Double Word")
}

var LDRH = func (){
  fmt.Println("Load Register Halfword")
}

var STRH = func (){
  fmt.Println("Store Register Halfword")
}

var LDRB = func (){
  fmt.Println("Load Register Byte")
}

var STRB = func (){
  fmt.Println("Store Register Byte")
}

var MSRC = func(){
  fmt.Println("MSR CPSR")
  *Cpu.Decode_reg.Dest_reg = *(Cpu.Decode_reg.op1)
  switch (Cpu.CPSR&0x1F){

  case 0x10:
    fmt.Println("entered User mode, This was probably not supposed to happen")
    Cpu.R[8]=&(Registers.r8)
    Cpu.R[9]=&(Registers.r9)
    Cpu.R[10]=&(Registers.r10)
    Cpu.R[11]=&(Registers.r11)
    Cpu.R[12]=&(Registers.r12)
    Cpu.R[13]=&(Registers.r13)
    Cpu.R[14]=&(Registers.r14)
    Cpu.SPSR=&(Registers.SPSR_und) //Should never be accessed, User and undefined mode should never be entered

  case 0x11:
    fmt.Println("entered FIQ mode")
    Cpu.R[8]=&(Registers.r8_fiq)
    Cpu.R[9]=&(Registers.r9_fiq)
    Cpu.R[10]=&(Registers.r10_fiq)
    Cpu.R[11]=&(Registers.r11_fiq)
    Cpu.R[12]=&(Registers.r12_fiq)
    Cpu.R[13]=&(Registers.r13_fiq)
    Cpu.R[14]=&(Registers.r14_fiq)
    Cpu.SPSR=&(Registers.SPSR_fiq)

  case 0x12:
    fmt.Println("entered IRQ mode")
    Cpu.R[8]=&(Registers.r8)
    Cpu.R[9]=&(Registers.r9)
    Cpu.R[10]=&(Registers.r10)
    Cpu.R[11]=&(Registers.r11)
    Cpu.R[12]=&(Registers.r12)
    Cpu.R[13]=&(Registers.r13_irq)
    Cpu.R[14]=&(Registers.r14_irq)
    Cpu.SPSR=&(Registers.SPSR_irq)

  case 0x13:
    fmt.Println("entered Super Visor mode")
    Cpu.R[8]=&(Registers.r8)
    Cpu.R[9]=&(Registers.r9)
    Cpu.R[10]=&(Registers.r10)
    Cpu.R[11]=&(Registers.r11)
    Cpu.R[12]=&(Registers.r12)
    Cpu.R[13]=&(Registers.r13_svc)
    Cpu.R[14]=&(Registers.r14_svc)
    Cpu.SPSR=&(Registers.SPSR_svc)

  case 0x17:
    fmt.Println("entered Abort mode, This was probably not supposed to happen")
    Cpu.R[8]=&(Registers.r8)
    Cpu.R[9]=&(Registers.r9)
    Cpu.R[10]=&(Registers.r10)
    Cpu.R[11]=&(Registers.r11)
    Cpu.R[12]=&(Registers.r12)
    Cpu.R[13]=&(Registers.r13_abt)
    Cpu.R[14]=&(Registers.r14_abt)
    Cpu.SPSR=&(Registers.SPSR_abt)

  case 0x1B:
    fmt.Println("entered Undefined mode, This was probably not supposed to happen")
    Cpu.R[8]=&(Registers.r8)
    Cpu.R[9]=&(Registers.r9)
    Cpu.R[10]=&(Registers.r10)
    Cpu.R[11]=&(Registers.r11)
    Cpu.R[12]=&(Registers.r12)
    Cpu.R[13]=&(Registers.r13_und)
    Cpu.R[14]=&(Registers.r14_und)
    Cpu.SPSR=&(Registers.SPSR_und)

  case 0x1F:
    fmt.Println("entered System mode")
    Cpu.R[8]=&(Registers.r8)
    Cpu.R[9]=&(Registers.r9)
    Cpu.R[10]=&(Registers.r10)
    Cpu.R[11]=&(Registers.r11)
    Cpu.R[12]=&(Registers.r12)
    Cpu.R[13]=&(Registers.r13)
    Cpu.R[14]=&(Registers.r14)
    Cpu.SPSR=&(Registers.SPSR_und) //Should never be accessed, undefined mode should never be entered
  }
}

var MUL = func(){
  fmt.Println("MUL")
}

/*------------------------//
//---Thumb Instructions---//
//------------------------*/
