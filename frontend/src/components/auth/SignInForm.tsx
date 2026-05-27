"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { apiAxios } from "@/lib/api";
import { AuthShell, OAuthButtons, OrDivider, fieldClass } from "@/components/auth/AuthShell";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await apiAxios.post("/auth/login", values);
      // Hard navigation so the console boots fresh with the new JWT cookie.
      window.location.assign("/console/dashboard");
    } catch {
      setFormError("Incorrect email or password.");
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to DailyBrew."
      footer={
        <>
          New here?{" "}
          <Link href="/sign-up" className="font-medium text-coffee no-underline hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <OAuthButtons />
      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Email
          </label>
          <input id="email" type="email" autoComplete="email" className={fieldClass} {...register("email")} />
          {errors.email && <p className="mt-1 text-[12.5px] text-red">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium text-text-secondary">
              Password
            </label>
            <Link href="/forgot-password" className="text-[12.5px] text-coffee no-underline hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={fieldClass}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-[12.5px] text-red">{errors.password.message}</p>}
        </div>

        {formError && <p className="text-[13px] text-red">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-coffee px-4 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
