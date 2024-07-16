#include <iostream>
#include <semaphore.h>
#include <cstring>
#include <fcntl.h>
#include <chrono>
#include <thread>

using namespace std;

//Acquire Lock
    /*  The sem_wait() function shall lock the semaphore referenced by
       sem by performing a semaphore lock operation on that semaphore.
       If the semaphore value is currently zero, then the calling thread
       shall not return from the call to sem_wait() until it either
       locks the semaphore or the call is interrupted by a signal.  */


int main(){

    cout << "Attempting to open semaphore" << endl;
    sem_t* sem = sem_open("/vector_shm_sem", O_CREAT, 0644, 1);
    if (sem == SEM_FAILED) {
        throw std::runtime_error("sem_open failed: " + std::string(strerror(errno)));
    }
    

        sem_wait(sem); // decrements by 1.
    if(errno == 1) throw std::runtime_error("Failed to acquire lock");
    cout <<"Lock acquired\nWaiting 5 Seconds." <<endl;
    std::this_thread::sleep_for(std::chrono::seconds(5));
    cout << "Releasing Lock" << endl;
    //Release Lock
    sem_post(sem); // increments by 1.
    cout << "Lock Released" << endl;
    return 0;
}