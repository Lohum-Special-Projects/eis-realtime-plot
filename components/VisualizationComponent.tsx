// components/VisualizationComponent.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ScatterPlot from "@/components/scatter-plot";
import { DataPoint, dynamoQueries } from "@/lib/dynamo-client";
import { parseBasePoints } from "@/data/basePoints";
import { EISDataProcessor } from "@/utils/eisDataProcessor";
import { Point3D, ProcessedPoint } from "@/types";

interface VisualizationComponentProps {
  testId?: string;
  channelId?: string;
}

export function VisualizationComponent({
  testId,
  channelId,
}: VisualizationComponentProps) {
  const [controls, setControls] = useState({
    rotationSpeed: 0.5,
    pointSize: 0.2,
  });

  const [processedPoint, setProcessedPoint] = useState<ProcessedPoint | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const visualizationData = useMemo<Point3D[]>(() => {
    return parseBasePoints();
  }, []);

  // Fetch DynamoDB data
  const { data: dbData = [], isLoading: isDbLoading } = useQuery<DataPoint[]>({
    queryKey: ["testChannelData", testId, channelId],
    queryFn: async () => {
      if (!testId || !channelId) throw new Error("Missing testId or channelId");
      const result = await dynamoQueries.getTestChannelData(testId, channelId);
      return result;
    },
    enabled: !!testId && !!channelId,
  });

  // Process EIS data when it arrives
  useEffect(() => {
    const processEISData = async () => {
      if (!dbData || isProcessing) return;

      setIsProcessing(true);
      setProcessingError(null);

      try {
        console.log("Raw data:", dbData);

        // Validate data
        if (!EISDataProcessor.validateData(dbData)) {
          throw new Error("Invalid EIS data format");
        }

        // Process data
        const processedResult = EISDataProcessor.processEISData(dbData);
        console.log("Processed result:", processedResult);

        // Set the processed point with explicit type
        const processedPoint: ProcessedPoint = {
          x: processedResult.x,
          y: processedResult.y,
          z: processedResult.z,
          category: processedResult.category,
          isHighlighted: true,
        };

        console.log("Setting processed point:", processedPoint);
        setProcessedPoint(processedPoint);
      } catch (error) {
        console.error("Failed to process EIS data:", error);
        setProcessingError(
          error instanceof Error ? error.message : "Unknown error"
        );
      } finally {
        setIsProcessing(false);
      }
    };

    processEISData();
  }, [dbData]);

  //   const combinedData = useMemo(() => {
  //     if (!processedPoint) return visualizationData;
  //     return [...visualizationData, processedPoint];
  //   }, [visualizationData, processedPoint]);

  const combinedData = useMemo(() => {
    console.log("Processed point in combineData:", processedPoint);
    console.log("Visualization data:", visualizationData);

    if (!processedPoint)
      return visualizationData as (Point3D | ProcessedPoint)[];
    const combined = [...visualizationData, processedPoint] as (
      | Point3D
      | ProcessedPoint
    )[];
    console.log("Combined data:", combined);
    return combined;
  }, [visualizationData, processedPoint]);

  const handleRotationSpeedChange = useCallback((value: number) => {
    setControls((prev) => ({ ...prev, rotationSpeed: value }));
  }, []);

  const handlePointSizeChange = useCallback((value: number) => {
    setControls((prev) => ({ ...prev, pointSize: value }));
  }, []);

  const plotControls = useMemo(
    () => ({
      rotationSpeed: controls.rotationSpeed,
      setRotationSpeed: handleRotationSpeedChange,
      pointSize: controls.pointSize,
      setPointSize: handlePointSizeChange,
    }),
    [
      controls.rotationSpeed,
      controls.pointSize,
      handleRotationSpeedChange,
      handlePointSizeChange,
    ]
  );

  if (!isDbLoading) {
    console.log(`DATAAAAAAAA ${JSON.stringify(dbData)}`);
  }

  return (
    <div className="flex-grow relative">
      <div className="absolute inset-0 bg-muted rounded-lg">
        {isProcessing && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-lg">Processing EIS data...</div>
          </div>
        )}

        {processingError && (
          <div className="absolute top-4 left-4 bg-destructive/90 text-destructive-foreground p-4 rounded-md">
            {processingError}
          </div>
        )}

        {combinedData.length > 0 && (
          <Suspense fallback={<div>Loading 3D visualization...</div>}>
            <ScatterPlot
              data={combinedData}
              pointSize={controls.pointSize}
              rotationSpeed={controls.rotationSpeed}
              controls={plotControls}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
