#!/usr/bin/env bun
import { Hono } from "hono";

const app = new Hono();

// mock inference function; data should be e.g. weights
// the mock just returns the data as is, as long as msg isn't from self
const infer = async (msg: string, data: any) =>
  JSON.parse(msg).pubkey == "0x222" ? "noop" : data;

// mock db read for model weights
const readDb = async () => Bun.file("weights.json").json();

app.post("/", async (c) => {
  const message = c.req.text();
  const weights = readDb();

  const response = await infer(await message, await weights);
  console.log("response: ", response);

  Bun.write("training_data.json", await message);
  return c.json(response);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
