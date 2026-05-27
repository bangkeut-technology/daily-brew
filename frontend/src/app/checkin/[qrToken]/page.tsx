"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { LogIn, MapPin, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useCheckinStatus, useCheckinAction } from "@/hooks/useCheckin";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-10">
      <p className="mb-8 font-sans text-[13px] font-medium uppercase tracking-[2px] text-text-tertiary">
        DailyBrew
      </p>
      {children}
    </div>
  );
}

export default function CheckinPage({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = use(params);
  const { t } = useTranslation();
  const { status: authStatus } = useAuth();
  const { data, isLoading, error, refetch } = useCheckinStatus(qrToken);
  const checkinAction = useCheckinAction(qrToken);

  const [actionResult, setActionResult] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => setGeoError(err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleCheckin = async () => {
    setActionError(null);
    try {
      const result = await checkinAction.mutateAsync(coords ?? undefined);
      setActionResult(result.checkOutAt ? "Checked out" : "Checked in");
      refetch();
    } catch (err) {
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      const message = err instanceof AxiosError ? err.response?.data?.message : undefined;
      if (status === 401) setActionError("Please sign in to check in.");
      else if (status === 403 && message?.includes("same device")) setActionError(t("checkin.deviceMismatch", "Use the same device you checked in with."));
      else if (status === 403 && message?.includes("already been used")) setActionError(t("checkin.deviceAlreadyUsed", "This device was already used by another employee today."));
      else setActionError(message || "Check-in failed.");
    }
  };

  if (authStatus === "unauthenticated") {
    return (
      <Shell>
        <div className="w-full max-w-xs space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-amber/20 bg-amber/10 px-5 py-4">
            <LogIn size={18} className="mt-0.5 flex-shrink-0 text-amber" />
            <div>
              <p className="mb-1 text-[15px] font-medium text-text-primary">Sign in to check in</p>
              <p className="text-[13.5px] leading-relaxed text-text-secondary">
                You need to be signed in to your DailyBrew account to check in here.
              </p>
            </div>
          </div>
          <Link
            href={`/sign-in?redirect=/checkin/${qrToken}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-coffee py-3.5 text-[16px] font-semibold text-white no-underline shadow-[0_4px_14px_rgba(107,66,38,0.30)] transition-all hover:-translate-y-px"
          >
            <LogIn size={16} />
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  if (isLoading || authStatus === "loading") {
    return <Shell><p className="text-text-tertiary">{t("common.loading", "Loading…")}</p></Shell>;
  }

  if (error) {
    const status = error instanceof AxiosError ? error.response?.status : undefined;
    const message = error instanceof AxiosError ? error.response?.data?.message : undefined;
    return (
      <Shell>
        <div className="max-w-xs rounded-2xl border border-red/20 bg-red/10 px-6 py-4 text-center">
          <p className="text-[16px] font-medium text-red">
            {status === 403
              ? message || "You are not registered as an employee in this workspace."
              : status === 401
                ? "Please sign in to check in."
                : t("checkin.invalidToken", "Invalid QR code.")}
          </p>
        </div>
      </Shell>
    );
  }

  if (!data) return null;

  const { today } = data;
  const completed = today.checkedIn && today.checkedOut;
  const initials = data.employeeName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Shell>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-amber-light to-coffee text-2xl font-bold text-white shadow-[0_4px_14px_rgba(107,66,38,0.25)]">
        {initials}
      </div>
      <h1 className="mb-1 text-[20px] font-semibold text-text-primary">{data.employeeName}</h1>
      <p className="mb-4 font-sans text-[14px] text-text-tertiary">
        {data.shiftName ? `${data.shiftName} · ${data.shiftStart}–${data.shiftEnd}` : "No shift assigned"}
      </p>

      <div className="mb-6 flex items-center gap-1.5 rounded-full border border-green/20 bg-green/10 px-4 py-1.5 text-[13.5px] font-medium text-green">
        <ShieldCheck size={13} />
        Verified
      </div>

      {geoError && (
        <div className="mb-4 flex max-w-xs items-center gap-1.5 rounded-xl border border-amber/20 bg-amber/10 px-4 py-2 text-center text-[13px] font-medium text-amber">
          <MapPin size={14} className="shrink-0" />
          {t("checkin.locationDenied", "Location unavailable — check-in may be blocked.")}
        </div>
      )}

      {today.checkedIn && (
        <div className="mb-8 rounded-full border border-green/20 bg-green/10 px-4 py-1.5 font-sans text-[14px] font-medium text-green">
          {completed ? "✓ Checked out" : "✓ Checked in"}
        </div>
      )}

      {actionResult && (
        <div className="mb-4 rounded-full border border-green/20 bg-green/10 px-4 py-1.5 text-[14px] font-medium text-green">
          {actionResult}
        </div>
      )}
      {actionError && (
        <div className="mb-4 max-w-xs rounded-2xl border border-red/20 bg-red/10 px-4 py-3 text-center text-[14px] font-medium text-red">
          {actionError}
        </div>
      )}

      {!completed ? (
        <button
          type="button"
          onClick={handleCheckin}
          disabled={checkinAction.isPending}
          className="w-full max-w-xs rounded-2xl bg-coffee py-4 text-[18px] font-semibold text-white shadow-[0_4px_14px_rgba(107,66,38,0.30)] transition-transform active:scale-[0.97] disabled:opacity-50"
        >
          {checkinAction.isPending
            ? t("common.loading", "…")
            : today.checkedIn
              ? t("checkin.checkOut", "Check out")
              : t("checkin.checkIn", "Check in")}
        </button>
      ) : (
        <div className="max-w-xs rounded-2xl border border-green/20 bg-green/10 px-6 py-4 text-center">
          <p className="text-[16px] font-medium text-green">{t("checkin.completed", "All done for today!")}</p>
        </div>
      )}
    </Shell>
  );
}
