"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiAxios } from "@/lib/api";
import { AuthShell, fieldClass } from "@/components/auth/AuthShell";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

function readToken(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("token") ?? "";
}

export function ResetPasswordForm() {
  const [token] = useState<string>(readToken);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await apiAxios.post("/auth/reset-password", { token, password: values.password });
      setDone(true);
    } catch {
      setFormError("This reset link is invalid or has expired.");
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new password for your account."
      footer={
        <Link href="/sign-in" className="font-medium text-coffee no-underline hover:underline">
          Back to sign in
        </Link>
      }
    >
      {!token ? (
        <p className="rounded-lg bg-red/10 px-4 py-3 text-sm text-red">
          This reset link is invalid or missing its token.
        </p>
      ) : done ? (
        <p className="rounded-lg bg-green/10 px-4 py-3 text-sm text-green">
          Your password has been reset.{" "}
          <Link href="/sign-in" className="font-medium underline">
            Sign in
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-[13px] font-medium text-text-secondary">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              {...register("password")}
            />
            {errors.password && <p className="mt-1 text-[12.5px] text-red">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              {...register("confirm")}
            />
            {errors.confirm && <p className="mt-1 text-[12.5px] text-red">{errors.confirm.message}</p>}
          </div>
          {formError && <p className="text-[13px] text-red">{formError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-coffee px-4 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Reset password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
