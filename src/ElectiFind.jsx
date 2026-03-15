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
  const [compareSelection, setCompareSelection] = useState([]);
  const [recommendationHistory, setRecommendationHistory] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [questionnaireStatus, setQuestionnaireStatus] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  const isDashboard = DASHBOARD_PAGES.includes(page);

  const setPage = (nextPage) => {
    navigate(PAGE_TO_PATH[nextPage] || PAGE_TO_PATH.landing);
  };

  const addCompareCourse = (course) => {
    const code = String(course?.code || course?.id || "");
    if (!code) return;
    setCompareSelection((prev) => {
      if (prev.includes(code)) return prev;
      return [...prev, code].slice(-3);
    });
  };

  const removeCompareCourse = (course) => {
    const code = String(course?.code || course?.id || "");
    setCompareSelection((prev) => prev.filter((c) => c !== code));
  };

  const loadDashboardBundle = async () => {
    if (!localStorage.getItem("electifind_token")) return;
    setLoadingData(true);
    try {
      const compareQuery = compareSelection.length
        ? `/api/compare?courses=${encodeURIComponent(compareSelection.join(","))}`
        : "/api/compare";
      const [dashboard, recs, compare, history, qStatus] = await Promise.all([
        apiRequest("/api/dashboard"),
        apiRequest("/api/recommendations"),
        apiRequest(compareQuery),
        apiRequest("/api/recommendations/history"),
        apiRequest("/api/questionnaire/status")
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
      if (mappedRecommendationCourses.length) {
        setRecommendationCourses(mappedRecommendationCourses);
        if (!compareSelection.length) {
          setCompareSelection(mappedRecommendationCourses.slice(0, 3).map((c) => c.code));
        }
      }
      if (mappedCompareCourses.length) setCompareCourses(mappedCompareCourses);
      setRecommendationHistory(Array.isArray(history) ? history : []);
      setDashboardStats(dashboard?.stats || null);
      setQuestionnaireStatus(qStatus || null);
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
  }, [page, compareSelection.join(",")]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 960;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const setPageGuarded = (nextPage) => {
    if (DASHBOARD_PAGES.includes(nextPage) && !localStorage.getItem("electifind_token")) {
      navigate(PAGE_TO_PATH.login);
      return;
    }
    if (isMobile) setSidebarOpen(false);
    navigate(PAGE_TO_PATH[nextPage] || PAGE_TO_PATH.landing);
  };

  const topBarProps = {
    onLogout: () => {
      localStorage.removeItem("electifind_token");
      setUser(null);
      setQuestionnaireStatus(null);
      setPage("login");
    },
    showMenuButton: isMobile,
    onToggleMenu: () => setSidebarOpen((v) => !v)
  };

  const renderPage = () => {
    switch (page) {
      case "landing": return <LandingPage setPage={setPageGuarded} />;
      case "login": return <AuthPage setPage={setPageGuarded} onAuthSuccess={(u) => { setUser(u); loadDashboardBundle(); }} />;
      case "dashboard": return <DashboardPage setPage={setPageGuarded} setActiveCourse={setActiveCourse} coursesData={dashboardCourses} statsData={dashboardStats} loading={loadingData} topBarProps={topBarProps} onAddCompare={addCompareCourse} userName={user?.name || "Student"} questionnaireStatus={questionnaireStatus} />;
      case "questionnaire": return <QuestionnairePage setPage={setPageGuarded} topBarProps={topBarProps} recommendationHistory={recommendationHistory} onSubmitted={loadDashboardBundle} />;
      case "recommendations": return <RecommendationsPage setPage={setPageGuarded} setActiveCourse={setActiveCourse} recommendationsData={recommendationCourses} loading={loadingData} topBarProps={topBarProps} onAddCompare={addCompareCourse} />;
      case "compare": return <ComparePage setPage={setPageGuarded} coursesData={compareCourses} loading={loadingData} topBarProps={topBarProps} onRemoveCompare={removeCompareCourse} onClearCompare={() => setCompareSelection([])} />;
      case "community": return <CommunityPage setPage={setPageGuarded} topBarProps={topBarProps} />;
      case "my-electives": return <MyElectivesPage setPage={setPageGuarded} topBarProps={topBarProps} recommendationHistory={recommendationHistory} />;
      case "profile": return <ProfilePage setPage={setPageGuarded} userData={user} onUserUpdate={setUser} topBarProps={topBarProps} />;
      case "course-detail": return <CourseDetailPage course={activeCourse} setPage={setPageGuarded} topBarProps={topBarProps} onAddCompare={addCompareCourse} />;
      case "ai-insight": return (
        <div>
          <TopBar title="AI Insights" setPage={setPageGuarded} {...topBarProps} />
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
          {isMobile && sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 90 }}
            />
          )}
          <Sidebar activePage={page} setPage={setPageGuarded} isMobile={isMobile} isOpen={isMobile ? sidebarOpen : true} onClose={() => setSidebarOpen(false)} />
          <main style={{ flex: 1, marginLeft: isMobile ? 0 : 220, minHeight: "100vh", background: "var(--navy)" }}>
            {renderPage()}
          </main>
        </div>
      ) : (
        renderPage()
      )}
    </>
  );
}
