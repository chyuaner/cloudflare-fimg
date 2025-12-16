import React from "react";
import { parseTextToElements } from "./elementUtils";

interface BdElementProps {
  bgUrl?: string;
  bgColor?: string;
}

const BdElement = ({
  bgColor,
  bgUrl,
  style = {},
  children,
}: React.PropsWithChildren<BdElementProps & { style?: React.CSSProperties }>) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        ...(bgColor ? { backgroundColor: bgColor } : {}),
        ...(bgUrl ? { background: `url(${bgUrl})` } : {}),
        backgroundSize: "100% 100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default BdElement;
