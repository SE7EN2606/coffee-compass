import { Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Bypass authentication - directly render the component
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
