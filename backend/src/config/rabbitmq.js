import amqp from "amqplib";

let connection;
let channel;

export const connectRabbitMQ = async () => {
  connection = await amqp.connect(
    process.env.RABBITMQ_URL
  );

  channel = await connection.createChannel();

  // ==================== EMAIL QUEUES ====================

  await channel.assertQueue(
    "email.verification",
    {
      durable: true,
    }
  );

  await channel.assertQueue(
    "password.reset",
    {
      durable: true,
    }
  );

  await channel.assertQueue(
    "email.welcome",
    {
      durable: true,
    }
  );

  // ==================== STORAGE QUEUES ====================

  await channel.assertQueue(
    "storage.deletion",
    {
      durable: true,
    }
  );
};

export const getChannel = () => {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel not initialized"
    );
  }

  return channel;
};

export const closeRabbitMQ = async () => {
  if (channel) {
    await channel.close();
  }

  if (connection) {
    await connection.close();
  }
};