import { type Scheme } from "./scheme";
import { match, P } from "ts-pattern";

type Roles = "buyer" | "seller";
type Messages =
  | ({ _tag: "offer" } & Offer)
  | { _tag: "cancel"; error?: string }
  | { _tag: "buyAttest"; attestation: Hex; offer: Offer }
  | { _tag: "sellAttest"; attestation: Hex; result: string };

type Offer = { query: string; price: [Hex, number]; initial: boolean };
type Hex = `0x${string}`;

export const dcnScheme: Scheme<Messages, Roles> = {
  roles: ["buyer", "seller"],
  onAgent: async (client, role, input, output) =>
    match({ role, input, output })
      .with({ output: { data: { _tag: "cancel" } } }, async ({ output }) => {
        await client.unsubscribe(output.offerId);
        await client.send(output);
        return true;
      })
      .with(
        {
          role: "seller",
          input: { data: { _tag: "offer", initial: true } },
          output: { data: { _tag: "offer" } },
        },
        ({ input, output }) => input.offerId == output.offerId,
        async ({ output }) => {
          await client.subscribe(output.offerId);
          await client.send(output);
          return true;
        }
      )
      .with(
        {
          input: { data: { _tag: "offer" } },
          output: { data: { _tag: "offer" } },
        },
        ({ input, output }) => input.offerId == output.offerId,
        async ({ output }) => {
          await client.send(output);
          return true;
        }
      )
      .with(
        {
          role: "buyer",
          input: { data: { _tag: "offer" } },
          output: { data: { _tag: "buyAttest" } },
        },
        ({ input, output }) =>
          input.offerId == output.offerId &&
          input.data.query == output.data.offer.query &&
          input.data.price == output.data.offer.price,
        async ({ output }) => {
          await client.send(output);
          return true;
        }
      )
      .with(
        {
          role: "seller",
          input: { data: { _tag: "buyAttest" } },
          output: { data: { _tag: "sellAttest" } },
        },
        async ({ output }) => {
          await client.unsubscribe(output.offerId);
          await client.send(output);
          return true;
        }
      )
      .otherwise(() => false),
  onStart: async (client, role, init) =>
    match({ role, init })
      .with(
        { role: "buyer", init: { data: { _tag: "offer", initial: true } } },
        async ({ init }) => {
          await client.subscribe(init.offerId);
          return true;
        }
      )
      .with({ role: "seller", init: undefined }, async () => {
        await client.subscribe();
        return true;
      })
      .otherwise(() => false),
};
