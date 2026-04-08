import crypto from "crypto";

export function generatePlainApiKey(type: "secret" | "publishable" | "restricted") {
  const prefixMap = {
    secret: "sk",
    publishable: "pk",
    restricted: "rk",
  };

  const randomPart = crypto.randomBytes(24).toString("hex");
  return `${prefixMap[type]}_${randomPart}`;
}

export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function getKeyPrefix(key: string) {
  return key.slice(0, 10);
}

export function maskKey(prefix: string) {
  return `${prefix}***************`;
}

export function getGraceUntil(hours = 48) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function isGracePeriodValid(graceUntil: string | null) {
  if (!graceUntil) return false;
  return new Date(graceUntil).getTime() > Date.now();
}