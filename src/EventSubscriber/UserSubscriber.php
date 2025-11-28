<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\Account;
use App\Entity\User;
use App\Enum\AccountRoleEnum;
use App\Event\User\UserRegisteredEvent;
use App\Repository\AccountRepository;
use App\Repository\AccountUserRepository;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class UserSubscriber
 *
 * @package App\EventSubscriber
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class UserSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private AccountRepository     $accountRepository,
        private AccountUserRepository $accountUserRepository
    )
    {
    }

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [
            UserRegisteredEvent::class => 'onUserRegistered',
        ];
    }

    /**
     * Handles the event triggered when a user is registered.
     *
     * This method initializes settings with their default values for the newly registered user.
     * It creates and populates settings entities and persists them into the database.
     *
     * @param UserRegisteredEvent $event The event object containing the user information.
     */
    public function onUserRegistered(UserRegisteredEvent $event): void
    {
        $user = $event->user;

        $this->createAccount($user);
    }

    /**
     * Creates an account for the given user.
     *
     * @param User $user The user for whom the account is to be created.
     *
     * @return Account The created account.
     */
    private function createAccount(User $user): Account
    {
        $account = $this->accountRepository->create();

        $this->accountRepository->update($account);

        $accountUser = $this->accountUserRepository->create()
            ->setRole(AccountRoleEnum::OWNER)
            ->setUser($user)
            ->setAccount($account);

        $this->accountUserRepository->update($accountUser);

        return $account;
    }
}
