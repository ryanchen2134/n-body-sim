#include <iostream>
#include <vector>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>
#include <cstring>
#include <stdexcept>
#include <thread>
#include <chrono>

// Define shared memory key and size
const char* shm_name = "/vector_shared_memory";
const size_t shm_size = 32; // 32 bytes (enough for 4 doubles, as each double is 8 bytes)

int main() {
    // Open shared memory region
    int shm_fd = shm_open(shm_name, O_CREAT | O_RDWR, 0666);
    if (shm_fd == -1) {
        throw std::runtime_error("Failed to create shared memory");
    }

    // Set the size of the shared memory object
    if (ftruncate(shm_fd, shm_size) == -1) {
        throw std::runtime_error("Failed to set size of shared memory");
    }

    // Map shared memory into the address space
    void* shm_ptr = mmap(nullptr, shm_size, PROT_READ | PROT_WRITE, MAP_SHARED, shm_fd, 0);
    if (shm_ptr == MAP_FAILED) {
        throw std::runtime_error("Failed to map shared memory");
    }

    // Write a vector of doubles to shared memory
    double* double_ptr = static_cast<double*>(shm_ptr);

    //
    std::vector<double> data = {1.1, 2.2, 3.3, 4.4};
    //

    std::memcpy(double_ptr, data.data(), data.size() * sizeof(double));

    std::cout << "Vector of doubles written to shared memory." << std::endl;

    // Keep the process running to keep the shared memory alive for 30 seconds
    std::cout << "Waiting for 30 seconds before cleanup..." << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(30));

    // Clean up
    munmap(shm_ptr, shm_size);
    shm_unlink(shm_name);

    std::cout << "Clean up done. Exiting." << std::endl;

    return 0;
}