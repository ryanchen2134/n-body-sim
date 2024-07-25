const fs = require('fs');
const ref = require('ref-napi');
const Semaphore = require('posix-semaphore');

const shm_name = "/dev/shm/sim_shm";
const size_t = ref.types.size_t;
const double = ref.types.double;
const sem = new Semaphore('/sim_semaphore');

const metadataSize = ref.sizeof.size_t * 2;
let fd, n, masses_size, header_size, frame_size, shm_size, shmBuffer;

function initialize() {
    fd = fs.openSync(shm_name, 'r+');

    //read metadata, saved to global variables
    const metadataBuffer = Buffer.alloc(metadataSize);
    fs.readSync(fd, metadataBuffer, 0, metadataSize, 0);

    const metadata = {
        object_count: ref.get(metadataBuffer, 0, size_t),
        frame: ref.get(metadataBuffer, ref.sizeof.size_t, size_t)
    };

    n = metadata.object_count;
    masses_size = n * ref.sizeof.double;
    header_size = metadataSize + masses_size;
    frame_size = n * 6 * ref.sizeof.double;
    shm_size = header_size + frame_size;
    shmBuffer = Buffer.alloc(shm_size);

    console.log(`Shared memory initialized with ${n} objects, header size: ${header_size}, frame size: ${frame_size}, total size: ${shm_size}`);
}

    //operate on metadata information
function readData() {
    fs.readSync(fd, shmBuffer, 0, shm_size, 0);
    const frame = ref.get(shmBuffer, ref.sizeof.size_t, size_t);
    const min_frame_interval = 1000; // Set to 0 for testing
    let lastshown = 0;

    if ((frame - lastshown) >= min_frame_interval) {
        sem.acquire();
        const objects = [];
        for (let j = 0; j < n; ++j) { // j objects
            const position = [];
            const velocity = [];
            for (let d = 0; d < 3; ++d) { // d dimensions
                position.push(ref.get(shmBuffer, header_size + (j * 6 + d) * ref.sizeof.double, double));
                velocity.push(ref.get(shmBuffer, header_size + (j * 6 + 3 + d) * ref.sizeof.double, double));
            }
            const mass = ref.get(shmBuffer, metadataSize + j * ref.sizeof.double, double);
            objects.push({ mass, position, velocity }); //objects is an array of objects of the form {mass, position, velocity}
        }
        sem.release();
        lastshown = frame;
        console.log(`Frame ${frame} read with ${objects.length} objects`);
        return { frame, objects }; 
    } else {
        return null;
    }
}

//we wont use- we expect c++ side to handle resouces
function close() {
    if (fd !== undefined) {
        fs.closeSync(fd);
    }
}

module.exports = { //expose these functions
    initialize,
    readData,
    close,
    n
};
