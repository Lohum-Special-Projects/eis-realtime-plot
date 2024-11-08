import { DataPoint } from "@/lib/dynamo-client";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface NyquistPlotProps {
  data: DataPoint[];
  isLoading?: boolean;
  highlightedPoints?: string[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card p-3 rounded-lg border shadow-sm">
        <p className="font-medium">Frequency: {data.Frequency.toFixed(2)} Hz</p>
        <p>Zreal: {data.Zreal.toFixed(6)} Ω</p>
        <p>-Zimg: {(-data.Zimg).toFixed(6)} Ω</p>
        <p className="text-muted-foreground text-sm">
          Point: {data.EIS_Data_Point}
        </p>
        {data.isNew && (
          <p className="text-primary font-medium mt-1">New data point!</p>
        )}
      </div>
    );
  }
  return null;
};

export function NyquistPlot({
  data,
  isLoading,
  highlightedPoints = [],
}: NyquistPlotProps) {
  // Sort data by EIS_Data_Point before plotting
  const plotData = [...data]
    .sort((a, b) => a.EIS_Data_Point - b.EIS_Data_Point)
    .map((point) => ({
      ...point,
      negZimg: -point.Zimg,
      isNew: highlightedPoints.includes(point.SK),
    }));

  const xMin = Math.min(...plotData.map((d) => d.Zreal)) * 0.95;
  const xMax = Math.max(...plotData.map((d) => d.Zreal)) * 1.05;
  const yMin = Math.min(...plotData.map((d) => d.negZimg)) * 0.95;
  const yMax = Math.max(...plotData.map((d) => d.negZimg)) * 1.05;

  if (isLoading && data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-card rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 30,
            bottom: 60,
            left: 80,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            dataKey="Zreal"
            name="Zreal"
            domain={[xMin, xMax]}
            label={{
              value: "Zreal (Ω)",
              position: "bottom",
              offset: 40,
              style: { textAnchor: "middle" },
            }}
            className="text-muted-foreground"
            tickFormatter={(value) => value.toFixed(4)}
          />
          <YAxis
            type="number"
            dataKey="negZimg"
            name="-Zimg"
            domain={[yMin, yMax]}
            label={{
              value: "-Zimg (Ω)",
              angle: -90,
              position: "left",
              offset: 50,
              style: { textAnchor: "middle" },
            }}
            className="text-muted-foreground"
            tickFormatter={(value) => value.toFixed(4)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: "10px" }}
          />
          <Scatter
            name="Impedance"
            data={plotData}
            fill="hsl(var(--primary))"
            line={{
              stroke: "hsl(var(--primary))",
              strokeWidth: 1,
              type: "linear", // Changed to linear for smoother lines
            }}
            lineJointType="linear"
          />
          <Scatter
            name="New Points"
            data={plotData.filter((p) => p.isNew)}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            r={8}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
