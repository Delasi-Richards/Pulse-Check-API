import { createApp } from "./app.js";
import { monitoringMQ } from "./queue.js";

console.log("Starting Pulse Check API");

const app = createApp();

const port = process.env.PORT ? process.env.PORT : "3000";

monitoringMQ();

app.listen(port, () => {
  console.log(`\nServer listening on port ${port}\n`);
});