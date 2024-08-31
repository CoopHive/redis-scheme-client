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
    match([role, input, output])
      .with(
        [P._, P._, { data: { _tag: "cancel" } }],
        async ([_0, _1, output]) => {
          await client.unsubscribe(output.offerId);
          await client.send(output);
          return true;
        }
      )
      .with(
        [
          "seller",
          { data: { _tag: "offer", initial: true } },
          { data: { _tag: "offer" } },
        ],
        ([_, input, output]) => input.offerId == output.offerId,
        async ([_0, _1, output]) => {
          await client.subscribe(output.offerId);
          await client.send(output);
          return true;
        }
      )
      .with(
        [P._, { data: { _tag: "offer" } }, { data: { _tag: "offer" } }],
        ([_, input, output]) => input.offerId == output.offerId,
        async ([_0, _1, output]) => {
          await client.send(output);
          return true;
        }
      )
      .with(
        ["buyer", { data: { _tag: "offer" } }, { data: { _tag: "buyAttest" } }],
        ([_, input, output]) =>
          input.offerId == output.offerId &&
          input.data.query == output.data.offer.query &&
          input.data.price == output.data.offer.price,
        async ([_0, _1, output]) => {
          await client.send(output);
          return true;
        }
      )
      .with(
        [
          "seller",
          { data: { _tag: "buyAttest" } },
          { data: { _tag: "sellAttest" } },
        ],
        async ([_0, _1, output]) => {
          await client.unsubscribe(output.offerId);
          await client.send(output);
          return true;
        }
      )
      .otherwise(() => false),
  onStart: async (client, role, init) =>
    match([role, init])
      .with(
        ["buyer", { data: { _tag: "offer", initial: true } }],
        async ([_, init]) => {
          await client.subscribe(init.offerId);
          return true;
        }
      )
      .with(["seller", undefined], async () => {
        await client.subscribe();
        return true;
      })
      .otherwise(() => false),
};
