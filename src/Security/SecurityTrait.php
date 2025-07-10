<?php
declare(strict_types=1);

namespace App\Security;

use Symfony\Component\Security\Core\Exception\AccessDeniedException;

trait SecurityTrait
{
    /**
     * Throws an exception unless the attribute is granted against the current authentication token and optionally
     * supplied subject.
     *
     * @throws AccessDeniedException
     */
    protected function denyAccessUnlessGranted(mixed $attribute, mixed $subject = null, string $message = 'Access Denied.'): void
    {
        if (!$this->security->isGranted($attribute, $subject)) {
            $exception = new AccessDeniedException($message);;
            $exception->setAttributes([$attribute]);
            $exception->setSubject($subject);

            throw $exception;
        }
    }
}