import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface ValidatedInitData {
  user: TelegramUser;
  authDate: number;
}

// Max age of an initData payload before we reject it (seconds).
const MAX_AGE_SECONDS = 24 * 60 * 60;

// Validates Telegram WebApp initData per
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// Returns the parsed user on success, or null if the signature is invalid.
export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = MAX_AGE_SECONDS,
): ValidatedInitData | null {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const a = Buffer.from(computedHash, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  // Reject stale payloads (replay protection).
  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) return null;
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > maxAgeSeconds || ageSeconds < -300) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;

  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return null;
  }
  if (!user || typeof user.id !== "number") return null;

  return { user, authDate };
}
