import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { LifeSimulator } from "./components/LifeSimulator";
import { PortfolioXRay } from "./components/PortfolioXRay";
import { AIMentor } from "./components/AIMentor";
import { CouplePlanner } from "./components/CouplePlanner";
import { TaxWizard } from "./components/TaxWizard";
import { RiskAlerts } from "./components/RiskAlerts";
import { ProfilePage } from "./components/ProfilePage";
import { GoalOptimizer } from "./components/GoalOptimizer";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "portfolio", Component: PortfolioXRay },
      { path: "simulator", Component: LifeSimulator },
      { path: "mentor", Component: AIMentor },
      { path: "couple", Component: CouplePlanner },
      { path: "tax", Component: TaxWizard },
      { path: "alerts", Component: RiskAlerts },
      { path: "profile", Component: ProfilePage },
      { path: "goals", Component: GoalOptimizer },
    ],
  },
]);
