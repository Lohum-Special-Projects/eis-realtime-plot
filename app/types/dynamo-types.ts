// types/dynamo-types.ts
export interface TestChannelCombination {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
}

export interface ParsedTestChannel {
  testId: string;
  channelId: string;
  fullKey: string;
}
