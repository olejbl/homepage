import Link from "next/link";
import React from "react";

import compareImages from "resemblejs/compareImages";
import fs from "mz/fs";

interface Analysis {
  /**
   * Run the analysis on this image and get the result
   */
  onComplete(callback: (result: AnalysisResult) => void): void;

  /**
   * Compare this image to another image, to get resemblance data
   */
  compareTo(fileData: string | ImageData | Buffer): Comparison;

  /**
   * Set the resemblance image output style
   */
  outputSettings(settings: OutputSettings): Analysis;
}

interface AnalysisResult {
  red: number;
  green: number;
  blue: number;
  brightness: number;
  white: number;
  black: number;
}

interface Comparison {
  /**
   * Run the analysis and get the comparison result
   */
  onComplete(callback: (data: ComparisonResult) => void): Comparison;

  /**
   * Set the resemblance image output style
   */
  outputSettings(settings: OutputSettings): Comparison;

  /**
   * Ignore nothing when comparing images
   *
   * This will disable ignoreAntialiasing and ignoreColors.
   */
  ignoreNothing(): Comparison;

  /**
   * Ignore as less as possible when comparing images
   *
   * This will disable ignoreAntialiasing and ignoreColors.
   */
  ignoreLess(): Comparison;

  /**
   * Ignore alpha channel when comparing images
   *
   * This will disable ignoreAntialiasing and ignoreColors.
   */
  ignoreAlpha(): Comparison;

  /**
   * Ignore antialiasing when comparing images
   *
   * This will disable ignoreColors.
   */
  ignoreAntialiasing(): Comparison;

  /**
   * Ignore colors when comparing images
   *
   * This will diable ignoreAntialiasing.
   */
  ignoreColors(): Comparison;

  /**
   * Redo the comparison (with the new settings)
   */
  repaint(): Comparison;

  /**
   * Use images' original size
   */
  useOriginalSize(): Comparison;

  /**
   * Scale second image to dimensions of the first one
   */
  scaleToSameSize(): Comparison;

  setCustomTolerance(customSettings: Tolerance): void;
  setReturnEarlyThreshold(threshold: number): Comparison;
}

interface ComparisonResult {
  /**
   * Error information if error encountered
   *
   * Note: If error encountered, other properties will be undefined
   */
  error?: unknown | undefined;

  /**
   * Time consumed by the comparison (in milliseconds)
   */
  analysisTime: number;

  /**
   * Do the two images have the same dimensions?
   */
  isSameDimensions: boolean;

  /**
   * The difference in width and height between the dimensions of the two compared images
   */
  dimensionDifference: {
    width: number;
    height: number;
  };

  /**
   * The percentage of pixels which do not match between the images
   */
  rawMisMatchPercentage: number;

  /**
   * Same as `rawMisMatchPercentage` but fixed to 2-digit after the decimal point
   */
  misMatchPercentage: number;

  diffBounds: Box;

  /**
   * Get a data URL for the comparison image
   */
  getImageDataUrl(): string;

  /**
   * Get data buffer
   */
  getBuffer?: (includeOriginal: boolean) => Buffer;
}

interface OutputSettings {
  errorColor?:
    | {
        red: number;
        green: number;
        blue: number;
      }
    | undefined;
  errorType?: OutputErrorType | undefined;
  errorPixel?:
    | ((px: number[], offset: number, d1: Color, d2: Color) => void)
    | undefined;
  transparency?: number | undefined;
  largeImageThreshold?: number | undefined;
  useCrossOrigin?: boolean | undefined;
  boundingBox?: Box | undefined;
  ignoredBox?: Box | undefined;
  boundingBoxes?: Box[] | undefined;
  ignoredBoxes?: Box[] | undefined;
  ignoreAreasColoredWith?: Color | undefined;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Tolerance {
  red?: number;
  green?: number;
  blue?: number;
  alpha?: number;
  minBrightness?: number;
  maxBrightness?: number;
}

export interface ComparisonOptions {
  output?: OutputSettings | undefined;
  returnEarlyThreshold?: number | undefined;
  scaleToSameSize?: boolean | undefined;
  ignore?: ComparisonIgnoreOption | ComparisonIgnoreOption[] | undefined;
  tolerance?: Tolerance | undefined;
}

type OutputErrorType =
  | "flat"
  | "movement"
  | "flatDifferenceIntensity"
  | "movementDifferenceIntensity"
  | "diffOnly";

type ComparisonCallback = (err: unknown, data: ComparisonResult) => void;

type ComparisonIgnoreOption =
  | "nothing"
  | "less"
  | "antialiasing"
  | "colors"
  | "alpha";

async function getDiff() {
  const options: ComparisonOptions = {
    output: {
      errorColor: {
        red: 255,
        green: 0,
        blue: 255,
      },
      //errorType: "movementDifferenceIntensity",
      transparency: 0.3,
      largeImageThreshold: 1200,
      useCrossOrigin: false,
    },
    scaleToSameSize: true,
    ignore: "antialiasing",
  };

  const data = await compareImages(
    await fs.readFile("./People.jpg"),
    await fs.readFile("./People2.jpg"),
    options
  );

  await fs.writeFile("./output.png", data.getBuffer(true));
}

export default function Home() {
  getDiff();
  return (
    <div>
      Hello World.
      <Link href="/about">About</Link>
    </div>
  );
}
