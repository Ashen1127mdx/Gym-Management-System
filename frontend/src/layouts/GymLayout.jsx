import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../member/jsx/Sidebar";
import "../../member/css/Sidebar.css";
import "./GymLayout.css";

export default function GymLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main">
                <Outlet />
            </div>
        </div>
    );
}
