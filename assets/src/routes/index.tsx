import React from 'react';
import { createFileRoute, Link, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';

export const Route = createFileRoute('/')({
    component: Home,
});

function Home() {
    const {
        location: { pathname },
    } = useRouterState();
    return (
        <React.Fragment>
            <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container-wrapper">
                    <div className="container flex h-14 w-full items-center">
                        <Link to="/" className="mr-4 flex items-center gap-2 lg:mr-6">
                            <h1 className="text-2xl font-bold text-orange-600 lg:inline-block">Bill&amp;Go</h1>
                        </Link>
                        <div className="mr-4 hidden md:flex justify-between w-full">
                            <nav className="flex items-center gap-4 text-sm xl:gap-6">
                                <Link
                                    to="/"
                                    className={cn(
                                        'transition-colors hover:text-foreground/80 hover:text-orange-600',
                                        pathname === '/' ? 'text-foreground' : 'text-foreground/80',
                                    )}
                                >
                                    Home
                                </Link>
                            </nav>
                            <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
                                <nav className="flex items-center gap-2">
                                    <ModeToggle />
                                    <Button asChild>
                                        <Link to="/console/sign-in" search={{ redirect: '/console' }}>
                                            Get Started
                                        </Link>
                                    </Button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="bg-orange-50 py-20">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold mb-6 text-gray-900">Streamline Your Restaurant with Bill&Go</h1>
                    <p className="text-lg text-gray-700 mb-8">
                        Effortlessly manage orders, payments, and more with our easy-to-use POS system designed for
                        restaurants like yours.
                    </p>
                    <a className="bg-orange-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-orange-700">
                        Learn More
                    </a>
                </div>
            </section>

            <section id="features" className="py-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Features</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="text-orange-600 text-4xl mb-4">💳</div>
                            <h3 className="text-xl font-bold mb-2">Integrated Payments</h3>
                            <p className="text-gray-700">
                                Accept multiple payment methods seamlessly, including dual currency support.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="text-orange-600 text-4xl mb-4">📋</div>
                            <h3 className="text-xl font-bold mb-2">Order Management</h3>
                            <p className="text-gray-700">
                                Track orders, add custom items, and streamline operations with ease.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="text-orange-600 text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-bold mb-2">Sales Analytics</h3>
                            <p className="text-gray-700">
                                Get real-time insights into your restaurant&#39;s performance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="testimonials" className="bg-gray-100 py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-10 text-gray-900">What Our Customers Say</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <p className="text-gray-700 mb-4">
                                &#34;Bill&amp;Go transformed our operations! It&#39;s so intuitive and efficient.&#34;
                            </p>
                            <p className="text-orange-600 font-bold">- Sarah, Restaurant Owner</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <p className="text-gray-700 mb-4">
                                &#34;I love how easy it is to track orders and payments in real-time.&#34;
                            </p>
                            <p className="text-orange-600 font-bold">- John, Manager</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-10 text-gray-900">Pricing</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold mb-4">Basic</h3>
                            <p className="text-2xl font-bold mb-4">$29/month</p>
                            <ul className="text-gray-700 mb-6">
                                <li>Order Management</li>
                                <li>Integrated Payments</li>
                                <li>Basic Analytics</li>
                            </ul>
                            <a
                                href="#"
                                className="bg-orange-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-orange-700"
                            >
                                Get Started
                            </a>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold mb-4">Pro</h3>
                            <p className="text-2xl font-bold mb-4">$59/month</p>
                            <ul className="text-gray-700 mb-6">
                                <li>All Basic Features</li>
                                <li>Advanced Analytics</li>
                                <li>Priority Support</li>
                            </ul>
                            <a
                                href="#"
                                className="bg-orange-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-orange-700"
                            >
                                Get Started
                            </a>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold mb-4">Enterprise</h3>
                            <p className="text-2xl font-bold mb-4">Contact Us</p>
                            <ul className="text-gray-700 mb-6">
                                <li>Custom Features</li>
                                <li>Dedicated Support</li>
                                <li>Unlimited Users</li>
                            </ul>
                            <a
                                href="#"
                                className="bg-orange-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-orange-700"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </React.Fragment>
    );
}
