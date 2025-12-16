import React from "react";
import WmElement from "./WmElement";
import { SplitUrlProps } from "../urlUtils/splitUrl";


interface DebugElementProps {
  splitUrl: SplitUrlProps;
  fgColor?: string;
}

const DebugElement = ({
  splitUrl,
  fgColor='#FFF',
}: React.PropsWithChildren<DebugElementProps>) => {

  return (
    <WmElement
        fgColor={fgColor}
        fontName='noto'
        fontSize={12}
        margin={4}
      >
        <div style={{
          display: 'flex',
          gap: '8'
        }}>
          <ul style={{
            flexDirection: "column",
          }}>
            <li>Canvas: {splitUrl.canvas}</li>
            <li>BG Padding: {splitUrl.bg.padding}</li>
            <li>BG Shadow: {splitUrl.bg.shadow}</li>
            <li>BG radius: {splitUrl.bg.radius}</li>
            <li>BG bgcolor: {splitUrl.bg.bgcolor}</li>
          </ul>
          <ul style={{
            flexDirection: "column",
          }}>
            <li>{splitUrl.content.type}:</li>
            <li>size: {splitUrl.content.size}</li>
            <li>bgcolor: {splitUrl.content.bgcolor}</li>
            <li>fgcolor: {splitUrl.content.fgcolor}</li>
          </ul>
        </div>
      </WmElement>
  );
};

export default DebugElement;
