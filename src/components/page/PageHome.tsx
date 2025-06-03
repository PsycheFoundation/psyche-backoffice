import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../theme/Button";
import { Text } from "../theme/Text";
import { PageAuthPath } from "./PageAuth";
import { PageRunPath } from "./PageRun";

export function PageHomePath() {
  return "/";
}

export function PageHome() {
  const navigate = useNavigate();

  return (
    <>
      <Text h={1} value="Home" />
      <Button
        text="Run"
        onClick={() => {
          return navigate(PageRunPath());
        }}
      />
      <Button
        text="Auth"
        onClick={() => {
          return navigate(PageAuthPath());
        }}
      />
    </>
  );
}
