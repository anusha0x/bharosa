import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { HomePage } from "./components/HomePage";
import { LoginPage } from "./components/LoginPage";
import { StudentDetailsForm } from "./components/StudentDetailsForm";
import { EligibilityDashboard } from "./components/EligibilityDashboard";
import { ScholarshipDetailPage } from "./components/ScholarshipDetailPage";
import { DocumentUploadPage } from "./components/DocumentUploadPage";
import { ApplicationTracker } from "./components/ApplicationTracker";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage },
      { path: "student-details", Component: StudentDetailsForm },
      { path: "scholarships", Component: EligibilityDashboard },
      { path: "scholarship/:id", Component: ScholarshipDetailPage },
      { path: "documents", Component: DocumentUploadPage },
      { path: "applications", Component: ApplicationTracker },
    ],
  },
]);
