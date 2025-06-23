import * as React from "react";

export function ForEach<Value>({
  values,
  renderer,
  separator,
  empty,
  placeholder,
}: {
  values: Value[] | null;
  renderer: (value: Value, index: number) => React.ReactElement;
  separator?: (index: number) => React.ReactElement;
  empty?: () => React.ReactElement;
  placeholder?: () => React.ReactElement;
}) {
  if (values === null) {
    if (placeholder) {
      return placeholder();
    } else {
      return <></>;
    }
  }
  if (values.length === 0) {
    if (empty) {
      return empty();
    } else {
      return <></>;
    }
  }
  const elements = [];
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (index != 0 && separator) {
      elements.push(separator(index));
    }
    elements.push(renderer(value, index));
  }
  return elements;
}
