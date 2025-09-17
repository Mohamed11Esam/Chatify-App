import * as ArcjetPkg from "@arcjet/node";
import dotenv from "dotenv";
dotenv.config();

// Support different export shapes from the package (named exports, default, or namespace)
const arcjetFn =
  ArcjetPkg.arcjet || ArcjetPkg.default?.arcjet || ArcjetPkg.default || null;
const shield = ArcjetPkg.shield || ArcjetPkg.default?.shield || null;
const detectBot = ArcjetPkg.detectBot || ArcjetPkg.default?.detectBot || null;
const slidingWindow =
  ArcjetPkg.slidingWindow || ArcjetPkg.default?.slidingWindow || null;

let aj;
if (typeof arcjetFn === "function") {
  const rules = [];
  if (typeof shield === "function") {
    rules.push(shield({ mode: "LIVE" }));
  }
  if (typeof detectBot === "function") {
    rules.push(
      detectBot({
        mode: "LIVE",
        allow: ["CATEGORY:SEARCH_ENGINE"],
      })
    );
  }
  if (typeof slidingWindow === "function") {
    rules.push(
      slidingWindow({
        mode: "LIVE",
        // use `max` per API
        max: 60,
        interval: "1m",
        blockDuration: "15m",
      })
    );
  }

  try {
    aj = arcjetFn({
      key: process.env.ARCJET_KEY,
      rules: rules.filter(Boolean),
    });
  } catch (err) {
    console.error(
      "Failed to initialize ArcJet (continuing with no-op):",
      err && err.message ? err.message : err
    );
    aj = {
      protect: async () => ({ isDenied: () => false, result: [] }),
    };
  }
} else {
  // Provide a no-op implementation so the app can run even if ArcJet isn't available
  console.warn(
    "ArcJet package did not expose expected exports; using no-op protector."
  );
  aj = {
    protect: async () => ({ isDenied: () => false, result: [] }),
  };
}

export default aj;
