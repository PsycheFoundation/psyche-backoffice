import * as React from "react";

export function If<Value>({
  value,
  renderer,
  placeholder,
}: {
  value: Value | null;
  renderer: (value: Value) => React.ReactElement;
  placeholder?: () => React.ReactElement;
}) {
  if (value === null) {
    if (placeholder) {
      return placeholder();
    } else {
      return <></>;
    }
  }
  return renderer(value);
}
