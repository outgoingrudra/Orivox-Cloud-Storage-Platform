import { getChannel } from "../../config/rabbitmq.js";

export const publishVerificationEmail = ({ email, token }) => {
  const channel = getChannel();

  const payload = {
    email,
    token,
  };

  channel.sendToQueue(
    "email.verification",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    }
  );
};
export const publishPasswordResetEmail = ({ email, token }) => {
  const channel = getChannel();

  channel.sendToQueue(
    "password.reset",
    Buffer.from(
      JSON.stringify({
        email,
        token,
      })
    ),
    {
      persistent: true,
    }
  );
};

export function publishWelcomeEmail({
  email,
  name,
}) {
  const channel = getChannel();

  channel.sendToQueue(
    "email.welcome",
    Buffer.from(
      JSON.stringify({
        email,
        name,
      })
    ),
    {
      persistent: true,
    }
  );
}