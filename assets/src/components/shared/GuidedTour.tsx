import { useState, useEffect } from 'react';
import { Joyride, STATUS, type Step, type EventData } from 'react-joyride';

const TOUR_KEY = 'dailybrew_tour_completed';

const ownerSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Welcome to your dashboard! Here you can see today\'s attendance at a glance — who\'s present, late, on leave, or absent.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-employees"]',
    content: 'Manage your staff here. Add employees, assign them to shifts, and generate QR codes for check-in.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-attendance"]',
    content: 'View the full attendance log. Filter by date range to see who checked in and when.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-shifts"]',
    content: 'Create shifts like "Morning" or "Evening" with start and end times. Employees are assigned to shifts.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-settings"]',
    content: 'Configure your workspace — IP restriction, geofencing, timezone, and manage your Espresso plan.',
    placement: 'right',
  },
  {
    target: '[data-tour="add-employee"]',
    content: 'Start by adding your first employee! You\'ll be able to share a check-in link they can use to clock in.',
    placement: 'top',
  },
];

export function GuidedTour() {
  const [shouldRun, setShouldRun] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      const timer = setTimeout(() => setShouldRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEvent = (data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setShouldRun(false);
      localStorage.setItem(TOUR_KEY, 'true');
    }
  };

  if (!shouldRun) return null;

  return (
    <Joyride
      steps={ownerSteps}
      run={shouldRun}
      continuous
      onEvent={handleEvent}
      options={{
        primaryColor: '#6B4226',
        backgroundColor: '#FAF7F2',
        arrowColor: '#FAF7F2',
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        showProgress: true,
        buttons: ['back', 'close', 'primary', 'skip'],
      }}
      styles={{
        tooltip: {
          borderRadius: 14,
          padding: '20px 24px',
          fontSize: 13.5,
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
          color: '#2C2420',
        },
        buttonPrimary: {
          borderRadius: 8,
          fontSize: 13,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#7C6860',
          fontSize: 13,
        },
        buttonSkip: {
          color: '#AE9D95',
          fontSize: 12,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Got it',
        last: 'Get started!',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}
