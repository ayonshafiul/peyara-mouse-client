import { useRootNavigationState, Redirect } from "expo-router";
import Onboarding from "../components/Onboarding";

export default function App() {
  const rootNavigationState = useRootNavigationState();

  // wait for the root navigator to load correctly
  if (!rootNavigationState?.key) return null;

  return (
    <>
      <Onboarding />
      {/* <Redirect href={"/home"} /> */}
    </>
  );
}
