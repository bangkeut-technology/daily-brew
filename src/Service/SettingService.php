<?php
declare(strict_types=1);


namespace App\Service;

use App\Entity\User;
use App\Repository\UserSettingRepository;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Class SettingService
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class SettingService
{
    /**
     * @var User|null
     */
    private ?User $user;

    public function __construct(
        private readonly UserSettingRepository $settingRepository,
        private readonly Security              $security,
    ) {
        $this->user = $this->security->getUser();
    }

    /**
     * Retrieves a setting value based on the provided key associated with the current user.
     *
     * If the user is not available or the setting cannot be found, the default value is returned.
     *
     * @param string $key     The name of the setting to retrieve.
     * @param mixed  $default The fallback value if the setting does not exist.
     *
     * @return mixed The value of the setting or the default value.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        if (!$this->user) {
            return $default;
        }

        $setting = $this->settingRepository->findOneBy([
            'owner' => $this->user,
            'name' => $key,
        ]);

        return $setting?->getValue() ?? $default;
    }

    /**
     * Retrieves an integer setting value based on the provided key associated with the current user.
     *
     * If the setting cannot be found, the default integer value is returned.
     *
     * @param string $key     The name of the setting to retrieve.
     * @param int    $default The fallback value if the setting does not exist.
     *
     * @return int The integer value of the setting or the default value.
     */
    public function getInt(string $key, int $default = 0): int
    {
        return (int) $this->get($key, $default);
    }

    /**
     * Retrieves a string value associated with the given key.
     *
     * @param string $key     The key to retrieve the value for.
     * @param string $default The default value to return if the key does not exist.
     *
     * @return string The retrieved string value, or the default value if the key does not exist.
     */
    public function getString(string $key, string $default = ''): string
    {
        return (string) $this->get($key, $default);
    }
}
