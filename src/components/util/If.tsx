import * as React from "react";

export function If({
  value,
  content,
  placeholder,
}: {
  value: boolean;
  content: () => React.ReactElement;
  placeholder?: () => React.ReactElement;
}) {
  if (!value) {
    if (placeholder) {
      return placeholder();
    } else {
      return <></>;
    }
  }
  return content();
}
