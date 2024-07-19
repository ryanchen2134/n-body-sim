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

sem_t* g_sem = nullptr;
const char* g_sem_name = nullptr;
void* g_shm_ptr = nullptr;
const char* g_shm_name = nullptr;
size_t g_shm_size = 0;

void* alloc_shm_space(const size_t shm_size, const char* shm_name);

struct Metadata {
    size_t object_count;
    std::atomic<size_t> frame;
};

void cleanup() {
    if (g_shm_ptr != nullptr) {
        munmap(g_shm_ptr, g_shm_size);
        shm_unlink(g_shm_name);
    }
    if (g_sem != nullptr) {
        sem_close(g_sem);
        sem_unlink(g_sem_name);
    }
}

void signal_handler(int signum) {
    std::cout << "Interrupt signal (" << signum << ") received.\n";
    cleanup();
    exit(signum);
}

int main() {
    signal(SIGINT, signal_handler);

    g_sem_name = "/sim_semaphore";
    g_sem = sem_open(g_sem_name, O_CREAT, 0644, 1);
    if (g_sem == SEM_FAILED) {
        throw std::runtime_error("Failed to create semaphore");
    }

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

    MassObject a(10000, {1, 0, 0}, {0, 0, 0}, time_interval);
    MassObject b(10000, {-1, 0, 0}, {0, 0, 0});
    MassObject c(10000, {0, 0, 0}, {0, 0, 0});

    const size_t n = MassObject::objects.size();
    const size_t header_size = sizeof(Metadata) + sizeof(double) * n;
    const size_t frame_size = n * sizeof(double) * 6;
    const size_t shm_size = header_size + frame_size;
    g_shm_size = shm_size;
    g_shm_name = "/vector_shared_memory";
    g_shm_ptr = alloc_shm_space(shm_size, g_shm_name);

    std::cout << "Shared memory created and mapped successfully." << std::endl;

    Metadata* metadata = static_cast<Metadata*>(g_shm_ptr);
    metadata->object_count = n;
    metadata->frame = 1;

    double* data_ptr = reinterpret_cast<double*>(reinterpret_cast<uint8_t*>(g_shm_ptr) + header_size);

    for (size_t i = 0; i < n; ++i) {
        memcpy(reinterpret_cast<uint8_t*>(g_shm_ptr) + sizeof(Metadata) + i * sizeof(double), &MassObject::objects[i].mass, sizeof(double));
    }

    print_object_state_all();

    while(true) {
        std::cout << "Frame: " << metadata->frame << std:: endl;
        run_one_frame();
        sem_wait(g_sem);
        ++metadata->frame;
        for (size_t i = 0; i < n; ++i) {
            memcpy(reinterpret_cast<uint8_t*>(data_ptr) + i * 6 * sizeof(double), MassObject::objects[i].position.data(), 3 * sizeof(double));
            memcpy(reinterpret_cast<uint8_t*>(data_ptr) + i * 6 * sizeof(double) + 3 * sizeof(double), MassObject::objects[i].velocity.data(), 3 * sizeof(double));
        }
        sem_post(g_sem);
        print_object_state_all();
    }

    std::cout << "Simulation complete." << std::endl;
    cleanup();
    std::cout << "Clean up done. Exiting." << std::endl;
    return 0;
}

void* alloc_shm_space(const size_t shm_size, const char* shm_name) {
    int shm_fd = shm_open(shm_name, O_CREAT | O_RDWR, 0666);
    if (shm_fd == -1) {
        throw std::runtime_error("Failed to create shared memory");
    }

    if (ftruncate(shm_fd, shm_size) == -1) {
        close(shm_fd);
        shm_unlink(shm_name);
        throw std::runtime_error("Failed to set size of shared memory");
    }

    void* shm_ptr = mmap(nullptr, shm_size, PROT_READ | PROT_WRITE, MAP_SHARED, shm_fd, 0);
    if (shm_ptr == MAP_FAILED) {
        close(shm_fd);
        shm_unlink(shm_name);
        throw std::runtime_error("Failed to map shared memory");
    }

    return shm_ptr;
}