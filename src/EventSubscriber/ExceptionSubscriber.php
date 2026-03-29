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
        private readonly LoggerInterface $logger,
    ) {
    }

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
        $statusCode = $exception instanceof HttpExceptionInterface
            ? $exception->getStatusCode()
            : 500;

        if ($statusCode >= 500) {
            $this->logger->error('Uncaught exception: {message}', [
                'message' => $exception->getMessage(),
                'exception' => $exception,
            ]);
        }

        $message = $exception->getMessage();
        $debug = $_SERVER['APP_DEBUG'] ?? false;
        $trace = $debug && $statusCode === 500 ? $exception->getFile() . ':' . $exception->getLine() : null;

        $response = ['error' => true, 'message' => $message, 'code' => $statusCode];
        if ($trace) {
            $response['trace'] = $trace;
        }

        $event->setResponse(new JsonResponse($response, $statusCode));
    }
}
