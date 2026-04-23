<?php

declare(strict_types=1);

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\RateLimiter\RateLimiterFactory;

readonly class RateLimitSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private RateLimiterFactory $authLoginLimiter,
        private RateLimiterFactory $authRegisterLimiter,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 10],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $path = $request->getPathInfo();

        if ($request->getMethod() !== 'POST') {
            return;
        }

        $ip = $request->getClientIp() ?? 'unknown';

        // Rate limit login attempts
        if (preg_match('#/auth/login$#', $path) || preg_match('#/auth/google$#', $path) || preg_match('#/auth/apple$#', $path)) {
            $limiter = $this->authLoginLimiter->create($ip);
            if (!$limiter->consume()->isAccepted()) {
                $event->setResponse(new JsonResponse(
                    ['message' => 'Too many login attempts. Please try again later.'],
                    429,
                ));
            }
        }

        // Rate limit registration
        if (preg_match('#/auth/register$#', $path)) {
            $limiter = $this->authRegisterLimiter->create($ip);
            if (!$limiter->consume()->isAccepted()) {
                $event->setResponse(new JsonResponse(
                    ['message' => 'Too many registration attempts. Please try again later.'],
                    429,
                ));
            }
        }
    }
}
