import "./shared/observability/telemetry";

import { createServer } from "./presentation/http/server";
import { loadEnv } from "./shared/config/env";
import { log } from "./shared/observability/logger";

const env = loadEnv();
const app = createServer();

app.listen(env.port, () => {
  log("info", "application_started", { port: env.port });
});
