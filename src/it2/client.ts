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
    private defaultChannel = "initial_offers"
  ) {
    super(scheme, role);
  }

  async start(init?: Message<T>) {
    await this.redis.connect();
    if (!(await this.scheme.onStart(this, this.role, init))) {
      throw new Error("Failed to start");
    }
    return true;
  }
  async subscribe(offerId?: string) {
    if (!offerId) {
      await this.redis.subscribe(this.defaultChannel, this.onMessage);
      return true;
    }
    await this.redis.subscribe(offerId, this.onMessage);
    return true;
  }
  async unsubscribe(offerId?: string) {
    await this.redis.unsubscribe(offerId);
    return true;
  }
  async send(message: Message<T>) {
    await this.redis.publish(message.offerId, JSON.stringify(message));
    return true;
  }

  private async onMessage(topic: string, message: string) {
    const message_: Message<T> = JSON.parse(message);
    const response: Message<T> | "noop" = JSON.parse(
      (
        await $`${this.agent} ${JSON.stringify({ topic, message })}`
      ).stdout.toString()
    );
    if (response === "noop") return;
    if (!this.scheme.onAgent(this, this.role, message_, response))
      throw new Error("Invalid response");
  }
}
