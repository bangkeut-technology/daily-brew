<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle;

use Bangkeut\Tap\Exception\TapException;
use Bangkeut\Tap\TapRequest;
use Bangkeut\Tap\TapResult;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\TapBundle\Event\TapRejectedEvent;
use Bangkeut\TapBundle\Event\TapVerifiedEvent;
use Psr\EventDispatcher\EventDispatcherInterface;

/**
 * The application-facing entry point: verify a tap, announce the outcome.
 *
 * Both events fire before this returns or rethrows, so an audit listener sees every tap — accepted
 * or refused — without the host having to remember to log at each call site.
 */
final readonly class TapService
{
    public function __construct(
        private TapVerifier $verifier,
        private EventDispatcherInterface $dispatcher,
    ) {
    }

    /**
     * @throws TapException when the tap is refused; the reason type says why
     */
    public function verify(TapRequest $request): TapResult
    {
        try {
            $result = $this->verifier->verify($request);
        } catch (TapException $reason) {
            $this->dispatcher->dispatch(new TapRejectedEvent($reason, $request));

            throw $reason;
        }

        $this->dispatcher->dispatch(new TapVerifiedEvent($result, $request));

        return $result;
    }
}
