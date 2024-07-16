// const fs = require('fs');
// const ref = require('ref-napi');

//posix-semaphore.js is a JS wrapper for the same semaphores.h
//library used by this C++ counterpart.
const Semaphore = require('posix-semaphore')

const sem = new Semaphore('/vector_shm_sem')

//Wrapper using sem_wait(), which locks the thread until the semaphore is acquired.
console.log("Waiting for semaphore")
sem.acquire()
console.log("Semaphore acquired")
sem.release()
console.log("Semaphore released")
sem.close()
console.log("Semaphore closed")




