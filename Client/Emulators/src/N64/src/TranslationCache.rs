extern crate libc;

use std::mem;
use std::marker;
use std::ops::{Index, IndexMut};

extern{
    fn memset(s: *mut libc::c_void, c: libc::uint32_t, n: libc::size_t) -> *mut libc::c_void;
}

pub struct TranslationCache {
    pub page : *mut u8
}

unsafe impl Send for TranslationCache {}
unsafe impl Sync for TranslationCache {}

const PAGE_SIZE: usize = 4096;

impl Index<usize> for TranslationCache {
    type Output = u8;

    fn index(&self, _index: usize) -> &u8 {
        unsafe {&*self.page.offset(_index as isize) }
    }
}

impl IndexMut<usize> for TranslationCache {
    fn index_mut(&mut self, _index: usize) -> &mut u8 {
        unsafe {&mut *self.page.offset(_index as isize) }
    }
}

impl TranslationCache {
    pub fn new(num_pages: usize) -> TranslationCache {
        let page : *mut u8;
        unsafe {
            let cache_size = num_pages * PAGE_SIZE;
            let mut _page : *mut libc::c_void = mem::uninitialized();
            libc::posix_memalign(&mut _page, PAGE_SIZE, cache_size);
            libc::mprotect(_page, cache_size, libc::PROT_EXEC | libc::PROT_READ | libc::PROT_WRITE);
            memset(_page, 0xC3, cache_size);
            page = mem::transmute(_page);
        }
        TranslationCache { page: page }
    }
}
