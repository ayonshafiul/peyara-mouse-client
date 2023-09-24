import { useRootNavigationState, Redirect } from "expo-router";

import OnBoarding from "../components/OnBoarding";

export default function App() {
  const rootNavigationState = useRootNavigationState();

  // wait for the root navigator to load correctly
  if (!rootNavigationState?.key) return null;

  return (
    <>
      <OnBoarding />
      {/* <Redirect href={"/home"} /> */}
    </>
  );
}
