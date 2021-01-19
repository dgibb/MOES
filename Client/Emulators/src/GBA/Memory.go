package emulator

import (
  "fmt"
  "encoding/binary"
)

func readWord(address uint32) uint32 {

  switch (address&0xFF000000) {
    case 0x00000000:
      if (address<0x00004000){
        fmt.Println("memory.readWord: illegal access to BIOS requested")
        return 0
      } else {
        fmt.Println("memory.readWord: Invaid Address")
        return 0
      }

    case 0x01000000:
      fmt.Println("memory.readWord: Invaid Address")
      return 0

    case 0x02000000:
      if (address<0x02040000){
        address -= 0x02000000
        data := binary.LittleEndian.Uint32(WRAM_256[(address):(address+4)])
        return data
      } else {
        fmt.Println("memory.readWord: Invaid Address")
        return 0
      }

    case 0x03000000:
      if (address<0x03008000){
        address -= 0x03000000
        data := binary.LittleEndian.Uint32(WRAM_32[(address):(address+4)])
        return data
      } else {
        fmt.Println("memory.readWord: Invaid Address")
        return 0
      }

    case 0x04000000:
      if (address<0x04000400){
        address -= 0x04000000
        data := binary.LittleEndian.Uint32(IO_Reg[(address):(address+4)])
        return data
      } else {
        fmt.Println("memory.readWord: Invaid Address")
        return 0
      }

    case 0x05000000:
      if (address<0x05000400){
        address -= 0x05000000
        data := binary.LittleEndian.Uint32(Pallete_Ram[(address):(address+4)])
        return data
      } else {
        fmt.Println("memory.readWord: Invaid Address")
        return 0
      }

    case 0x06000000:
      if (address<0x06018000){
        address -= 0x06000000
        data := binary.LittleEndian.Uint32(Video_Ram[(address):(address+4)])
        return data
      } else {
        fmt.Println("memory.readWord: Invaid Address")
        return 0
      }

    case 0x07000000:
      if (address<0x07000400){
        address -= 0x07000000
        data := binary.LittleEndian.Uint32(OAM[(address):(address+4)])
        return data
      } else {
        fmt.Println("memory.readWord: Invaid Address")
        return 0
      }

    case 0x08000000, 0x09000000:
        address -= 0x08000000
        data := binary.LittleEndian.Uint32(ROM[(address):(address+4)])
        return data

    default:
      fmt.Println("memory.readWord: Invaid Address")
      return 0

  }
}

func writeWord(address uint32, data uint32){

  switch (address&0xFF000000) {
    case 0x00000000:
      if (address<0x00004000){
        fmt.Println("memory.readWord: illegal access to BIOS requested")
      } else {
        fmt.Println("memory.readWord: Invaid Address")
      }

    case 0x01000000:
      fmt.Println("memory.readWord: Invaid Address")

    case 0x02000000:
      if (address<0x02040000){
        address -= 0x02000000
        binary.LittleEndian.PutUint32(WRAM_256[(address):(address+4)], data)
      } else {
        fmt.Println("memory.readWord: Invaid Address")
      }

    case 0x03000000:
      if (address<0x03008000){
        address -= 0x03000000
        binary.LittleEndian.PutUint32(WRAM_32[(address):(address+4)], data)
      } else {
        fmt.Println("memory.readWord: Invaid Address")
      }

    case 0x04000000:
      if (address<0x04000400){
        address -= 0x04000000
        binary.LittleEndian.PutUint32(IO_Reg[(address):(address+4)], data)
      } else {
        fmt.Println("memory.readWord: Invaid Address")
      }

    case 0x05000000:
      if (address<0x05000400){
        address -= 0x05000000
        binary.LittleEndian.PutUint32(Pallete_Ram[(address):(address+4)], data)
      } else {
        fmt.Println("memory.readWord: Invaid Address")
      }

    case 0x06000000:
      if (address<0x06018000){
        address -= 0x06000000
        binary.LittleEndian.PutUint32(Video_Ram[(address):(address+4)], data)
      } else {
        fmt.Println("memory.readWord: Invaid Address")
      }

    case 0x07000000:
      if (address<0x07000400){
        address -= 0x07000000
        binary.LittleEndian.PutUint32(OAM[(address):(address+4)], data)
      } else {
        fmt.Println("memory.readWord: Invaid Address")
      }

    default:
      fmt.Println("memory.readWord: Invaid Address")

  }
}
