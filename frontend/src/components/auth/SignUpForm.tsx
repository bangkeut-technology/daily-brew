"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";
import { apiAxios } from "@/lib/api";
import { AuthShell, OAuthButtons, OrDivider, fieldClass } from "@/components/auth/AuthShell";

const schema = z.object({
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function SignUpForm() {
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
      await apiAxios.post("/auth/register", values);
      // The console guard routes to onboarding when there's no workspace yet.
      window.location.assign("/console/dashboard");
    } catch (err) {
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      setFormError(
        status === 409 ? "An account with that email already exists." : "Could not create your account.",
      );
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free for up to 10 active employees. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-coffee no-underline hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons />
      <OrDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-[13px] font-medium text-text-secondary">
              First name
            </label>
            <input id="firstName" autoComplete="given-name" className={fieldClass} {...register("firstName")} />
            {errors.firstName && <p className="mt-1 text-[12.5px] text-red">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1 block text-[13px] font-medium text-text-secondary">
              Last name
            </label>
            <input id="lastName" autoComplete="family-name" className={fieldClass} {...register("lastName")} />
            {errors.lastName && <p className="mt-1 text-[12.5px] text-red">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Email
          </label>
          <input id="email" type="email" autoComplete="email" className={fieldClass} {...register("email")} />
          {errors.email && <p className="mt-1 text-[12.5px] text-red">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-[13px] font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
          {isSubmitting ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
