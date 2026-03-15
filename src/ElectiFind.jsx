import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  apiRequest,
  normalizeCourseForUi,
  GLOBAL_CSS,
  Sidebar,
  TopBar,
  LandingPage,
  AuthPage,
  DashboardPage,
  QuestionnairePage,
  RecommendationsPage,
  CourseDetailPage,
  AIInsightPanel,
  ComparePage,
  CommunityPage,
  MyElectivesPage,
  ProfilePage,
  courses
} from "./pages";

const DASHBOARD_PAGES = ["dashboard", "questionnaire", "recommendations", "compare", "community", "my-electives", "profile", "course-detail", "ai-insight"];

const PAGE_TO_PATH = {
  landing: "/",
  login: "/login",
  dashboard: "/dashboard",
  questionnaire: "/questionnaire",
  recommendations: "/recommendations",
  compare: "/compare",
  community: "/community",
  "my-electives": "/my-electives",
  profile: "/profile",
  "course-detail": "/course-detail",
  "ai-insight": "/ai-insight"
};

function pageFromPath(pathname) {
  const entry = Object.entries(PAGE_TO_PATH).find(([, path]) => path === pathname);
  return entry ? entry[0] : "landing";
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = pageFromPath(location.pathname);
  const [activeCourse, setActiveCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [dashboardCourses, setDashboardCourses] = useState(courses);
  const [recommendationCourses, setRecommendationCourses] = useState(courses);
  const [compareCourses, setCompareCourses] = useState(courses);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  const isDashboard = DASHBOARD_PAGES.includes(page);

  const setPage = (nextPage) => {
    navigate(PAGE_TO_PATH[nextPage] || PAGE_TO_PATH.landing);
  };

  const loadDashboardBundle = async () => {
    if (!localStorage.getItem("electifind_token")) return;
    setLoadingData(true);
    try {
      const [dashboard, recs, compare] = await Promise.all([
        apiRequest("/api/dashboard"),
        apiRequest("/api/recommendations"),
        apiRequest("/api/compare")
      ]);

      const mappedDashboardCourses = (dashboard?.recommendations || [])
        .map((c) => normalizeCourseForUi(c))
        .filter(Boolean);
      const mappedRecommendationCourses = (recs || [])
        .map((r) => normalizeCourseForUi(r.course, { match: r.match_score, seats: r.seats_left }))
        .filter(Boolean);
      const mappedCompareCourses = (compare || [])
        .map((c) => normalizeCourseForUi(c))
        .filter(Boolean);

      if (mappedDashboardCourses.length) setDashboardCourses(mappedDashboardCourses);
      if (mappedRecommendationCourses.length) setRecommendationCourses(mappedRecommendationCourses);
      if (mappedCompareCourses.length) setCompareCourses(mappedCompareCourses);
      setDashboardStats(dashboard?.stats || null);
    } catch {
      // Keep fallback data when API calls fail.
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("electifind_token");
    if (!token) return;
    apiRequest("/api/profile")
      .then((u) => {
        setUser(u);
        if (page === "landing" || page === "login") {
          setPage("dashboard");
        }
        loadDashboardBundle();
      })
      .catch(() => {
        localStorage.removeItem("electifind_token");
      });
  }, []);

  useEffect(() => {
    if (DASHBOARD_PAGES.includes(page) && !localStorage.getItem("electifind_token")) {
      navigate(PAGE_TO_PATH.login, { replace: true });
    }
  }, [page, navigate]);

  useEffect(() => {
    if (!localStorage.getItem("electifind_token")) return;
    if (["dashboard", "recommendations", "compare"].includes(page)) {
      loadDashboardBundle();
    }
  }, [page]);

  const setPageGuarded = (nextPage) => {
    if (DASHBOARD_PAGES.includes(nextPage) && !localStorage.getItem("electifind_token")) {
      navigate(PAGE_TO_PATH.login);
      return;
    }
    navigate(PAGE_TO_PATH[nextPage] || PAGE_TO_PATH.landing);
  };

  const renderPage = () => {
    switch (page) {
      case "landing": return <LandingPage setPage={setPageGuarded} />;
      case "login": return <AuthPage setPage={setPageGuarded} onAuthSuccess={(u) => { setUser(u); loadDashboardBundle(); }} />;
      case "dashboard": return <DashboardPage setPage={setPageGuarded} setActiveCourse={setActiveCourse} coursesData={dashboardCourses} statsData={dashboardStats} loading={loadingData} />;
      case "questionnaire": return <QuestionnairePage setPage={setPageGuarded} />;
      case "recommendations": return <RecommendationsPage setPage={setPageGuarded} setActiveCourse={setActiveCourse} recommendationsData={recommendationCourses} loading={loadingData} />;
      case "compare": return <ComparePage setPage={setPageGuarded} coursesData={compareCourses} loading={loadingData} />;
      case "community": return <CommunityPage setPage={setPageGuarded} />;
      case "my-electives": return <MyElectivesPage setPage={setPageGuarded} />;
      case "profile": return <ProfilePage setPage={setPageGuarded} userData={user} onUserUpdate={setUser} />;
      case "course-detail": return <CourseDetailPage course={activeCourse} setPage={setPageGuarded} />;
      case "ai-insight": return (
        <div>
          <TopBar title="AI Insights" setPage={setPageGuarded} />
          <div style={{ padding: "36px 40px" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>EXPLAINABLE AI</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, marginBottom: 28 }}>Why We Recommended This</h2>
            <AIInsightPanel course={activeCourse || recommendationCourses[0] || courses[0]} />
          </div>
        </div>
      );
      default: return <LandingPage setPage={setPageGuarded} />;
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {isDashboard ? (
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar activePage={page} setPage={setPageGuarded} />
          <main style={{ flex: 1, marginLeft: 220, minHeight: "100vh", background: "var(--navy)" }}>
            {renderPage()}
          </main>
        </div>
      ) : (
        renderPage()
      )}
    </>
  );
}
