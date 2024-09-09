// Imports
import { RedisSchemeClient } from "./client";
import { dcnScheme } from "./compute-marketplace-scheme";

// Command Line Arguments
// return the command-line arguments excluding the first two elements
const [role, agent, init] = process.argv.slice(2);

// Create new instance of RedisSchemeClient
const client = new RedisSchemeClient(dcnScheme, role, agent);

// Start the client with optional arguments
await client.start(init && JSON.parse(init));
