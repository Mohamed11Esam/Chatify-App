import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);
    if (
      decision &&
      typeof decision.isDenied === "function" &&
      decision.isDenied()
    ) {
      const reason = decision.reason;
      if (
        reason &&
        typeof reason.isRateLimit === "function" &&
        reason.isRateLimit()
      ) {
        return res.status(429).json({ message: "rate limit exceeded" });
      } else if (
        reason &&
        typeof reason.isBot === "function" &&
        reason.isBot()
      ) {
        return res.status(403).json({ message: "Bot Access denied" });
      } else {
        return res
          .status(403)
          .json({ message: "Access denied by security policies" });
      }
    }

    // decision.result may be undefined in some implementations; guard before using
    if (
      decision &&
      Array.isArray(decision.result) &&
      decision.result.some(isSpoofedBot)
    ) {
      return res.status(403).json({ message: "Spoofed bot access denied" });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export default arcjetProtection;
