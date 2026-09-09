import { createServer } from "./presentation/http/server";
import { loadEnv } from "./shared/config/env";

const env = loadEnv();
const app = createServer();

app.listen(env.port, () => {
  console.log(`Oficina API listening on port ${env.port}`);
});

