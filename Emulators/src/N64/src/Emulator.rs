use TranslationCache::TranslationCache;
use Interpreter::Interpreter;
use Emitter::Emitter;
use std::mem;

pub struct Emulator {
    pub ROM: Vec<u8>,
    pub jump_table: Vec<[u32;2]>,
    pub memory: [u8;0x1000],
    pub PC: u32,
    pub GPR: [u64;32],
    pub FPR: [u64;32],
    pub cp0: [u64;32],
    pub reg_map: [u64;64],
    pub TranslationCache: TranslationCache,
    pub Interpreter : Interpreter,
    pub Emitter : Emitter,
    pub ex_cache : Option<fn() -> u64>,
}

unsafe impl Send for Emulator {}
unsafe impl Sync for Emulator {}

impl Emulator {
    pub fn new() -> Emulator{
        Emulator {
            ROM: vec![],
            jump_table: vec![],
            memory: [0;0x1000],
            PC: 0,
            GPR: [0;32],
            FPR: [0;32],
            cp0: [0;32],
            reg_map: [0;64],
            TranslationCache: TranslationCache::new(1),
            Interpreter: Interpreter::new(),
            Emitter: Emitter::new(),
            ex_cache: None,
         }
    }

    pub fn run_block(&mut self) {
        if true { // if untranslated code at pc. This is always true for now

            //We'll Translate pif ROM Code Later

            //Emitter.emit(Interpreter.interpret(&self.PC, &self.ROM));
            // interpret MIPS code and store to TranslationCache

            //self.exCache = self.getFnPtr();
            // get pointer to newly re-dynareced function
            //may or may not be neccesary

            let test_func: Vec<u8> = vec![0x48, 0xC7, 0xC0, 0x18, 0x00, 0x00, 0x00, 0x48, 0xFF, 0xC0, 0xC3];
            //Moves 0x18 to RAX, Adds 1, and returns
            //assumes return value in RAX

            self.Emitter.emit(& test_func, &mut self.TranslationCache);
            //store test function in TranslationCache
        }
        self.ex_cache = Some(self.get_fn_ptr());
        println!("{:X}", (self.ex_cache.unwrap())());
        //run machine code, print return value, should be 25
    }

    pub fn get_fn_ptr(&mut self) -> (fn() -> u64) {
      unsafe { mem::transmute(self.TranslationCache.page) }
    }
}
