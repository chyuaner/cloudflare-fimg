import React from "react";
import { parseTextToElements } from "./elementUtils";

interface BdElementProps {
  bgUrl?: string;
  bgColor?: string;
  bdColor?: string;
  bdWidth?: number | string;
}

const BdElement = ({
  bgColor,
  bgUrl,
  bdColor,
  bdWidth,
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
        ...(bdColor ? { borderColor: bdColor } : {}),
        ...(bdWidth ? { borderWidth: bdWidth } : {}),
        borderStyle: 'solid',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default BdElement;
