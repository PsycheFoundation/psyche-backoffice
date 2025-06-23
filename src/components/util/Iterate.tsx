import * as React from "react";

export function Iterate<Value>({
  start,
  next,
  renderer,
}: {
  start: Value | null;
  next: (value: Value) => Value | null;
  renderer: (value: Value) => React.ReactElement;
}) {
  const elements = [];
  let current = start;
  while (current !== null) {
    elements.push(renderer(current));
    current = next(current);
  }
  return elements;
}
