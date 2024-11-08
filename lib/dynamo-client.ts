import { TestChannelCombination } from "@/app/types/dynamo-types";
import { DynamoDB } from "aws-sdk";

const config = {
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
};

export const dynamoClient = new DynamoDB.DocumentClient(config);
export const TABLE_NAME = "eis-realtime-plot";

interface SearchFilters {
  testId?: string;
  channelId?: string;
}

export const dynamoQueries = {
  async getAllTestChannelCombinations({
    filters,
  }: {
    filters?: {
      testId?: string;
      channelId?: string;
    };
  }): Promise<TestChannelCombination[]> {
    const baseExpressionValues: DynamoDB.DocumentClient.ExpressionAttributeValueMap =
      {
        ":pk": "TESTS",
      };

    const filterExpressions: string[] = [];

    if (filters?.testId) {
      baseExpressionValues[":testId"] = filters.testId;
      filterExpressions.push("contains(PK, :testId)");
    }

    if (filters?.channelId) {
      baseExpressionValues[":channelId"] = filters.channelId;
      filterExpressions.push("contains(PK, :channelId)");
    }

    const params: DynamoDB.DocumentClient.QueryInput = {
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: baseExpressionValues,
      ScanIndexForward: false,
    };

    // Only add FilterExpression if we have filters
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(" and ");
    }

    let items: TestChannelCombination[] = [];
    let lastEvaluatedKey: Record<string, any> | undefined;

    do {
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }

      const response = await dynamoClient.query(params).promise();
      items = items.concat((response.Items || []) as TestChannelCombination[]);
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return items;
  },
};
