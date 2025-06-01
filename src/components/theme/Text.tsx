import * as React from "react";

import "./Text.scss";

export enum TextTint {
  Success,
  Error,
}

export function Text({
  value,
  h,
  tint,
}: {
  value?: string;
  h?: number;
  tint?: TextTint;
}) {
  const classNames = ["Text"];
  if (h) {
    classNames.push("H" + h);
  }
  if (tint === TextTint.Success) {
    classNames.push("Success");
  }
  if (tint === TextTint.Error) {
    classNames.push("Error");
  }
  return <p className={classNames.join(" ")}>{value}</p>;
}
