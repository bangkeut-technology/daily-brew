import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SignUp } from '@/types/user';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { CheckboxField } from '@/components/field/checkbox-field';
import { TermsAndConditionsDialog } from '@/routes/_layout/sign-up/-components/terms-and-conditions-dialog';
import { PrivacyPolicyDialog } from '@/routes/_layout/sign-up/-components/privacy-policy-dialog';
import { Button } from '@/components/ui/button';
import { PasswordStrength } from '@/components/password-strength';

interface SignUpFormProps {
    form: UseFormReturn<SignUp>;
    isPending: boolean;
    onSubmit: (data: SignUp) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ form, onSubmit, isPending }) => {
    const { t } = useTranslation();
    const password = form.watch('password');

    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="flex space-x-2">
                    <TextField
                        control={form.control}
                        name="firstName"
                        label={t('first_name')}
                        placeholder="John"
                        autoComplete="name"
                        className="w-full"
                        startIcon={
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        }
                        disabled={isPending}
                    />
                    <TextField
                        control={form.control}
                        name="lastName"
                        label={t('last_name')}
                        placeholder="Doe"
                        autoComplete="family-name"
                        className="w-full"
                        startIcon={
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        }
                        disabled={isPending}
                    />
                </div>

                <TextField
                    control={form.control}
                    name="email"
                    label={t('email')}
                    placeholder="you@coffee.co"
                    className="w-full"
                    autoComplete="email"
                    startIcon={
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    }
                    disabled={isPending}
                />

                <div className="flex flex-col space-y-2 w-full">
                    <div className="flex flex-col space-y-2 w-full">
                        <TextField
                            control={form.control}
                            name="password"
                            label={t('password')}
                            className="w-full"
                            type="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            startIcon={
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            }
                            disabled={isPending}
                        />
                        <PasswordStrength value={password} />
                    </div>

                    <TextField
                        control={form.control}
                        name="confirmPassword"
                        label={t('confirm_password')}
                        className="w-full"
                        type="password"
                        placeholder="••••••••"
                        startIcon={
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        }
                        disabled={isPending}
                        autoComplete="new-password"
                    />
                </div>

                <div className="flex items-start gap-2">
                    <CheckboxField
                        disabled={isPending}
                        control={form.control}
                        name="acceptedTerms"
                        label={
                            <React.Fragment>
                                I agree to the
                                <TermsAndConditionsDialog />
                                and
                                <PrivacyPolicyDialog />.
                            </React.Fragment>
                        }
                    ></CheckboxField>
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </form>
        </Form>
    );
};
