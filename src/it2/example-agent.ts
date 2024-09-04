#!/usr/bin/env bun
function main() {
  const input = JSON.parse(process.argv[2]);
  console.error("received: ", input);
  if (input["pubkey"] == "0x222") {
    console.error("self message");
    console.log(`"noop"`);
    return;
  }

  console.log(
    JSON.stringify({
      pubkey: "0x222",
      offerId: "offer_0",
      data: { _tag: "offer", query: "hello", price: ["0x100", 300] },
    })
  );
}

main();
