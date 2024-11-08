// utils/eisDataProcessor.ts
import { DataPoint, ProcessedPoint } from "@/types";
import { sortBy } from "lodash";

// Interface for EIS data point
interface EISDataPoint {
  Frequency: number;
  Zreal: number;
  Zimg: number;
  EIS_Data_Point: number;
  [key: string]: any; // for other properties
}

// Interface for processed point

// The three fixed vectors (stored as constants)
const FIXED_VECTORS = {
  V1: [
    2.48751215e-1, 2.15875225e-1, 1.62470213e-1, 7.96967445e-2, 9.89489029e-2,
    1.02489078e-1, 6.74553019e-2, 1.37467438e-2, -5.84632917e-1, -2.93333724e-1,
    -1.15920182e-1, -1.87480717e-1, -2.43927912e-1, 9.08932694e-2,
    -1.24391927e-1, 8.27489833e-2, -4.61898732e-2, -1.01541587e-1,
    -4.70836697e-2, -6.57604633e-2, -3.39321015e-1, -3.95237806e-2,
    -3.24136407e-1, -4.77177688e-2, 1.36643475e-1, -7.43591294e-2,
  ],
  V2: [
    3.47901301e-2, 8.13111572e-3, -5.04446152e-2, 9.92309082e-2, -1.62170325e-2,
    -2.27881716e-2, -1.86213407e-1, 1.27475645e-1, -1.03194293e-1,
    6.64997597e-2, -2.84325056e-1, 8.04900855e-1, -4.14805675e-1, 1.5351099e-3,
    -6.22641693e-4, -4.47658049e-3, -2.37992383e-4, 1.58290415e-3,
    -3.00970355e-2, 3.76936683e-2, 5.88603871e-3, 3.24573385e-3, 3.28038616e-2,
    1.15684983e-1, -1.97981641e-2, -3.91782407e-2,
  ],
  V3: [
    1.35892043e-2, 2.39336407e-2, -8.05175538e-3, -8.88807932e-2,
    -4.07313102e-2, 1.56282287e-2, -3.3330049e-3, -1.77077519e-1,
    -3.24715157e-1, 1.47263862e-1, 1.90695166e-1, 2.17946268e-1, 4.82489767e-1,
    5.9130609e-3, -4.72642853e-3, 1.42692063e-3, -3.05500851e-2, 1.09115708e-1,
    -2.01253228e-1, 2.75396471e-1, -2.59085802e-1, 3.87471329e-1, 4.67006609e-2,
    3.89098176e-1, 7.5081548e-2, -9.21891933e-2,
  ],
};

export class EISDataProcessor {
  /**
   * Scale a value to fit within visualization bounds
   */
  private static scaleValue(value: number): number {
    // Scale to a reasonable range, e.g., -5 to 5
    const maxRange = 5;
    return Math.max(Math.min(value, maxRange), -maxRange);
  }
  /**
   * Processes the EIS data points to create the feature vector
   */
  private static prepareFeatureVector(data: DataPoint[]): number[] {
    // Sort data points by frequency
    const sortedData = sortBy(data, "Frequency");

    // Create the feature vector: [Zreal1, Zreal2, ..., Zimg1, Zimg2, ...]
    const zrealValues = sortedData.map((point) => point.Zreal);
    const zimgValues = sortedData.map((point) => point.Zimg);

    // Combine Zreal and Zimg values
    return [...zrealValues, ...zimgValues];
  }

  /**
   * Calculates dot product of two vectors
   */
  private static dotProduct(vec1: number[], vec2: number[]): number {
    const minLength = Math.min(vec1.length, vec2.length);
    return vec1
      .slice(0, minLength)
      .reduce((sum, val, i) => sum + val * vec2[i], 0);
  }

  /**
   * Determines the category based on the coordinates
   */
  private static determineCategory(
    x: number,
    y: number,
    z: number
  ): "A" | "B" | "C" {
    // Example categorization logic - replace with your own
    const distance = Math.sqrt(x * x + y * y + z * z);
    if (distance < 0.5) return "A";
    if (distance < 1.0) return "B";
    return "C";
  }

  /**
   * Main processing function
   */
  public static processEISData(eisData: DataPoint[]): ProcessedPoint {
    try {
      console.log("Processing EIS data:", eisData);

      // 1. Prepare feature vector
      const featureVector = this.prepareFeatureVector(eisData);

      // 2. Calculate coordinates using dot products
      let x = this.dotProduct(featureVector, FIXED_VECTORS.V1);
      let y = this.dotProduct(featureVector, FIXED_VECTORS.V2);
      let z = this.dotProduct(featureVector, FIXED_VECTORS.V3);

      // Scale the values to reasonable ranges
      x = this.scaleValue(x);
      y = this.scaleValue(y);
      z = this.scaleValue(z);

      // 1. Prepare feature vector

      console.log("Feature vector:", featureVector);

      //   // 2. Calculate coordinates using dot products
      //   const x = this.dotProduct(featureVector, FIXED_VECTORS.V1);
      //   const y = this.dotProduct(featureVector, FIXED_VECTORS.V2);
      //   const z = this.dotProduct(featureVector, FIXED_VECTORS.V3);

      console.log("Calculated coordinates:", { x, y, z });

      // 3. Determine category
      const category = this.determineCategory(x, y, z);

      // 4. Return processed point
      return {
        x,
        y,
        z,
        category,
      };
    } catch (error) {
      console.error("Error processing EIS data:", error);
      throw error;
    }
  }

  /**
   * Validates the input data
   */
  public static validateData(data: DataPoint[]): boolean {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("Data is empty or not an array");
      return false;
    }

    // Check if all required properties are present
    const requiredProps = ["Frequency", "Zreal", "Zimg"];
    return data.every((point) =>
      requiredProps.every(
        (prop) => prop in point && typeof point[prop] === "number"
      )
    );
  }
}
