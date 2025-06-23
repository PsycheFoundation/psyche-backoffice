import * as React from "react";

export function Promised<T>({
  value,
  resolved,
  rejected,
  pending,
}: {
  value: Promise<T>;
  resolved: (result: T) => React.ReactElement;
  rejected: (error: Error) => React.ReactElement;
  pending: () => React.ReactElement;
}) {
  const [state, setState] = React.useState<{
    status: "pending" | "resolved" | "rejected";
    result?: T;
    error?: Error;
  }>({ status: "pending" });

  React.useEffect(() => {
    value
      .then((result) => {
        setState({ status: "resolved", result });
      })
      .catch((error) => {
        setState({ status: "rejected", error });
      });
  }, [value]);

  if (state.status === "rejected") {
    return rejected(state.error!);
  } else if (state.status === "resolved") {
    return resolved(state.result!);
  } else {
    return pending();
  }
}
