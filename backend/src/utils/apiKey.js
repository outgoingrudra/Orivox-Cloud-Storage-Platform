import crypto from "crypto";

const PREFIX = "orvx_live_";

export function generateApiKey() {
  const secret = crypto.randomBytes(32).toString("hex");
  const apiKey = `${PREFIX}${secret}`;

  return {
    apiKey,
    keyHash: hashApiKey(apiKey),
    keyPrefix: apiKey.slice(0, 18),
  };
}

export function hashApiKey(apiKey) {
  return crypto
    .createHash("sha256")
    .update(apiKey)
    .digest("hex");
}