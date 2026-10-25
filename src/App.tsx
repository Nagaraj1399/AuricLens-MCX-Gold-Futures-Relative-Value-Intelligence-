/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { RouterProvider, usePathname } from "./lib/router";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { AnimatedGoldBackground } from "./components/AnimatedGoldBackground";

import DashboardPage from "./app/page";
import SpreadsPage from "./app/spreads/page";
import SignalsPage from "./app/signals/page";
import ContractsPage from "./app/contracts/page";
import CalendarPage from "./app/calendar/page";
import BacktestPage from "./app/backtest/page";
import DataPage from "./app/data/page";
import SettingsPage from "./app/settings/page";

function RouteView() {
  const pathname = usePathname();

  switch (pathname) {
    case "/spreads":
      return <SpreadsPage />;
    case "/signals":
      return <SignalsPage />;
    case "/contracts":
      return <ContractsPage />;
    case "/calendar":
      return <CalendarPage />;
    case "/backtest":
      return <BacktestPage />;
    case "/data":
      return <DataPage />;
    case "/settings":
      return <SettingsPage />;
    case "/":
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <div className="bg-[#FAF8F5] text-slate-800 min-h-screen flex flex-col antialiased relative selection:bg-amber-200 selection:text-amber-900 font-sans">
        <AnimatedGoldBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto space-y-6">
                <RouteView />
              </div>
            </main>
          </div>
        </div>
      </div>
    </RouterProvider>
  );
}
