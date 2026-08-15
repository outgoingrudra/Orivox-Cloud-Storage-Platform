import amqp from "amqplib";

let connection;
let channel;

export const connectRabbitMQ = async () => {
  connection = await amqp.connect(
    process.env.RABBITMQ_URL
  );

  channel = await connection.createChannel();

  await channel.assertQueue("email.verification", {
    durable: true,
  });

  await channel.assertQueue("password.reset", {
    durable: true,
  });

  console.log("RabbitMQ connected");
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
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