// utils/dynamo-utils.ts

import {
  ParsedTestChannel,
  TestChannelCombination,
} from "@/types/dynamo-types";

export function parseTestChannelCombination(
  item: TestChannelCombination
): ParsedTestChannel {
  const gsi1skParts = item.GSI1SK.split("#");
  return {
    testId: gsi1skParts[0],
    channelId: gsi1skParts[1],
    fullKey: item.PK,
  };
}
