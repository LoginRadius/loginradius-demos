import { Navigate, Route, Routes } from "react-router-dom";
import {
  LoginRadiusProvider,
  OrgContextProvider,
} from "@loginradius/loginradius-react";

import { LOGIN_RADIUS_OPTIONS } from "./config/features.js";
import { Home } from "./pages/Home.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { Dashboard } from "./pages/admin/Dashboard.jsx";
import { Users } from "./pages/admin/Users.jsx";
import { Roles } from "./pages/admin/Roles.jsx";
import { Invitations } from "./pages/admin/Invitations.jsx";
import { Connections } from "./pages/admin/Connections.jsx";
import { Domains } from "./pages/admin/Domains.jsx";
import { Scim } from "./pages/admin/Scim.jsx";
import { Security } from "./pages/admin/Security.jsx";
import { Settings } from "./pages/admin/Settings.jsx";
import { Danger } from "./pages/admin/Danger.jsx";
import { Contacts } from "./pages/admin/Contacts.jsx";
import { Deals } from "./pages/admin/Deals.jsx";
import { Reports } from "./pages/admin/Reports.jsx";
import { Profile } from "./pages/admin/Profile.jsx";

export default function App() {
  return (
    <LoginRadiusProvider options={LOGIN_RADIUS_OPTIONS}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <OrgContextProvider>
                <AdminLayout />
              </OrgContextProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="invitations" element={<Invitations />} />
          <Route path="connections" element={<Connections />} />
          <Route path="domains" element={<Domains />} />
          <Route path="scim" element={<Scim />} />
          <Route path="security" element={<Security />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="deals" element={<Deals />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="danger" element={<Danger />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </LoginRadiusProvider>
  );
}
