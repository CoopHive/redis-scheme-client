# redis-scheme-client

This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

To install dependencies:

```bash
bun install
```

To install redis:

https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/

To run redis:

```bash
redis-server
```

To run:

Syntax: `bun run runner.ts [role] [agent] [initial offer (buyer only)]`

- seller: `bun run runner.ts seller ./example-agent.ts`
- buyer: `bun run runner.ts buyer ./example-agent.ts '{"pubkey": "0x123","offerId": "offer_0","initial": true,"data": {"_tag": "offer","query": "hello","price": ["0x100", 200]}}'`

Example run:
1. `cd example-agent && bun run index.ts`
2. `redis-server`
3. `cd src && bun run runner.ts seller localhost:3000`
4. `redis-cli`, do `publish initial_offers '{"pubkey": "0x123","offerId": "offer_0","initial": true,"data": {"_tag": "offer","query": "hello","price": ["0x100", 200]}}'`
