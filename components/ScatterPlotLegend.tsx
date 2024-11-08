import { memo } from "react";
import { Card, CardContent } from "./ui/card";

export const Legend = memo(function Legend({ isDark }: { isDark: boolean }) {
  const categories = [
    {
      label: "Category A",
      // Converting the normalized values back to RGB
      // Dark mode: [1, 0.3, 0.3] => rgb(255, 77, 77)
      // Light mode: [1, 0.2, 0.2] => rgb(255, 51, 51)
      color: isDark ? "rgb(255, 77, 77)" : "rgb(255, 51, 51)",
    },
    {
      label: "Category B",
      // Dark mode: [0.3, 1, 0.3] => rgb(77, 255, 77)
      // Light mode: [0.2, 1, 0.2] => rgb(51, 255, 51)
      color: isDark ? "rgb(77, 255, 77)" : "rgb(51, 255, 51)",
    },
    {
      label: "Category C",
      // Dark mode: [0.3, 0.3, 1] => rgb(77, 77, 255)
      // Light mode: [0.2, 0.2, 1] => rgb(51, 51, 255)
      color: isDark ? "rgb(77, 77, 255)" : "rgb(51, 51, 255)",
    },
  ];

  return (
    <Card className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-2">
          {categories.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
