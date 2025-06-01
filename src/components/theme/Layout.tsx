import * as React from "react";

import "./Layout.scss";

export function Layout({
  bordered,
  highlight,
  faded,
  horizontal,
  padded,
  centered,
  flexible,
  wraps,
  spacedOuter,
  spacedInner,
  children,
}: {
  bordered?: boolean;
  highlight?: boolean;
  faded?: boolean;
  horizontal?: boolean;
  padded?: boolean;
  centered?: boolean;
  flexible?: boolean;
  wraps?: boolean;
  spacedOuter?: boolean;
  spacedInner?: boolean;
  children?: React.ReactNode;
}) {
  const classNames = ["Layout"];
  if (bordered) {
    classNames.push("Bordered");
  }
  if (highlight) {
    classNames.push("Highlight");
  }
  if (faded) {
    classNames.push("Faded");
  }
  if (horizontal) {
    classNames.push("Horizontal");
  }
  if (padded) {
    classNames.push("Padded");
  }
  if (centered) {
    classNames.push("Centered");
  }
  if (flexible) {
    classNames.push("Flexible");
  }
  if (wraps) {
    classNames.push("Wraps");
  }
  if (spacedOuter) {
    classNames.push("SpacedOuter");
  }
  if (spacedInner) {
    classNames.push("SpacedInner");
  }
  return <div className={classNames.join(" ")}>{children}</div>;
}
