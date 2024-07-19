const fs = require('fs');
const ref = require('ref-napi');
const Semaphore = require('posix-semaphore');

const shm_name = "/dev/shm/vector_shared_memory";
const size_t = ref.types.size_t;
const double = ref.types.double;
let fd;

const sem = new Semaphore('/sim_semaphore');

try {

    const metadataSize = ref.sizeof.size_t * 2;
    const metadataBuffer = Buffer.alloc(metadataSize);

    fd = fs.openSync(shm_name, 'r+');
    const buffer = Buffer.alloc(metadataSize);

    process.once('SIGINT', () => {
        console.log('Caught interrupt signal (SIGINT)\n Note: no resources were released.');
        process.exit(0);
    });

    fs.readSync(fd, metadataBuffer, 0, metadataSize, 0);

    const metadata = {
        object_count: ref.get(metadataBuffer, 0, size_t),
        frame: ref.get(metadataBuffer, ref.sizeof.size_t, size_t)
    };

    const n = metadata.object_count;
    const masses_size = n * ref.sizeof.double;
    const header_size = metadataSize + masses_size;
    const frame_size = n * 6 * ref.sizeof.double;
    const shm_size = header_size + frame_size;
    const shmBuffer = Buffer.alloc(shm_size);
    let lastshown = 0;
    while(true) {
        fs.readSync(fd, shmBuffer, 0, shm_size, 0);
        const frame = ref.get(shmBuffer, ref.sizeof.size_t, size_t);
        const min_frame_interval = 15000;

        if ((frame - lastshown) >= min_frame_interval){
            sem.acquire();
            console.log(`Frame ${frame}, sem acquired`);

            for (let j = 0; j < n; ++j) {
                const position = [];
                const velocity = [];
                for (let d = 0; d < 3; ++d) {
                    position.push(ref.get(shmBuffer, header_size + (j * 6 + d) * ref.sizeof.double, double));
                    velocity.push(ref.get(shmBuffer, header_size + (j * 6 + 3 + d) * ref.sizeof.double, double));
                }
                console.log(`  Object ${j + 1}:: Position: ${position}, Velocity: ${velocity}`);
            }
            sem.release();
            console.log("Semaphore released");
            console.log(`Frame interval: ${frame-lastshown}`);
            lastshown = frame;
        } else {
        // console.log(`Frame ${frame} skipped`);
        }
            
    }

    fs.closeSync(fd);
} catch (err) {
    console.error("Failed to read from shared memory:", err);
    if (fd !== undefined) {
        fs.closeSync(fd);
    }
}