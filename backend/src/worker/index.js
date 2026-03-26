const { Worker } = require('bullmq');

const connection = {
    host: 'redis',
    port: 6379,
};

const worker = new Worker('allumnova-queue', async (job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);
    // Handle background tasks like notifications or feed aggregation
}, { connection });

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed with ${err.message}`);
});

console.log('BullMQ Worker started');
