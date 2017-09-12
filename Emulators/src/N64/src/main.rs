#[macro_use] extern crate nickel;
extern crate hyper;


use hyper::method::Method;
use nickel::{Nickel, StaticFilesHandler, HttpRouter};
use std::io::Read;
use std::sync::Arc;
use std::sync::RwLock;

mod Emulator;
mod TranslationCache;
mod Emitter;
mod Interpreter;

fn main() {

    let emulator = Arc::new(RwLock::new(Emulator::Emulator::new()));
    let mut server = Nickel::new();

    let emulator_rom = emulator.clone();
    server.add_route(Method::Post, "/sendRom", middleware!{|req|
        let mut emulator = emulator_rom.write().unwrap();
        req.origin.read_to_end(&mut emulator.ROM).unwrap();
    });

    let mut emulator_block = emulator.clone();
    server.add_route(Method::Get, "/runBlock", middleware!{
        let mut emulator = emulator_block.write().unwrap();
        emulator.run_block();
    });

    server.utilize(StaticFilesHandler::new("./Client"));
    server.listen("10.0.0.4:8080").unwrap();

}
