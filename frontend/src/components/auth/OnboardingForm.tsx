"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { setWorkspacePublicId } from "@/lib/api";
import { useCreateWorkspace, useCompleteOnboarding } from "@/hooks/useOnboarding";
import { AuthShell, fieldClass } from "@/components/auth/AuthShell";

const schema = z.object({ name: z.string().trim().min(1, "Name your restaurant") });
type FormValues = z.infer<typeof schema>;

export function OnboardingForm() {
  const router = useRouter();
  const auth = useAuth();
  const createWorkspace = useCreateWorkspace();
  const completeOnboarding = useCompleteOnboarding();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (auth.status === "unauthenticated") router.replace("/sign-in");
  }, [auth.status, router]);

  if (auth.status !== "authenticated") {
    return <div className="min-h-screen" aria-busy="true" />;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const workspace = await createWorkspace.mutateAsync(values.name);
      setWorkspacePublicId(workspace.publicId);
      await completeOnboarding.mutateAsync();
      // Hard navigation so role-context + current workspace reload cleanly.
      window.location.assign("/console/dashboard");
    } catch {
      toast.error("Could not create your workspace. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Name your restaurant"
      subtitle="This is your workspace — you can change it later."
      footer={<>You can add employees and shifts once you&apos;re in.</>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Restaurant name
          </label>
          <input id="name" className={fieldClass} placeholder="Beef & Basil" {...register("name")} />
          {errors.name && <p className="mt-1 text-[12.5px] text-red">{errors.name.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-coffee px-4 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Creating…" : "Create workspace"}
        </button>
      </form>
    </AuthShell>
  );
}
