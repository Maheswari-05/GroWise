import { useState, useEffect } from "react";
import supabase from "./lib/supabase";
import LandingPage from "./features/landing/LandingPage";
import RoleSelector from "./features/auth/RoleSelector";
import ForgotPassword from "./features/auth/ForgotPassword";
import Login from "./features/student/Login";
import ResetPassword from "./features/student/ResetPassword";
import TeacherLogin from "./features/teacher/TeacherLogin";
import TeacherResetPassword from "./features/teacher/ResetPassword";
import StudentDashboard from "./features/student/StudentDashboard";
import TeacherDashboard from "./features/teacher-dashboard/TeacherDashboard";
import AdminLogin from "./features/admin/AdminLogin";
import AdminDashboard from "./features/admin/AdminDashboard";
import ContactPage from "./features/contact/ContactPage";

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [route, setRoute] = useState(window.location.hash);
  // Live role guard: only renders a dashboard after verifying the current
  // Supabase session maps to a row in the matching role table.
  const [guard, setGuard] = useState({ view: null, loading: false, ok: false });
  // Bumped to force a live re-verification when re-entering the same protected
  // view (e.g. logging in while already sitting on that dashboard's login).
  const [guardNonce, setGuardNonce] = useState(0);

  useEffect(() => {
    const onHashChange = () => {
      const fullHash = window.location.hash;
      const fullUrl = window.location.href;
      setRoute(fullHash);
      
      const hashPath = fullHash.split('?')[0];
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get("role");
      
      console.log("🔍 Route detected - Hash:", fullHash, "Full URL:", fullUrl);
      
      // 1. Check for password reset or auth token in URL (search or hash)
      //    Also catches the "stripped" URL case: Supabase SDK processes the token
      //    BEFORE this handler fires, leaving just ?role=teacher# or ?role=student#
      const isAuthRedirect =
        fullUrl.includes("access_token") || 
        /[?&]code=/.test(fullUrl) || 
        fullUrl.includes("type=recovery") ||
        fullUrl.includes("error=") ||
        fullHash.includes("reset-password") ||
        roleParam === "teacher" ||
        roleParam === "student";

      if (isAuthRedirect) {
        // If the user has explicitly navigated to a normal login/dashboard
        // route, honor that over the lingering ?role= reset param so the
        // reset view doesn't get stuck after a successful password change.
        const explicitDestination = ["#/login", "#/teacher", "#/role-selector", "#/dashboard", "#/teacher-dashboard", "#/admin-dashboard"].some(p => hashPath.startsWith(p));
        if (!explicitDestination) {
          if (roleParam === "teacher" || fullUrl.includes("teacher-reset-password")) {
            console.log("👨‍🏫 Teacher reset password route activated");
            setCurrentView("teacher-reset-password");
          } else {
            console.log("👤 Student reset password route activated");
            setCurrentView("reset-password");
          }
          return;
        }
      }

      
      // 2. Synchronize standard navigation hash
      if (hashPath === "#/role-selector") {
        setCurrentView("role-selector");
      } else if (hashPath === "#/admin") {
        setCurrentView("admin-login");
      } else if (hashPath === "#/admin-dashboard") {
        setCurrentView("admin-dashboard");
      } else if (hashPath === "#/teacher-dashboard") {
        setCurrentView("teacher-dashboard");
      } else if (hashPath === "#/teacher") {
        setCurrentView("teacher-login");
      } else if (hashPath === "#/teacher-reset-password") {
        setCurrentView("teacher-reset-password");
      } else if (hashPath === "#/teacher-forgot-password") {
        setCurrentView("teacher-forgot-password");
      } else if (hashPath === "#/login") {
        setCurrentView("login");
      } else if (hashPath === "#/forgot-password") {
        setCurrentView("forgot-password");
      } else if (hashPath === "#/reset-password") {
        setCurrentView("reset-password");
      } else if (hashPath === "#/dashboard") {
        setCurrentView("dashboard");
      } else if (hashPath === "#/contact") {
        setCurrentView("contact");
      }
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    // Initial run
    onHashChange();
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  // Harden dashboard access: when one of the protected views becomes active,
  // verify the live Supabase session maps to a real row in the matching role
  // table before allowing the dashboard to render. This replaces the previous
  // soft localStorage-flag guards.
  useEffect(() => {
    const view = currentView;
    const protectedViews = ["admin-dashboard", "teacher-dashboard", "dashboard"];
    if (!protectedViews.includes(view)) {
      setGuard({ view: null, loading: false, ok: false });
      return;
    }

    let cancelled = false;
    setGuard({ view, loading: true, ok: false });

    (async () => {
      let ok = false;
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          const email = (user.email || "").trim().toLowerCase();
          if (view === "admin-dashboard") {
            const { data: row } = await supabase
              .from("admin_profiles")
              .select("id")
              .eq("id", user.id)
              .maybeSingle();
            ok = !!row && row.id === user.id;
          } else if (view === "teacher-dashboard") {
            const { data: row } = await supabase
              .from("teachers")
              .select("id")
              .ilike("email", email)
              .maybeSingle();
            ok = !!row;
          } else if (view === "dashboard") {
            const { data: row } = await supabase
              .from("students")
              .select("id")
              .ilike("email", email)
              .maybeSingle();
            ok = !!row;
          }
        }
      } catch (e) {
        ok = false;
      }
      if (!cancelled) {
        setGuard({ view, loading: false, ok });
      }
    })();

    return () => { cancelled = true; };
  }, [currentView, guardNonce]);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === "landing") {
      window.location.hash = "";
    } else if (view === "role-selector") {
      window.location.hash = "/role-selector";
    } else if (view === "contact") {
      window.location.hash = "/contact";
    } else if (view === "admin-login") {
      window.location.hash = "/admin";
    } else if (view === "teacher-login") {
      window.location.hash = "/teacher";
    } else if (view === "teacher-reset-password") {
      window.location.hash = "/teacher-reset-password";
    } else if (view === "teacher-forgot-password") {
      window.location.hash = "/teacher-forgot-password";
    } else if (view === "login") {
      window.location.hash = "/login";
    } else if (view === "forgot-password") {
      window.location.hash = "/forgot-password";
    } else if (view === "reset-password") {
      window.location.hash = "/reset-password";
    } else if (view === "admin-dashboard") {
      window.location.hash = "/admin-dashboard";
      if (currentView === "admin-dashboard") setGuardNonce((n) => n + 1);
    } else if (view === "dashboard") {
      window.location.hash = "/dashboard";
      if (currentView === "dashboard") setGuardNonce((n) => n + 1);
    } else if (view === "teacher-dashboard") {
      window.location.hash = "/teacher-dashboard";
      if (currentView === "teacher-dashboard") setGuardNonce((n) => n + 1);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Inspect full URL for reset parameters
  const fullUrl = window.location.href;
  const searchParams = new URLSearchParams(window.location.search);
  const roleParam = searchParams.get("role");

  // isResetUrl: detect all Supabase auth redirect patterns.
  // IMPORTANT: When the Supabase SDK processes the hash (access_token, type=recovery etc.)
  // BEFORE React reads it, the URL gets stripped to just ?role=teacher# or ?role=student#.
  // So we ALSO treat any ?role=teacher / ?role=student query param as a reset-password signal,
  // since that param is ONLY ever set by our sendPasswordInviteEmail redirectTo URL.
  const isResetUrl = 
    fullUrl.includes("access_token") || 
    fullUrl.includes("type=recovery") ||
    fullUrl.includes("error=") ||
    route.includes("reset-password") ||
    // ?code= must only match actual auth codes, not other query params named 'code'
    /[?&]code=/.test(fullUrl) ||
    // ?role=teacher or ?role=student only appears in our password setup redirect URLs
    roleParam === "teacher" ||
    roleParam === "student";

  const isTeacherReset = roleParam === "teacher" || fullUrl.includes("teacher-reset-password") || currentView === "teacher-reset-password";

  // Priority 1: Password Reset Routes
  if (isResetUrl) {
    if (isTeacherReset) {
      return <TeacherResetPassword onNavigate={navigateTo} />;
    }
    return <ResetPassword onNavigate={navigateTo} />;
  }

  // Priority 2: Standard Views
  const hashPath = route.split('?')[0];

  if (hashPath === "#/role-selector" || currentView === "role-selector") {
    return <RoleSelector onNavigate={navigateTo} />;
  }

  if (hashPath === "#/admin" || currentView === "admin-login") {
    return <AdminLogin onNavigate={navigateTo} />;
  }

  if (currentView === "login" || hashPath === "#/login") {
    return <Login onNavigate={navigateTo} />;
  }

  if (currentView === "forgot-password" || hashPath === "#/forgot-password") {
    return <ForgotPassword role="student" onNavigate={navigateTo} />;
  }

  if (currentView === "reset-password" || hashPath === "#/reset-password") {
    return <ResetPassword onNavigate={navigateTo} />;
  }

  if (hashPath === "#/teacher" || currentView === "teacher-login") {
    return <TeacherLogin onNavigate={navigateTo} />;
  }

  if (currentView === "teacher-forgot-password" || hashPath === "#/teacher-forgot-password") {
    return <ForgotPassword role="teacher" onNavigate={navigateTo} />;
  }

  if (currentView === "teacher-reset-password" || hashPath === "#/teacher-reset-password") {
    return <TeacherResetPassword onNavigate={navigateTo} />;
  }

  // Soft route guards: if a dashboard is opened directly without a session
  // marker, send the user to the matching login instead of rendering an
  // empty dashboard. Teacher/admin use localStorage markers; the student
  // dashboard already guards itself against a missing Supabase session.
  if (hashPath === "#/admin-dashboard" || currentView === "admin-dashboard") {
    if (guard.view !== "admin-dashboard") {
      return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#64748b", fontFamily: "inherit" }}>Checking admin access…</div>;
    }
    if (guard.ok) {
      return <AdminDashboard onNavigate={navigateTo} />;
    }
    return <AdminLogin onNavigate={navigateTo} />;
  }

  if (hashPath === "#/teacher-dashboard" || currentView === "teacher-dashboard") {
    if (guard.view !== "teacher-dashboard") {
      return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#64748b", fontFamily: "inherit" }}>Checking teacher access…</div>;
    }
    if (guard.ok) {
      return <TeacherDashboard onNavigate={navigateTo} />;
    }
    return <TeacherLogin onNavigate={navigateTo} />;
  }

  if (currentView === "dashboard" || hashPath === "#/dashboard") {
    if (guard.view !== "dashboard") {
      return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#64748b", fontFamily: "inherit" }}>Checking student access…</div>;
    }
    if (guard.ok) {
      return <StudentDashboard onNavigate={navigateTo} />;
    }
    return <Login onNavigate={navigateTo} />;
  }

  if (currentView === "contact" || hashPath === "#/contact") {
    return <ContactPage onNavigate={navigateTo} />;
  }

  return <LandingPage onNavigate={navigateTo} />;
}

export default App;