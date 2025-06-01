import * as React from "react";

import "./Button.scss";

import { Image } from "./Image";
import { Layout } from "./Layout";
import { Spacing } from "./Spacing";
import { Text } from "./Text";

export function Button({
  icon,
  text,
  description,
  onClick,
}: {
  icon?: string;
  text: string;
  description?: string;
  onClick?: () => Promise<void> | void;
}) {
  const [pressed, setPressed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const onClickStart = () => {
    setPressed(true);
  };
  const onClickCancel = () => {
    if (pressed) {
      setPressed(false);
    }
  };
  const onClickEnd = async () => {
    if (onClick && pressed && !loading) {
      setPressed(false);
      setLoading(true);
      try {
        await onClick();
      } finally {
        setLoading(false);
      }
    }
  };
  const classNames = ["Button"];
  if (pressed) {
    classNames.push("Pressed");
  }
  if (loading) {
    classNames.push("Loading");
  }
  return (
    <button
      className={classNames.join(" ")}
      disabled={!onClick}
      onMouseDown={onClickStart}
      onMouseLeave={onClickCancel}
      onMouseUp={onClickEnd}
      onTouchStart={onClickStart}
      onTouchCancel={onClickCancel}
      onTouchEnd={onClickEnd}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onClickStart();
        }
      }}
      onBlur={() => {
        onClickCancel();
      }}
      onKeyUp={(event) => {
        if (event.key === "Enter") {
          onClickEnd();
        }
      }}
    >
      <Layout highlight horizontal bordered padded centered>
        {icon ? (
          <>
            <Image src={icon} />
            <Spacing />
          </>
        ) : undefined}
        <Layout flexible>
          <Text value={text} />
          <Layout faded>
            {description ? <Text value={description} /> : undefined}
          </Layout>
        </Layout>
      </Layout>
    </button>
  );
}
