import { Queue, Worker, QueueEvents, JobsOptions } from "bullmq";
import axios from "axios";
import { webhookService } from "./api/services/webhook";

const client = {
  host: process.env.REDIS_HOST || "http://localhost",
  port: parseInt(process.env.REDIS_PORT!) || 6379,
};
const queueName = "webhookQueue";

// Define the queue
const webhookQueue = new Queue(queueName, { connection: client });

// Queue events to handle stalled jobs and other events
const queueEvents = new QueueEvents(queueName, { connection: client });

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed with reason: ${failedReason}`);
});

// Job options to set retry behavior
const jobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "fixed",
    delay: 60000, // 1 minute delay between retries
  },
};

// Worker to process jobs
const worker = new Worker(
  queueName,
  async (job) => {
    const { url, payload, webhookID } = job.data;

    try {
      const response = await axios.post(url, payload);
      if (response.status === 200) {
        console.log(`Webhook triggered successfully for job ${job.id}`);

        // update webhook status to success
        await webhookService.updateWebhookStatus(
          webhookID,
          "SUCCESS",
          new Date()
        );
      } else {
        throw new Error("Non-200 response");
      }
    } catch (error) {
      if (job.attemptsMade >= (job.opts.attempts || 4)) {
        // update webhook status to failed
        await webhookService.updateWebhookStatus(webhookID, "FAILURE");
      }
      throw new Error(JSON.stringify(error));
    }
  },
  { connection: client }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

export { webhookQueue, jobOptions };
