Syntax: `bun run example-run.ts [role] [agent] [initial offer (buyer only)]`

- `chmod +x example-agent.ts`
- seller: `bun run example-run.ts seller ./example-agent.ts`
- buyer: `bun run example-run.ts buyer ./example-agent.ts '{"pubkey": "0x123","offerId": "offer-0","initial": true,"data": {"_tag": "offer","query": "hello","price": ["0x100", 200]}}'`