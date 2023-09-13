import { useRootNavigationState, Redirect } from "expo-router";

export default function App() {
  const rootNavigationState = useRootNavigationState();

  // wait for the root navigator to load correctly
  if (!rootNavigationState?.key) return null;

  return <Redirect href={"/home"} />;
}
