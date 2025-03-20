import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export const rateLimite = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "10s"),
});
