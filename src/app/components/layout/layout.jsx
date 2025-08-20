/* eslint-disable no-unused-vars */
"use client";

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/sidebar.jsx"; // adjust path if needed

const Layout = ({ user, handleLogout }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar  />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet /> {/* <-- where your page content will render */}
      </main>
    </div>
  );
};

export default Layout;
