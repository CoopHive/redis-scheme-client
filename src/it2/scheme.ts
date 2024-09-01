export interface ADT {
  _tag: string;
}

export type Scheme<T extends ADT, R extends string> = {
  roles: R[];
  onAgent(
    client: SchemeClient<T>,
    role: R,
    input: Message<T>,
    output: Message<T>
  ): Promise<boolean>;
  onStart(
    client: SchemeClient<T>,
    role: R,
    init?: Message<T>
  ): Promise<boolean>;
};

export type SchemeClient<T extends ADT> = {
  start: (init?: Message<T>) => Promise<boolean>;
  subscribe: (offerId?: string) => Promise<boolean>;
  unsubscribe: (offerId?: string) => Promise<boolean>;
  send: (message: Message<T>) => Promise<boolean>;
};

export type Message<T extends ADT> = {
  pubkey: `0x${string}`;
  offerId: string;
  data: T;
};
