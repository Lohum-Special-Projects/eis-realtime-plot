// types/dynamo-types.ts
export interface TestChannelCombination {
  UpdatedAt: string | number | Date;
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
