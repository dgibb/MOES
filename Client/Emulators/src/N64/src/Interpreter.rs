pub struct Interpreter {
    neededThisToCompile: bool,
}

impl Interpreter {
    pub fn new() -> Interpreter{
        Interpreter {
            neededThisToCompile: true,
        }
    }

    pub fn interpret(PC: &u32, ROM: &Vec<u8>) -> Vec<u8>{
        //todo
        //returns empty vec for now
        return vec![];
    }
}
