import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Text } from "../theme/Text";

export function PageHomePath() {
  return "/";
}

export function PageHome() {
  const navigate = useNavigate();

  return (
    <>
      <Text h={1} value="Home" />
    </>
  );
}
