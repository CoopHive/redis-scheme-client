export type Scheme<R extends SchemeResponse, C extends SchemeContext> = {
  defaultTopics: string[];
  startListenOn: (response: R, context: C) => string | string[] | null;
  stopListenOn: (response: R, context: C) => string | string[] | null;
};

export interface SchemeContext {
  role: string;
  lastMessage: string;
}

export interface InitialSchemeContext {
  role: string;
}

export type SchemeResponse = StandardResponse | NothingResponse;

interface StandardResponse {
  _tag: Exclude<string, "nothing">;
  topic: string;
  message: string;
}

type NothingResponse = {
  _tag: "nothing";
};

export function isStandardResponse(
  response: SchemeResponse
): response is StandardResponse {
  return response._tag !== "nothing";
}
