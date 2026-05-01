import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useApiClient } from "./lib/useApiClient";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import DNAReport from "./pages/DNAReport";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import TopicMap from "./pages/TopicMap";
import SyllabusPage from "./pages/SyllabusPage";
import NotesPage from "./pages/NotesPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import AIChatPage from "./pages/AIChatPage";
import RankPredictorPage from "./pages/RankPredictorPage";
import MockTestPage from "./pages/MockTestPage";
import RevisionPage from "./pages/RevisionPage";
import DNAReportPage from "./pages/DNAReportPage";
// Auth Modals are handled in LandingPage

function Protected({ children }) {
  const { isSignedIn } = useApiClient();
  if (!isSignedIn) {
    return <Navigate to="/?auth=signin" replace />;
  }
  return children;
}

function resolveHomePath(payload) {
  return payload?.onboarding_completed ? "/home" : "/onboarding";
}

function SignedInHomeRedirect() {
  const { apiFetch, isLoaded, isSignedIn } = useApiClient();
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch("/api/users/me/");
        const payload = response.ok ? await response.json() : null;
        if (!active) return;
        if (!payload?.onboarding_completed) {
          setDestination("/onboarding");
          return;
        }
        const statsRes = await apiFetch("/api/users/stats/");
        const stats = statsRes.ok ? await statsRes.json() : null;
        if (!active) return;
        if (stats?.requires_premium_initial_quiz) {
          setDestination("/quiz?session_type=diagnostic");
          return;
        }
        setDestination(resolveHomePath(payload));
      } catch {
        if (!active) return;
        setDestination("/onboarding");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [apiFetch, isLoaded, isSignedIn]);

  if (!destination)
    return (
      <div
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
          padding: 24,
        }}
      >
        Loading...
      </div>
    );
  return <Navigate to={destination} replace />;
}

function SetupRequired({ children }) {
  const { apiFetch, isLoaded, isSignedIn } = useApiClient();
  const [state, setState] = useState({
    loaded: false,
    onboarding: false,
    mustQuiz: false,
  });

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    const load = async () => {
      try {
        const [meRes, statsRes] = await Promise.all([
          apiFetch("/api/users/me/"),
          apiFetch("/api/users/stats/"),
        ]);
        const payload = meRes.ok ? await meRes.json() : null;
        const stats = statsRes.ok ? await statsRes.json() : null;
        if (!active) return;
        setState({
          loaded: true,
          onboarding: Boolean(payload?.onboarding_completed),
          mustQuiz: Boolean(stats?.requires_premium_initial_quiz),
        });
      } catch {
        if (!active) return;
        setState({ loaded: true, onboarding: false, mustQuiz: false });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [apiFetch, isLoaded, isSignedIn]);

  if (!state.loaded)
    return (
      <div
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
          padding: 24,
        }}
      >
        Loading...
      </div>
    );
  if (!state.onboarding) return <Navigate to="/onboarding" replace />;
  if (state.mustQuiz && window.location.pathname !== "/quiz")
    return <Navigate to="/quiz?session_type=diagnostic" replace />;
  return children;
}

function OnboardingOnlyRoute() {
  const { apiFetch, isLoaded, isSignedIn } = useApiClient();
  const [completed, setCompleted] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    const load = async () => {
      try {
        const response = await apiFetch("/api/users/me/");
        const payload = response.ok ? await response.json() : null;
        if (!active) return;
        setCompleted(Boolean(payload?.onboarding_completed));
      } catch {
        if (!active) return;
        setCompleted(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [apiFetch, isLoaded, isSignedIn]);

  if (completed === null)
    return (
      <div
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
          padding: 24,
        }}
      >
        Loading...
      </div>
    );
  if (completed) return <Navigate to="/home" replace />;
  return <Onboarding />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/app"
        element={
          <Protected>
            <SignedInHomeRedirect />
          </Protected>
        }
      />
      <Route
        path="/sign-in/*"
        element={<Navigate to="/?auth=signin" replace />}
      />
      <Route
        path="/sign-up/*"
        element={<Navigate to="/?auth=signup" replace />}
      />
      <Route
        path="/onboarding"
        element={
          <Protected>
            <OnboardingOnlyRoute />
          </Protected>
        }
      />
      <Route
        path="/home"
        element={
          <Protected>
            <SetupRequired>
              <Home />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/quiz"
        element={
          <Protected>
            <SetupRequired>
              <Quiz />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <SetupRequired>
              <Dashboard />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <SetupRequired>
              <Profile />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/dna-report"
        element={
          <Protected>
            <SetupRequired>
              <DNAReport />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/plan"
        element={
          <Protected>
            <SetupRequired>
              <TopicMap />
            </SetupRequired>
          </Protected>
        }
      />
      <Route path="/topic-map" element={<Navigate to="/plan" replace />} />
      <Route
        path="/admin"
        element={
          <Protected>
            <AdminPanel />
          </Protected>
        }
      />
      <Route
        path="/syllabus"
        element={
          <Protected>
            <SetupRequired>
              <SyllabusPage />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/notes"
        element={
          <Protected>
            <SetupRequired>
              <NotesPage />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/study-plan"
        element={
          <Protected>
            <SetupRequired>
              <StudyPlanPage />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/mock-test"
        element={
          <Protected>
            <SetupRequired>
              <MockTestPage />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/revision"
        element={
          <Protected>
            <SetupRequired>
              <RevisionPage />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <Protected>
            <SetupRequired>
              <AIChatPage />
            </SetupRequired>
          </Protected>
        }
      />
      <Route
        path="/rank-predictor"
        element={
          <Protected>
            <SetupRequired>
              <RankPredictorPage />
            </SetupRequired>
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
