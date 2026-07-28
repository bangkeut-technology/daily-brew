"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Joyride, STATUS, type EventData, type Step } from "react-joyride";

const TOUR_KEY = "dailybrew_tour_completed";

/**
 * First-run spotlight tour for new owners. Runs once, then records completion
 * in localStorage — the same key the legacy SPA uses, so an owner who already
 * took the tour there isn't shown it again after the cutover.
 *
 * Targets are `data-tour` attributes on the sidebar nav and the dashboard.
 * Joyride skips a step whose target is missing, so a manager (whose nav omits
 * Shifts and Settings) simply gets a shorter tour rather than a broken one.
 */
export function GuidedTour() {
  const { t } = useTranslation();
  const [shouldRun, setShouldRun] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return;
    // Let the dashboard's data land first — the tour spotlights the stats
    // grid, which is a skeleton for the first moment.
    const timer = setTimeout(() => setShouldRun(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRun) return null;

  const steps: Step[] = [
    {
      target: '[data-tour="dashboard"]',
      content: t(
        "tour.dashboard",
        "Welcome to your dashboard! Here you can see today's attendance at a glance — who's present, late, on leave, or absent.",
      ),
      placement: "bottom",
    },
    {
      target: '[data-tour="nav-employees"]',
      content: t(
        "tour.employees",
        "Manage your staff here. Add employees, assign them to shifts, and generate QR codes for check-in.",
      ),
      placement: "right",
    },
    {
      target: '[data-tour="nav-attendance"]',
      content: t(
        "tour.attendance",
        "View the full attendance log. Filter by date range to see who checked in and when.",
      ),
      placement: "right",
    },
    {
      target: '[data-tour="nav-shifts"]',
      content: t(
        "tour.shifts",
        'Create shifts like "Morning" or "Evening" with start and end times. Employees are assigned to shifts.',
      ),
      placement: "right",
    },
    {
      target: '[data-tour="nav-settings"]',
      content: t(
        "tour.settings",
        "Configure your workspace — IP restriction, geofencing, timezone, and manage your Espresso plan.",
      ),
      placement: "right",
    },
    {
      target: '[data-tour="add-employee"]',
      content: t(
        "tour.addEmployee",
        "Start by adding your first employee! You'll be able to share a check-in link they can use to clock in.",
      ),
      placement: "top",
    },
  ];

  const handleEvent = (data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setShouldRun(false);
      localStorage.setItem(TOUR_KEY, "true");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={shouldRun}
      continuous
      onEvent={handleEvent}
      options={{
        primaryColor: "#6B4226",
        backgroundColor: "#FAF7F2",
        arrowColor: "#FAF7F2",
        overlayColor: "rgba(0, 0, 0, 0.4)",
        showProgress: true,
        buttons: ["back", "close", "primary", "skip"],
      }}
      styles={{
        tooltip: {
          borderRadius: 14,
          padding: "20px 24px",
          fontSize: 13.5,
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
          color: "#2C2420",
        },
        buttonPrimary: { borderRadius: 8, fontSize: 13, padding: "8px 16px" },
        buttonBack: { color: "#7C6860", fontSize: 13 },
        buttonSkip: { color: "#AE9D95", fontSize: 12 },
      }}
      locale={{
        back: t("tour.back", "Back"),
        close: t("tour.close", "Got it"),
        last: t("tour.last", "Get started!"),
        next: t("tour.next", "Next"),
        skip: t("tour.skip", "Skip tour"),
      }}
    />
  );
}
