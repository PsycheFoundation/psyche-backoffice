import * as React from "react";

export function ForEach<Value>({
  values,
  renderer,
  separator,
  placeholder,
}: {
  values: Value[] | null | undefined;
  renderer: (value: Value, index: number) => React.ReactElement;
  separator?: (index: number) => React.ReactElement;
  placeholder?: () => React.ReactElement;
}) {
  if (!values || values.length <= 0) {
    if (placeholder) {
      return placeholder();
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
