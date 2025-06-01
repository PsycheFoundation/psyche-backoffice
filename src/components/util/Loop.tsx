import * as React from "react";

export function Loop<Value>({
  start,
  end,
  next,
  renderer,
}: {
  start: Value;
  end: Value;
  next: (value: Value) => Value;
  renderer: (value: Value) => React.ReactElement;
}) {
  const elements = [];
  let current = start;
  while (current != end) {
    elements.push(renderer(current));
    current = next(current);
  }
  return elements;
}
