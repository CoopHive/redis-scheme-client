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

Example commands:
- seller: `bun run runner.ts seller 127.0.0.8000`
- seller: `bun run runner.ts seller john_seller.com/agent_3`
- buyer: `bun run runner.ts buyer 127.0.0.8000 '{"pubkey": "0x123","offerId": "offer_0","initial": true,"data": {"_tag": "offer","query": "hello","price": ["0x100", 200]}}'`
