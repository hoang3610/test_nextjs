import * as React from "react";
import { createAnimation } from "./animation";
import { cssValue } from "./unitConverter";
import { LoaderSizeMarginProps } from "./props-loader";
const beat = createAnimation(
  "BeatLoader",
  "50% {transform: scale(0.75);opacity: 0.2} 100% {transform: scale(1);opacity: 1}",
  "beat"
);

function BeatLoader({
  loading = true,
  color = "#1462B0",
  speedMultiplier = 1,
  cssOverride = {},
  size = 5,
  margin = 2,
  ...additionalProps
}: LoaderSizeMarginProps): JSX.Element | null {
  const wrapper: React.CSSProperties = {
    display: "inherit",
    ...cssOverride,
  };

  const style = (i: number): React.CSSProperties => {
    return {
      display: "inline-block",
      backgroundColor: color,
      width: cssValue(size),
      height: cssValue(size),
      margin: cssValue(margin),
      borderRadius: "100%",
      animation: `${beat} ${0.7 / speedMultiplier}s ${i % 2 ? "0s" : `${0.35 / speedMultiplier}s`} infinite linear`,
      animationFillMode: "both",
    };
  };

  if (!loading) {
    return null;
  }

  return (
    <span style={wrapper} {...additionalProps}>
      <span style={style(1)} />
      <span style={style(2)} />
      <span style={style(3)} />
    </span>
  );
}

export default BeatLoader;
