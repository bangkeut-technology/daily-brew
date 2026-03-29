<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

class ExceptionSubscriber implements EventSubscriberInterface
{
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

        if (!$exception instanceof HttpExceptionInterface) {
            // Unknown exceptions: let Symfony handle logging and error response
            return;
        }

        $statusCode = $exception->getStatusCode();

        $event->setResponse(new JsonResponse([
            'error'   => true,
            'message' => $exception->getMessage(),
            'code'    => $statusCode,
        ], $statusCode));
    }
}
