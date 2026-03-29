import { RouterProvider } from "react-router";
import { router } from "./routes";
import { UserDataProvider, useUserData } from "./context/UserDataContext";
import { Onboarding } from "./components/Onboarding";

function AppInner() {
  const { userData } = useUserData();
  if (!userData) return <Onboarding />;
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <UserDataProvider>
      <AppInner />
    </UserDataProvider>
  );
}
