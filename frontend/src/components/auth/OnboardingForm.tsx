"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Building2, Check, Coffee, Copy, UserCircle } from "lucide-react";
import { AxiosError } from "axios";
import { setWorkspacePublicId } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useCompleteOnboarding, useCreateWorkspace } from "@/hooks/useOnboarding";
import { useLinkEmployee } from "@/hooks/useRoleContext";

type Step = "welcome" | "role" | "owner-form" | "employee-link";

const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const inputClass =
  "w-full rounded-xl border border-cream-3 bg-glass-bg px-3.5 py-3 text-base text-text-primary outline-none transition-all placeholder:text-text-tertiary focus:border-coffee focus:ring-2 focus:ring-coffee/15";

const primaryButtonClass =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-coffee px-4 py-3 text-base font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-coffee-light hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none";

const quietButtonClass =
  "text-[14.5px] text-text-tertiary transition-colors hover:text-text-secondary disabled:opacity-50";

/**
 * Multi-step account setup.
 *
 * The role question is the whole point: a user can be an owner *or* a staff
 * member (or eventually both, in different workspaces), and a staff member has
 * no business creating a workspace. Skipping straight to "name your restaurant"
 * strands anyone whose employer already made their profile.
 */
export function OnboardingForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const createWorkspace = useCreateWorkspace();
  const linkEmployee = useLinkEmployee();
  const completeOnboarding = useCompleteOnboarding();

  const [step, setStep] = useState<Step>("welcome");
  const [workspaceName, setWorkspaceName] = useState("");
  const [employeePublicId, setEmployeePublicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const userPublicId = auth.user?.publicId ?? "";

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/sign-in");
  }, [auth.status, router]);

  const handleCopyPublicId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(userPublicId);
      setCopied(true);
      toast.success(t("onboarding.copied", "Copied to clipboard"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("onboarding.copyFailed", "Failed to copy"));
    }
  }, [userPublicId, t]);

  /** Hard navigation so role-context and the current workspace reload cleanly. */
  const goToDashboard = () => window.location.assign("/console/dashboard");

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = workspaceName.trim();
    if (!name) {
      toast.error(t("onboarding.workspaceNameRequired", "Please enter a restaurant name"));
      return;
    }
    setLoading(true);
    try {
      const workspace = await createWorkspace.mutateAsync(name);
      setWorkspacePublicId(workspace.publicId);
      await completeOnboarding.mutateAsync();
      toast.success(t("onboarding.workspaceCreated", "Workspace created!"));
      goToDashboard();
    } catch (err) {
      toast.error(
        apiMessage(err) ?? t("onboarding.createFailed", "Failed to create workspace"),
      );
      setLoading(false);
    }
  };

  const handleLinkEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = employeePublicId.trim();
    if (!id) {
      toast.error(t("onboarding.employeeIdRequired", "Please enter an employee ID"));
      return;
    }
    setLoading(true);
    try {
      await linkEmployee.mutateAsync(id);
      await completeOnboarding.mutateAsync();
      toast.success(t("onboarding.linked", "Successfully linked to your workplace!"));
      goToDashboard();
    } catch (err) {
      toast.error(apiMessage(err) ?? t("onboarding.linkFailed", "Failed to link employee"));
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await completeOnboarding.mutateAsync();
      goToDashboard();
    } catch {
      toast.error(t("onboarding.skipFailed", "Something went wrong"));
      setLoading(false);
    }
  };

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen" aria-busy="true" />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {step === "welcome" && <WelcomeStep onContinue={() => setStep("role")} />}

            {step === "role" && (
              <RoleSelectionStep
                onSelect={(role) => setStep(role === "owner" ? "owner-form" : "employee-link")}
                onSkip={handleSkip}
              />
            )}

            {step === "owner-form" && (
              <OwnerFormStep
                workspaceName={workspaceName}
                onWorkspaceNameChange={setWorkspaceName}
                onSubmit={handleCreateWorkspace}
                onBack={() => setStep("role")}
                loading={loading}
              />
            )}

            {step === "employee-link" && (
              <EmployeeLinkStep
                userPublicId={userPublicId}
                copied={copied}
                onCopy={handleCopyPublicId}
                employeePublicId={employeePublicId}
                onEmployeePublicIdChange={setEmployeePublicId}
                onSubmit={handleLinkEmployee}
                onSkip={handleSkip}
                onBack={() => setStep("role")}
                loading={loading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-linear-to-br from-amber-light to-coffee shadow-[0_6px_20px_rgba(107,66,38,0.30)]"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Coffee size={36} color="white" strokeWidth={1.8} />
        </motion.div>
      </motion.div>

      <h1 className="mb-2 font-serif text-[30px] font-semibold text-text-primary">
        {t("onboarding.welcomeTitle", "Welcome to DailyBrew")}
      </h1>
      <p className="mb-10 text-base text-text-secondary">
        {t("onboarding.welcomeSubtitle", "Staff attendance, brewed simply")}
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="flex items-center gap-2 rounded-xl bg-coffee px-8 py-3 text-[17px] font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-coffee-light hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)]"
      >
        {t("onboarding.getStarted", "Get started")}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function RoleSelectionStep({
  onSelect,
  onSkip,
}: {
  onSelect: (role: "owner" | "employee") => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <h2 className="mb-2 font-serif text-2xl font-semibold text-text-primary">
        {t("onboarding.roleTitle", "How will you use DailyBrew?")}
      </h2>
      <p className="mb-8 text-[15px] text-text-secondary">
        {t("onboarding.roleSubtitle", "Are you a restaurant owner or a staff member?")}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RoleCard
          onClick={() => onSelect("owner")}
          icon={<Building2 size={22} color="white" strokeWidth={1.8} />}
          iconClass="bg-linear-to-br from-amber to-coffee shadow-[0_3px_10px_rgba(107,66,38,0.20)]"
          arrowClass="text-coffee"
          title={t("onboarding.ownerTitle", "I own a restaurant")}
          description={t("onboarding.ownerDescription", "Create your workspace and manage staff")}
        />
        <RoleCard
          onClick={() => onSelect("employee")}
          icon={<UserCircle size={22} color="white" strokeWidth={1.8} />}
          iconClass="bg-linear-to-br from-blue to-[#1a3a5c] shadow-[0_3px_10px_rgba(59,111,160,0.20)]"
          arrowClass="text-blue"
          title={t("onboarding.employeeTitle", "I'm a staff member")}
          description={t("onboarding.employeeDescription", "Get linked to your workplace")}
        />
      </div>

      <button type="button" onClick={onSkip} className={`mt-6 ${quietButtonClass}`}>
        {t("onboarding.skipForNow", "Skip for now")}
      </button>
    </div>
  );
}

function RoleCard({
  onClick,
  icon,
  iconClass,
  arrowClass,
  title,
  description,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  iconClass: string;
  arrowClass: string;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group glass-card relative p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-coffee/30 hover:shadow-[0_6px_20px_rgba(107,66,38,0.12)]"
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}>
        {icon}
      </div>
      <p className="mb-1 text-base font-semibold text-text-primary">{title}</p>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
      <span className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowRight size={16} className={arrowClass} />
      </span>
    </button>
  );
}

function OwnerFormStep({
  workspaceName,
  onWorkspaceNameChange,
  onSubmit,
  onBack,
  loading,
}: {
  workspaceName: string;
  onWorkspaceNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-amber to-coffee shadow-[0_3px_10px_rgba(107,66,38,0.20)]">
        <Building2 size={24} color="white" strokeWidth={1.8} />
      </div>

      <h2 className="mb-2 font-serif text-2xl font-semibold text-text-primary">
        {t("onboarding.createWorkspaceTitle", "Name your restaurant")}
      </h2>
      <p className="mb-8 text-[15px] text-text-secondary">
        {t(
          "onboarding.createWorkspaceSubtitle",
          "This is the workspace where you will manage your staff.",
        )}
      </p>

      <div className="glass-card p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="text-left">
            <label
              htmlFor="onboarding-workspace-name"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              {t("onboarding.restaurantName", "Restaurant name")}
            </label>
            <input
              id="onboarding-workspace-name"
              name="workspaceName"
              type="text"
              value={workspaceName}
              onChange={(e) => onWorkspaceNameChange(e.target.value)}
              placeholder={t("onboarding.restaurantPlaceholder", "e.g. Café Mekong")}
              autoFocus
              className={inputClass}
            />
          </div>

          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading
              ? t("common.loading", "Creating...")
              : t("onboarding.createWorkspace", "Create workspace")}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>

      <button type="button" onClick={onBack} className={`mt-5 ${quietButtonClass}`}>
        {t("onboarding.back", "Back")}
      </button>
    </div>
  );
}

function EmployeeLinkStep({
  userPublicId,
  copied,
  onCopy,
  employeePublicId,
  onEmployeePublicIdChange,
  onSubmit,
  onSkip,
  onBack,
  loading,
}: {
  userPublicId: string;
  copied: boolean;
  onCopy: () => void;
  employeePublicId: string;
  onEmployeePublicIdChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSkip: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue to-[#1a3a5c] shadow-[0_3px_10px_rgba(59,111,160,0.20)]">
        <UserCircle size={24} color="white" strokeWidth={1.8} />
      </div>

      <h2 className="mb-2 font-serif text-2xl font-semibold text-text-primary">
        {t("onboarding.employeeLinkTitle", "Link to your workplace")}
      </h2>
      <p className="mb-8 text-[15px] text-text-secondary">
        {t(
          "onboarding.employeeLinkSubtitle",
          "Ask your employer for your Employee ID, then enter it below to link your account.",
        )}
      </p>

      <div className="glass-card space-y-6 p-6">
        {/* Two ways out of here: hand your ID to the owner so they can create
            your profile, or paste the ID they already made for you. */}
        <div className="text-left">
          <p className="mb-2 text-[13px] font-medium uppercase tracking-wider text-text-tertiary">
            {t("onboarding.yourId", "Your user ID")}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 select-all truncate rounded-lg border border-cream-3 bg-cream-2 px-3.5 py-2.5 font-mono text-[15px] tabular-nums text-text-primary">
              {userPublicId}
            </div>
            <button
              type="button"
              onClick={onCopy}
              title={t("onboarding.copy", "Copy")}
              aria-label={t("onboarding.copy", "Copy")}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-cream-3 bg-cream-2 transition-all duration-150 hover:bg-cream-3"
            >
              {copied ? (
                <Check size={16} className="text-green" />
              ) : (
                <Copy size={16} className="text-text-secondary" />
              )}
            </button>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-text-tertiary">
            {t(
              "onboarding.shareIdHint",
              "Share this with your restaurant owner so they can add you as an employee.",
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-cream-3/80" />
          <span className="text-[13px] uppercase tracking-wider text-text-tertiary">
            {t("onboarding.or", "or")}
          </span>
          <div className="h-px flex-1 bg-cream-3/80" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="text-left">
            <label
              htmlFor="onboarding-employee-id"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              {t("onboarding.enterEmployeeId", "Enter your employee ID")}
            </label>
            <input
              id="onboarding-employee-id"
              name="employeePublicId"
              type="text"
              value={employeePublicId}
              onChange={(e) => onEmployeePublicIdChange(e.target.value)}
              placeholder={t(
                "onboarding.employeeIdPlaceholder",
                "Ask your employer for your Employee ID",
              )}
              className={inputClass}
            />
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-tertiary">
              {t(
                "onboarding.employeeIdHint",
                "Your employer creates your employee profile and gives you this ID to link your account.",
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !employeePublicId.trim()}
            className={primaryButtonClass}
          >
            {loading ? t("common.loading", "Linking...") : t("onboarding.linkAccount", "Link my account")}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button type="button" onClick={onBack} className={quietButtonClass}>
          {t("onboarding.back", "Back")}
        </button>
        <span className="text-[12px] text-text-tertiary">&middot;</span>
        <button type="button" onClick={onSkip} disabled={loading} className={quietButtonClass}>
          {t("onboarding.skipForNow", "Skip for now")}
        </button>
      </div>
    </div>
  );
}

/** The API's message explains *why* a link failed far better than a generic string. */
function apiMessage(err: unknown): string | undefined {
  return err instanceof AxiosError ? err.response?.data?.message : undefined;
}
