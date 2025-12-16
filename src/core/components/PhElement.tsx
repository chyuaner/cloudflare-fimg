// Remove BdElement import
import React from "react";
import { parseTextToElements } from "./elementUtils";

interface PhElementProps {
  fgColor: string;
  fontName: string;
  fontSize: number;
  text?: string;
  // bgUrl, bgColor are removed from here
}

const PhElement = ({
  fgColor,
  fontName,
  fontSize,
  style = {},
  children,
}: React.PropsWithChildren<PhElementProps & { style?: React.CSSProperties }>) => {

  const main = <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        color: fgColor,
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontFamily: fontName,
        ...style,
      }}
    >
      {typeof children === "string" || typeof children === "number"
        ? parseTextToElements(String(children), fontSize)
        : children}
    </div>;

  return main;
};

export default PhElement;
