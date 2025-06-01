import * as React from "react";

import "./TextArea.scss";

export function TextArea({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const classNames = ["TextArea"];
  return (
    <textarea
      className={classNames.join(" ")}
      placeholder={placeholder}
      value={value}
      onChange={(event) => {
        if (onChange) {
          onChange(event.target.value);
        }
      }}
      disabled={!onChange}
      style={{ height: "200px" }} // TODO - there's probably a better way
    />
  );
}
