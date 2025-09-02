<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Constant\SettingConstant;
use App\Event\User\UserRegisteredEvent;
use App\Repository\SettingRepository;
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
        private SettingRepository $settingRepository,
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
        $settings = SettingConstant::getConstantsWithDefaults();

        foreach ($settings as $name => $value) {
            $setting = $this->settingRepository->create();
            $setting->setName($name);
            $setting->setValue((string)$value);
            $setting->setOwner($event->user);

            $this->settingRepository->update($setting, false);
        }

        $this->settingRepository->flush();
    }
}
