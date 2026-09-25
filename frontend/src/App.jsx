import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./components/AppLayout";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import RiskAlerts from "./pages/RiskAlerts";
import Analytics from "./pages/Analytics";
import ScenarioSimulator from "./pages/ScenarioSimulator";
import AIAssistant from "./pages/AIAssistant";
import Geography from "./pages/Geography";
import Reports from "./pages/Reports";
import Administration from "./pages/Administration";
import Profile from "./pages/Profile";
import Login from "./pages/Login";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================================
            LOGIN
            ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =====================================================
            MAIN APPLICATION
            ===================================================== */}

        <Route element={<AppLayout />}>

          {/* Default */}
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />


          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* Project Register */}
          <Route
            path="/projects"
            element={<Projects />}
          />


          {/* Project Detail
              IMPORTANT:
              This route ONLY matches URLs such as
              /projects/P1001
          */}
          <Route
            path="/projects/:projectId"
            element={<ProjectDetail />}
          />


          {/* Risk Alerts */}
          <Route
            path="/risk-alerts"
            element={<RiskAlerts />}
          />


          {/* Analytics */}
          <Route
            path="/analytics"
            element={<Analytics />}
          />


          {/* Scenario Simulator */}
          <Route
            path="/scenario-simulator"
            element={<ScenarioSimulator />}
          />


          {/* AI Assistant */}
          <Route
            path="/ai-assistant"
            element={<AIAssistant />}
          />


          {/* Geography */}
          <Route
            path="/geography"
            element={<Geography />}
          />


          {/* Reports */}
          <Route
            path="/reports"
            element={<Reports />}
          />


          {/* Administration */}
          <Route
            path="/administration"
            element={<Administration />}
          />


          {/* Profile */}
          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>


        {/* =====================================================
            UNKNOWN ROUTES
            ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;