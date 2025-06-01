import * as React from "react";

import "./TextInput.scss";

export function TextInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const classNames = ["TextInput"];
  return (
    <input
      className={classNames.join(" ")}
      placeholder={placeholder}
      value={value}
      onChange={(event) => {
        if (onChange) {
          onChange(event.target.value);
        }
      }}
      disabled={!onChange}
    />
  );
}
