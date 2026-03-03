<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Entity\User;
use App\Enum\WorkspaceRoleEnum;
use App\Event\User\UserSignedUpEvent;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceUserRepository;
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
        private WorkspaceRepository     $workspaceRepository,
        private WorkspaceUserRepository $workspaceUserRepository
    )
    {
    }

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [
            UserSignedUpEvent::class => 'onUserSignedUp',
        ];
    }

    /**
     * Handles the event triggered when a user is registered.
     *
     * This method initializes settings with their default values for the newly registered user.
     * It creates and populates settings entities and persists them into the database.
     *
     * @param UserSignedUpEvent $event The event object containing the user information.
     */
    public function onUserSignedUp(UserSignedUpEvent $event): void
    {
        $user = $event->user;

        $this->createWorkspace($user);
    }

    /**
     * Creates a workspace for the given user.
     *
     * @param User $user The user for whom the workspace is to be created.
     *
     * @return void The created workspace.
     */
    private function createWorkspace(User $user): void
    {
        $workspace = $this->workspaceRepository->create()
            ->setName(sprintf("%s's Workspace", $user->getFirstName()));

        $this->workspaceRepository->update($workspace);

        $workspaceUser = $this->workspaceUserRepository->create()
            ->setRole(WorkspaceRoleEnum::OWNER)
            ->setUser($user)
            ->setWorkspace($workspace);

        $this->workspaceUserRepository->update($workspaceUser);

    }
}
