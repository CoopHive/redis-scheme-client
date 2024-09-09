import { $ } from "bun";
import { createClient } from "redis";
import type { ADT, Scheme, Message } from "./scheme";
import { AbstractSchemeClient } from "./scheme";

export class RedisSchemeClient<
  T extends ADT,
  R extends string
> extends AbstractSchemeClient<T, R> {
  constructor(
    scheme: Scheme<T, R>,
    role: R,
    private agent: string,
    private redis = createClient(),
    private redisPubSub = createClient(),
    private defaultChannel = "initial_offers"
  ) {
    super(scheme, role);

    this.onMessage = this.onMessage.bind(this);
  }

  async start(init?: Message<T>) {
    await this.redisPubSub.connect();
    await this.redis.connect();
    if (!(await this.scheme.onStart(this, this.role, init))) {
      throw new Error("Failed to start");
    }
    return true;
  }
  async subscribe(offerId?: string) {
    if (!offerId) {
      await this.redisPubSub.subscribe(this.defaultChannel, this.onMessage);
      return true;
    }
    await this.redisPubSub.subscribe(offerId, this.onMessage);
    return true;
  }
  async unsubscribe(offerId?: string) {
    if (!offerId) {
      await this.redisPubSub.unsubscribe(this.defaultChannel);
      return true;
    }
    await this.redisPubSub.unsubscribe(offerId);
    return true;
  }
  async send(message: Message<T>) {
    await this.redis.publish(
      message.initial ? this.defaultChannel : message.offerId,
      JSON.stringify(message)
    );
    return true;
  }

  private async onMessage(message: string, topic: string) {
    const message_: Message<T> = JSON.parse(message);

    console.log("Received message", message_);

    // spam filter
    if (
      topic != message_.offerId &&
      !(topic == this.defaultChannel && message_.initial)
    )
      return;

    const response = await $`${this.agent} ${message}`;
    const response_: Message<T> | "noop" = response.json();

    console.log("Agent response", response_);

    if (response_ === "noop") return;
    if (!(await this.scheme.onAgent(this, this.role, message_, response_))) {
      console.error("Invalid agent response");
      // throw new Error("Invalid agent response");
    }
  }
}
