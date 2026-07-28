import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GymLayout from "./layouts/GymLayout";
import Home from "./pages/Home";
import MembersDirectory from "../member/jsx/MembersDirectory";
import MembershipPlans from "./pages/MembershipPlans";
import Trainers from "./pages/Trainers";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GymLayout />}>
          <Route index element={<Home />} />
          <Route path="members" element={<MembersDirectory />} />
          <Route path="membership-plans" element={<MembershipPlans />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

