import React from "react";
import PhElement from "./components/PhElement";
import BgElement from "./components/BgElement";

export class Canvas {
  private width?: number;
  private height?: number;
  private phElement: React.ReactElement | null = null;
  private bgElement: React.ReactElement | null = null;

  setCanvasSize(width?: number, height?: number) {
    this.width = width;
    this.height = height;
    return this;
  }

  addPh(opts: {
    bgColor: string;
    fgColor: string;
    fontName: string;
    fontSize: number;
    text?: string;
  }) {
    const { bgColor, fgColor, fontName, fontSize, text } = opts;
    this.phElement = (
      <PhElement
        bgColor={bgColor}
        fgColor={fgColor}
        fontName={fontName}
        fontSize={fontSize}
        text={text}
      />
    );
    return this;
  }

  addBg(opts: {
    bgColor?: string;
    bgUrl?: string;
    padding?: number | string;
    shadow?: number | string;
    radius?: number | string;
    wrapperStyle?: Record<string, string | number>;
  }) {
    const {
      bgColor,
      bgUrl,
      padding,
      shadow,
      radius,
      wrapperStyle = {},
    } = opts;

    if (!this.phElement) {
      // phElement must be created before wrapping it with BgElement
      return this;
    }

    this.bgElement = (
      <BgElement
        bgColor={bgColor}
        bgUrl={bgUrl}
        padding={padding}
        shadow={shadow}
        radius={radius}
        wrapperStyle={wrapperStyle}
      >
        {this.phElement}
      </BgElement>
    );

    return this;
  }

  gen(): React.ReactElement {
    if (this.bgElement) {
      return this.bgElement;
    }
    
    if (this.phElement) {
      return this.phElement;
    }

    // Fallback if nothing added
    return <></>; 
  }
}
