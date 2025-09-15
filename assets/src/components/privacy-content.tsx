import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { CardBlock } from '@/components/card/card-block';
import { useApplication } from '@/hooks/use-application';

export const PrivacyContent: React.FunctionComponent = () => {
    const { contactEmail } = useApplication();
    return (
        <section className="mx-auto max-w-5xl px-6 md:px-8 py-10 md:py-14 space-y-6">
            <Intro />
            <CardBlock title="Information we collect">
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
                    <li>
                        <strong>Account data:</strong> name, email, hashed passwords.
                    </li>
                    <li>
                        <strong>Organization data:</strong> employee profiles (first/last name, optional phone, dates),
                        roles, templates, criteria.
                    </li>
                    <li>
                        <strong>Operational data:</strong> attendance records (date, status, optional times), KPI
                        evaluations (scores, criteria, averages, evaluator, evaluated date).
                    </li>
                    <li>
                        <strong>Usage data:</strong> app interactions, device/browser info, approximate region (for
                        security & diagnostics).
                    </li>
                    <li>
                        <strong>Support:</strong> messages or attachments you send to support.
                    </li>
                </ul>
            </CardBlock>

            <CardBlock title="How we use your information">
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
                    <li>Provide and maintain DailyBrew features (attendance, KPIs, leave input).</li>
                    <li>Compute & display KPI averages and history snapshots.</li>
                    <li>Secure the service (fraud prevention, abuse detection, rate limiting).</li>
                    <li>Improve the product (aggregated analytics, feature diagnostics).</li>
                    <li>Communicate about changes, outages, or support.</li>
                    <li>Process payments and subscription status for paid tiers.</li>
                </ul>
            </CardBlock>

            <CardBlock title="Legal bases (where applicable)">
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
                    <li>
                        <strong>Contract:</strong> to deliver the service you sign up for.
                    </li>
                    <li>
                        <strong>Legitimate interests:</strong> to keep our platform secure and improve features.
                    </li>
                    <li>
                        <strong>Consent:</strong> where required (e.g., marketing emails).
                    </li>
                    <li>
                        <strong>Legal obligations:</strong> to comply with applicable laws.
                    </li>
                </ul>
            </CardBlock>

            <CardBlock title="Data retention">
                <p className="text-sm md:text-base">
                    We keep account and operational data for as long as your account is active. You can request deletion
                    (see “Your rights”). Backups and logs are retained for a limited period for security and continuity.
                    If you cancel, we may keep a read-only copy for a reasonable time so you can retrieve records.
                </p>
            </CardBlock>

            <CardBlock title="Sharing & processors">
                <p className="text-sm md:text-base mb-3">
                    We don’t sell your data. We may share limited data with trusted service providers who help us
                    operate DailyBrew:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
                    <li>Cloud hosting & CDN (infrastructure, storage, backups).</li>
                    <li>Email & messaging (transactional emails, support).</li>
                    <li>Analytics (usage patterns in aggregate).</li>
                    <li>Payment processing (for paid tiers).</li>
                </ul>
                <p className="text-sm md:text-base mt-3">
                    These providers process data on our behalf and under agreements that require confidentiality and
                    security.
                </p>
            </CardBlock>

            <CardBlock title="International transfers">
                <p className="text-sm md:text-base">
                    Your data may be stored or processed in data centers outside your country. We use safeguards such as
                    contractual commitments with our processors to protect your information across borders.
                </p>
            </CardBlock>

            <CardBlock title="Security">
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
                    <li>Encryption in transit (HTTPS) and at rest where applicable.</li>
                    <li>Role-based access for internal operations; least-privilege by default.</li>
                    <li>Backups and monitoring to detect anomalies and recover from incidents.</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                    No method of transmission or storage is 100% secure. We work to continually improve safeguards.
                </p>
            </CardBlock>

            <CardBlock title="Cookies & analytics">
                <p className="text-sm md:text-base">
                    We use essential cookies for authentication and security. We may use analytics cookies or similar
                    technologies to understand usage and improve features. You can control non-essential cookies via
                    your browser or in-app settings (if available).
                </p>
            </CardBlock>

            <CardBlock title="Payments (Pro/Business)">
                <p className="text-sm md:text-base">
                    Payments are processed by a third-party provider. We don’t store full payment card details on our
                    servers. The payment processor acts as a separate controller or processor under its own privacy
                    policy.
                </p>
            </CardBlock>

            <CardBlock title="Your rights">
                <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
                    <li>Access a copy of your data.</li>
                    <li>Correct or update inaccurate information.</li>
                    <li>Delete data (subject to legal/contractual limits).</li>
                    <li>Export certain data where technically feasible.</li>
                    <li>Object or restrict certain processing where applicable.</li>
                </ul>
                <p className="text-sm md:text-base mt-3">
                    To exercise rights, contact us at{' '}
                    <a className="underline underline-offset-2" href="mailto:support@dailybrew.work">
                        support@dailybrew.work
                    </a>
                    . We may need to verify your identity before responding.
                </p>
            </CardBlock>

            <CardBlock title="Team access & roles">
                <p className="text-sm md:text-base">
                    On paid tiers, you can invite users and assign roles. Your organization admins control who can view
                    or edit attendance, leave, and KPI data. In the free tier (single owner), only the account owner
                    manages data.
                </p>
            </CardBlock>

            <CardBlock title="Children">
                <p className="text-sm md:text-base">
                    DailyBrew is not intended for children under 16. We don’t knowingly collect personal data from
                    children. If you believe a child has provided us personal information, contact us to request
                    deletion.
                </p>
            </CardBlock>

            <CardBlock title="Changes to this policy">
                <p className="text-sm md:text-base">
                    We may update this policy to reflect changes in our practices or legal requirements. We’ll post the
                    new date at the top and, if changes are material, notify you through the app or email.
                </p>
            </CardBlock>

            <CardBlock title="Contact">
                <p className="text-sm md:text-base">
                    Questions about privacy? Email{' '}
                    <a className="underline underline-offset-2" href={`mailto:${contactEmail}`}>
                        {contactEmail}
                    </a>
                    .
                </p>
                <div className="mt-4 text-sm">
                    <Link to="/terms" className="underline underline-offset-2">
                        Terms of Service
                    </Link>
                </div>
            </CardBlock>
        </section>
    );
};

function Intro() {
    return (
        <Card>
            <CardContent className="p-6 md:p-8 space-y-3">
                <p className="text-sm md:text-base">
                    DailyBrew (“we”, “us”, “our”) provides a platform for tracking attendance, KPI evaluations, and
                    related workforce data. This Privacy Policy explains what we collect, how we use it, and your
                    choices. By using DailyBrew, you agree to this policy.
                </p>
                <p className="text-xs text-muted-foreground">
                    This page is for transparency and does not limit any rights you may have under local law.
                </p>
            </CardContent>
        </Card>
    );
}

PrivacyContent.displayName = 'PrivacyContent';
