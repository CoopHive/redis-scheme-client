Syntax: `bun run example-run.ts [role] [agent] [initial offer (buyer only)]`

- `chmod +x agent.ts`
- seller: `bun run example-run.ts seller ./agent.ts`
- buyer: `bun run example-run.ts buyer ./agent.ts '{"pubkey": "0x123","offerId": "offer-0","initial": true,"data": {"_tag": "offer","query": "hello","price": ["0x100", 200]}}'`