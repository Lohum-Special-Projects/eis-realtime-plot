import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { dynamoClient } from "./dynamo-client";
import { TestChannelCombination } from "@/app/types/dynamo-types";
import { DynamoDB } from "aws-sdk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
