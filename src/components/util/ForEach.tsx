import * as React from "react";

export function ForEach<Value>({
  values,
  item,
  separator,
  placeholder,
}: {
  values: Value[];
  item: (value: Value, index: number) => React.ReactElement;
  separator?: (index: number) => React.ReactElement;
  placeholder?: () => React.ReactElement;
}) {
  if (values.length === 0) {
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
    elements.push(item(value, index));
  }
  return elements;
}
