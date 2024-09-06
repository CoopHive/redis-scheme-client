import { RedisSchemeClient } from "./client";
import { dcnScheme } from "./example-scheme";

const [role, agent, init] = process.argv.slice(2);
const client = new RedisSchemeClient(dcnScheme, role, agent);
await client.start(init && JSON.parse(init));
