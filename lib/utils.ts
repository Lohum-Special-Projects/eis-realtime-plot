import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DataPoint, dynamoClient } from "./dynamo-client";
import { TestChannelCombination } from "@/types/dynamo-types";
import { DynamoDB } from "aws-sdk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ProcessedPoint {
  x: number;
  y: number;
  z: number;
  category: "A" | "B" | "C";
  isHighlighted?: boolean;
}
