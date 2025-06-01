import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../theme/Button";
import { Text } from "../theme/Text";
import { PageAuthPath } from "./PageAuth";

export function PageHomePath() {
  return "/";
}

export function PageHome() {
  const navigate = useNavigate();

  return (
    <>
      <Text h={1} value="Home" />
      <Button
        text="Auth"
        onClick={() => {
          return navigate(PageAuthPath());
        }}
      />
    </>
  );
}
