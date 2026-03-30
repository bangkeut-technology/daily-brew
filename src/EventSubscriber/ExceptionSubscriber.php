<?php

namespace App\EventSubscriber;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

class ExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private LoggerInterface $logger,
        private string $kernelEnvironment = 'prod',
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => 'onKernelException',
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();
        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        $exception = $event->getThrowable();

        if ($exception instanceof HttpExceptionInterface) {
            $statusCode = $exception->getStatusCode();
            $message = $exception->getMessage();
        } else {
            // Log 500 errors for debugging
            $this->logger->error('API 500 error: ' . $exception->getMessage(), [
                'exception' => $exception,
                'url' => $request->getUri(),
                'method' => $request->getMethod(),
            ]);

            $statusCode = 500;
            $message = $this->kernelEnvironment === 'dev'
                ? $exception->getMessage()
                : 'An internal error occurred';
        }

        $event->setResponse(new JsonResponse([
            'error'   => true,
            'message' => $message,
            'code'    => $statusCode,
        ], $statusCode));
    }
}
