// app/vis/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { DataPoint, dynamoQueries } from "@/lib/dynamo-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { NyquistPlot } from "@/components/NyquistPlot";
import { useState, useEffect, useRef } from "react";

const POLLING_INTERVAL = 5000; // 5 seconds

export default function VisualizationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isRealtime, setIsRealtime] = useState(true);
  const [newDataPoints, setNewDataPoints] = useState<string[]>([]);
  const previousDataLength = useRef(0);

  const testId = searchParams.get("testId");
  const channelId = searchParams.get("channelId");

  const {
    data = [] as DataPoint[],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["testChannelData", testId, channelId],
    queryFn: async () => {
      if (!testId || !channelId) throw new Error("Missing testId or channelId");
      const result = await dynamoQueries.getTestChannelData(testId, channelId);
      return result;
    },
    enabled: !!testId && !!channelId,
    refetchInterval: isRealtime ? POLLING_INTERVAL : false,
  });

  // Handle new data points detection
  useEffect(() => {
    if (data.length > previousDataLength.current) {
      const newPointSKs = data
        .slice(previousDataLength.current)
        .map((point) => point.SK);
      setNewDataPoints(newPointSKs);

      // Clear highlight after 3 seconds
      setTimeout(() => {
        setNewDataPoints([]);
      }, 3000);
    }
    previousDataLength.current = data.length;
  }, [data]);

  if (!testId || !channelId) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700">Invalid Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Missing testId or channelId</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={isRealtime ? "default" : "outline"}
              onClick={() => setIsRealtime(!isRealtime)}
              className="flex items-center gap-2"
            >
              <Wifi
                className={`h-4 w-4 ${isRealtime ? "animate-pulse" : ""}`}
              />
              {isRealtime ? "Live Updates On" : "Live Updates Off"}
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              Nyquist Plot - Test {testId}, Channel {channelId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isError ? (
              <div className="text-red-600">
                Error loading data: {(error as Error).message}
              </div>
            ) : (
              <div className="space-y-6">
                <NyquistPlot
                  data={data}
                  isLoading={isLoading}
                  highlightedPoints={newDataPoints}
                />
                <div className="text-sm text-muted-foreground">
                  {data.length} data points • Frequency range:{" "}
                  {data.length > 0 ? (
                    <>
                      {Math.min(...data.map((d) => d.Frequency)).toFixed(2)} Hz
                      to {Math.max(...data.map((d) => d.Frequency)).toFixed(2)}{" "}
                      Hz
                    </>
                  ) : null}
                  {isRealtime && (
                    <span className="ml-2 text-primary">
                      • Live updates enabled
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
