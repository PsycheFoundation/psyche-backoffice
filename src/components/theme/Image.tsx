import * as React from "react";

import "./Image.scss";

export function Image({
  src,
  size,
  transform,
}: {
  src: string;
  size?: { x: number; y: number };
  transform?: string;
}) {
  return (
    <img
      className="Image"
      src={src}
      style={{
        width: size?.x,
        height: size?.y,
        transform,
      }}
    />
  );
}
