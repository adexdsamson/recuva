/* eslint-disable react-refresh/only-export-components */
import { Dashboard } from "@/layouts/Dashboard";
import { ErrorFallback } from "@/components/layouts/Error";
import { ProtectedRoute } from "./PrivateRoute";
import { Route } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { NotFound } from "@/layouts/NotFound";
import { PublicRoute } from "./PublicRoute";
import { Login } from "@/pages/Login";
import { DashboardPage } from "@/pages/DashboardPage";
import { ContactImport } from '@/pages/ContactImport';
import { Message } from '@/pages/Message';
import { Detail } from "@/pages/Detail";
import { Confirmation } from "@/pages/Confirmation";
import { IdentityVerification } from "@/pages/IdentityVerification";
import { BlankLayout } from "@/layouts/Blank";
import { FaceVerification } from "@/pages/FaceVerification";
import { IDVerification } from '@/pages/IDVerification';
import { UtilityVerification } from "@/pages/UtilityVerification";
import { AccountDetail } from "@/pages/AccountDetail";

const privateRoutes = [
  { path: "/dashboard/home", element: <DashboardPage /> },
  { path: "/dashboard/contact-import", element: <ContactImport /> },
  { path: "/dashboard/message-import", element: <Message /> },
  { path: "/dashboard/campaign-detail", element: <Detail /> },
  { path: "/dashboard/confirm-campaign", element: <Confirmation /> },
  { path: "/dashboard/campaign-account-detail", element: <AccountDetail /> },
];

const publicRoute = [
  { path: "/", element: <Login /> },
];

const IdentityRoute = [
  { path: "/verification", element: <IdentityVerification /> },
  { path: "/verification/face-identity", element: <FaceVerification /> },
  { path: "/verification/id-identity", element: <IDVerification /> },
  { path: "/verification/utility-bills", element: <UtilityVerification /> },
];

export const routes = (
  <>
    <Route path="/" element={<AuthLayout />} errorElement={<NotFound />}>
      {publicRoute.map((item, index) => (
        <Route
          key={index}
          path={item.path}
          element={<PublicRoute key={index}>{item.element}</PublicRoute>}
        />
      ))}
    </Route>

    <Route
      path="/verification"
      element={<BlankLayout />}
      errorElement={<NotFound />}
    >
      {IdentityRoute.map((item, index) => (
        <Route
          key={index}
          path={item.path}
          element={<PublicRoute key={index}>{item.element}</PublicRoute>}
        />
      ))}
    </Route>

    <Route
      path="/dashboard"
      errorElement={<ErrorFallback />}
      element={<Dashboard />}
    >
      {privateRoutes.map((item, index) => (
        <Route
          key={index}
          path={item.path}
          element={<ProtectedRoute key={index}>{item.element}</ProtectedRoute>}
        />
      ))}
    </Route>
  </>
);
