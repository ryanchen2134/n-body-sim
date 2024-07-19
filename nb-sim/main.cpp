/**
 * @file main.cpp
 * @brief This file contains the main function for the n-body simulation program.
 * The program simulates the motion of mass objects in a 3D space using the n-body simulation algorithm.
 * It creates a shared memory region to store the simulation data and uses a semaphore for synchronization.
 * The simulation runs in an infinite loop, updating the positions and velocities of the mass objects in each frame.
 * The user can specify the time interval between frames.
 */
#include <iostream>
#include <vector>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>
#include <cstring>
#include <stdexcept>
#include <thread>
#include <chrono>
#include <atomic>
#include <semaphore.h>
#include <signal.h>
#include "MassObject.hpp"
#include "utilities.hpp"

//Reliance on Global Variables for resource management operations solely for ease of cleanup

//Semaphore (Mutex)
sem_t* SEM = nullptr;
constexpr char* SEM_NAME = "/sim_semaphore";
//SHared Memory
void* SHM_PTR = nullptr;
constexpr char* SHM_NAME = "/vector_shared_memory";
size_t SHM_SIZE = 0;

void* alloc_shm_space();
void cleanup();
void signal_handler(int signum);
double get_user_time_interval();

struct Metadata {
    size_t object_count;
    std::atomic<size_t> frame;
};


/**
 * @brief The main function of the program.
 * 
 * This function is the entry point of the program. It sets up a signal handler for SIGINT,
 * creates a semaphore, initializes mass objects, allocates shared memory space, and starts
 * the simulation loop. The simulation loop runs indefinitely, updating the object states,
 * incrementing the frame count, and printing the object states. The loop can be interrupted
 * by pressing Ctrl+C.
 * 
 * @return 0 indicating successful execution of the program.
 */
int main() {
    signal(SIGINT, signal_handler);

    SEM = sem_open(SEM_NAME, O_CREAT, 0644, 1);
    if (SEM == SEM_FAILED) {
        throw std::runtime_error("Failed to create semaphore");
    }

    double time_interval = get_user_time_interval(); //given by user input
    

    MassObject a(10000, {1, 0, 0}, {0, 0, 0}, time_interval);
    MassObject b(10000, {-1, 0, 0}, {0, 0, 0});
    MassObject c(10000, {0, 0, 0}, {0, 0, 0});

    const size_t object_count = MassObject::objects.size();
    const size_t header_size = sizeof(Metadata) + sizeof(double) * object_count;
    const size_t frame_size = object_count * sizeof(double) * 6;
    SHM_SIZE = header_size + frame_size;
    SHM_PTR = alloc_shm_space();

    std::cout << "Shared memory created and mapped successfully." << std::endl;


    //Memory Structure Begins Here
    Metadata* metadata = static_cast<Metadata*>(SHM_PTR);
              metadata->object_count = object_count;
              metadata->frame = 1;

    double* data_ptr = reinterpret_cast<double*>(reinterpret_cast<uint8_t*>(SHM_PTR) + header_size);

    //Copy Masses
    for (size_t i = 0; i < object_count; ++i) {
        memcpy(reinterpret_cast<uint8_t*>(SHM_PTR) + sizeof(Metadata) + i * sizeof(double), &MassObject::objects[i].mass, sizeof(double));
    }

    
    //Begin Simulation Code

    print_object_state_all();
    while(true) {
        std::cout << "Frame: " << metadata->frame << std:: endl;
        run_one_frame();
        sem_wait(SEM);
        ++metadata->frame;
        for (size_t i = 0; i < object_count; ++i) {
            memcpy(reinterpret_cast<uint8_t*>(data_ptr) + i * 6 * sizeof(double), MassObject::objects[i].position.data(), 3 * sizeof(double));
            memcpy(reinterpret_cast<uint8_t*>(data_ptr) + i * 6 * sizeof(double) + 3 * sizeof(double), MassObject::objects[i].velocity.data(), 3 * sizeof(double));
        }
        sem_post(SEM);
        print_object_state_all();
    }

    cleanup();
    return 0;
}

/// @brief 

/// @return 
void* alloc_shm_space() {
    int shm_fd = shm_open(SHM_NAME, O_CREAT | O_RDWR, 0666);
    if (shm_fd == -1) {
        throw std::runtime_error("Failed to create shared memory");
    }

    if (ftruncate(shm_fd, SHM_SIZE) == -1) {
        close(shm_fd);
        shm_unlink(SHM_NAME);
        throw std::runtime_error("Failed to set size of shared memory");
    }

    void* shm_ptr = mmap(nullptr, SHM_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, shm_fd, 0);
    if (shm_ptr == MAP_FAILED) {
        close(shm_fd);
        shm_unlink(SHM_NAME);
        throw std::runtime_error("Failed to map shared memory");
    }

    return shm_ptr;
}


void cleanup() {
    if (SHM_PTR != nullptr) {
        munmap(SHM_PTR, SHM_SIZE);
        shm_unlink(SHM_NAME);
    }
    if (SEM != nullptr) {
        sem_close(SEM);
        sem_unlink(SEM_NAME);
    }
}

void signal_handler(int signum) {
    std::cout << "Interrupt signal (" << signum << ") received.\n";
    cleanup();
    exit(signum);
}

double get_user_time_interval(){
    double time_interval;
    bool valid_input = false;
    while (!valid_input) {
        std::cout << "Enter the time interval(s): ";
        if (std::cin >> time_interval) {
            valid_input = true;
        } else {
            std::cout << "Invalid input. Please try again." << std::endl;
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        }
    }
    return time_interval;
}
