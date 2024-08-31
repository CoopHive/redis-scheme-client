import { $ } from "bun";
import { createClient } from "redis";
import {
  isStandardResponse,
  type Scheme,
  type SchemeContext,
  type SchemeResponse,
} from "./scheme";

export const startSchemeClient = async <
  M extends SchemeResponse,
  C extends SchemeContext
>(
  scheme: Scheme<M, C>,
  context: C
) => {
  const redis = createClient();

  const onMessage = async (topic: string, message: string) => {
    const rawResponse = await messageHandlers[
      process.env.AGENT_TYPE as keyof typeof messageHandlers
    ](topic, message);

    const response: M = rawResponse.json();

    const stopListeningTo = scheme.stopListenOn(response, {
      ...context,
      lastMessage: message,
    });
    const startListeningTo = scheme.startListenOn(response, {
      ...context,
      lastMessage: message,
    });

    await Promise.all([
      isStandardResponse(response) &&
        redis.publish(response.topic, response.message),
      stopListeningTo && redis.unsubscribe(stopListeningTo),
      startListeningTo && redis.subscribe(startListeningTo, onMessage),
    ]);
  };

  await redis.connect();
  await redis.subscribe(scheme.defaultTopics, onMessage);
};

const messageHandlers = {
  cli: async (topic: string, message: string) => {
    return await $`${process.env.AGENT_SUBROUTINE} ${JSON.stringify({
      topic,
      message,
    })}`;
  },
};
