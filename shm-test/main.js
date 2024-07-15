const fs = require('fs');
const ref = require('ref-napi');

// Define shared memory key and size
const shm_name = "/dev/shm/vector_shared_memory";
const shm_size = 32; // 32 bytes

// Open shared memory
try {
    const fd = fs.openSync(shm_name, 'r+');
    const buffer = Buffer.alloc(shm_size);
    fs.readSync(fd, buffer, 0, shm_size, 0);

    // Read vector of doubles from shared memory
    const doubleType = ref.types.double;
    const numDoubles = shm_size / doubleType.size; // Number of doubles that fit in shared memory

    const doubles = [];
    for (let i = 0; i < numDoubles; i++) {
        doubles.push(buffer.readDoubleLE(i * doubleType.size));
    }

    console.log("Vector of doubles read from shared memory:");
    console.log(doubles);

    fs.closeSync(fd);
} catch (err) {
    console.error("Failed to read from shared memory:", err);
}