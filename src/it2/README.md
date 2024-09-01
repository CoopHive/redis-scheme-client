seller: `bun run example-run.ts seller seller_client.py`

buyer: `bun run example-run.ts buyer buyer_client.py '{"pubkey": "0x123","offerId": "offer-0","initial": true,"data": {"_tag": "offer","query": "hello","price": ["0x100", 200]}}'`