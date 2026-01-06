<?php
/**
 * This file is part of the Adora project.
 *
 * (c) Vandeth THO <thovandeth@gmail.com>
 *
 * @author  Vandeth THO
 *
 * @created 12/17/25 11:07AM
 * @see     https://dailybrew.work
 * Copyright (c) 2025 Adora. All rights reserved.
 */
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Api\ApiErrorResponder;
use App\Enum\ApiErrorCodeEnum;
use App\Exception\ApiException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 *
 * Class ApiExceptionSubscriber
 *
 * @package App\EventSubscriber
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class ApiExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private ApiErrorResponder   $responder,
        private TranslatorInterface $translator,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [ExceptionEvent::class => 'onKernelException'];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $e = $event->getThrowable();

        // 1) Structured domain errors (EXPECTED → no log pollution)
        if ($e instanceof ApiException) {
            $code = $e->getCodeEnum();

            $event->setResponse($this->responder->respond(
                $code,
                $this->translator->trans(
                    sprintf('api.%s.message', $code->value),
                    domain: 'errors'
                ),
                $code->httpStatus(),
                $this->translator->trans(
                    sprintf('api.%s.description', $code->value),
                    domain: 'errors'
                ),
                $e->getContext(),
            ));
            return;
        }

        // 2) Known HttpExceptions (OPTIONAL mapping)
        if ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();

            $code = match ($status) {
                Response::HTTP_UNAUTHORIZED => ApiErrorCodeEnum::UNAUTHORIZED,
                Response::HTTP_FORBIDDEN    => ApiErrorCodeEnum::FORBIDDEN,
                Response::HTTP_NOT_FOUND    => ApiErrorCodeEnum::NOT_FOUND,
                Response::HTTP_CONFLICT     => ApiErrorCodeEnum::CONFLICT,
                default                     => null,
            };

            if ($code !== null) {
                $event->setResponse($this->responder->respond(
                    $code,
                    $this->translator->trans(
                        sprintf('api.%s.message', $code->value),
                        domain: 'errors'
                    ),
                    $status,
                    $this->translator->trans(
                        sprintf('api.%s.description', $code->value),
                        domain: 'errors'
                    ),
                    ['httpStatus' => $status],
                ));
            }

            return;
        }

        // 3) EVERYTHING ELSE → DO NOTHING
        // Symfony will log it properly (Monolog, Sentry, etc.)
    }
}
