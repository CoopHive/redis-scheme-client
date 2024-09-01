export interface ADT {
  _tag: string;
}

/* Scheme implementations are responsible to
    - T: discriminated union representing all possible messages
    - R: string literal union of roles

    - roles: list of roles that can participate in the scheme
    - onAgent: define rules for valid responses to messages
        args:
            client: provides an abstraction over communication infrastructure
            role: the agent's role
            input: message responded to
            output: response to input
        - subscribe, unsubscribe, and send as appropriate
        - return true if response is valid in context, false otherwise
    - onStart: define rules for valid initial messages
        args:
            client: provides an abstraction over communication infrastructure
            role: the agent's role
            init?: initial message
        - subscribe, unsubscribe, and send as appropriate
        - return true if initial message is valid for role, false otherwise
*/
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
  subscribeSend: (message: Message<T>) => Promise<boolean>;
  unsubscribeSend: (message: Message<T>) => Promise<boolean>;
};

export type Message<T extends ADT> = {
  pubkey: `0x${string}`;
  offerId: string;
  initial?: boolean;
  data: T;
};

/* SchemeClient implementations are responsible to
    - start: connect to communication infrastructure and send init if provided
    - subscribe: start listening for messages related to offerId, 
        or to default channel if unspecified
    - unsubscribe: stop listening for messages related to offerId,
        or to default channel if unspecified
    - send: send message to everyone interested in message.offerId,
        or to default channel if message.initial is true
 */
export abstract class AbstractSchemeClient<T extends ADT, R extends string>
  implements SchemeClient<T>
{
  constructor(protected scheme: Scheme<T, R>, protected role: R) {}

  abstract start(init?: Message<T>): Promise<boolean>;
  abstract subscribe(offerId?: string): Promise<boolean>;
  abstract unsubscribe(offerId?: string): Promise<boolean>;
  abstract send(message: Message<T>): Promise<boolean>;

  subscribeSend = async (message: Message<T>): Promise<boolean> =>
    (await this.subscribe(message.offerId)) && (await this.send(message));
  unsubscribeSend = async (message: Message<T>): Promise<boolean> =>
    (await this.unsubscribe(message.offerId)) && (await this.send(message));
}
