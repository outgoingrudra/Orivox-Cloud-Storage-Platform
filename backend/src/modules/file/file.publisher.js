import { getChannel } from "../../config/rabbitmq.js";

export function publishStorageDeletion(jobId) {
  const channel = getChannel();

  channel.sendToQueue(
    "storage.deletion",
    Buffer.from(
      JSON.stringify({
        jobId,
      })
    ),
    {
      persistent: true,
    }
  );
}