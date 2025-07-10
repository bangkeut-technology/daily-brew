<?php
declare(strict_types=1);


namespace App\Util;

use Exception;
use InvalidArgumentException;
use Random\RandomException;

/**
 * Class TokenGenerator
 *
 * @package App\Util
 *
 * @author  Vandeth Tho <thovandeth@gmail.com>
 */
readonly class TokenGenerator implements TokenGeneratorInterface
{
    /**
     * TokenGenerator constructor.
     *
     * @param int $entropy
     */
    public function __construct(private int $entropy = 256)
    {
    }

    /**
     * {@inheritDoc}
     * @throws Exception
     */
    public function generateToken(): string
    {
        $bytes = random_bytes($this->entropy / 8);

        return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
    }

    /**
     * {@inheritDoc}
     * @throws Exception
     */
    public function generateTokenWithoutUnderscore(): string
    {
        return bin2hex(random_bytes($this->entropy / 8));
    }

    /**
     * {@inheritDoc}
     */
    public function generateAlphanumericToken(): string
    {
        $data = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz';

        return substr(str_shuffle($data), 0, $this->entropy / 8);
    }

    /**
     * Generate a random token.
     *
     * @param bool $numeric   The token will contain numeric characters.
     * @param bool $majuscule The token will contain majuscule characters.
     * @param bool $minuscule The token will contain minuscule characters.
     * @param bool $symbols   The token will contain symbols characters.
     * @param int  $length    The length of the token.
     * @return string The generated token.
     * @throws RandomException
     */
    public static function generate(
        bool $numeric = true,
        bool $majuscule = true,
        bool $minuscule = true,
        bool $symbols = true,
        int  $length = 32
    ): string
    {
        return self::generateFromString(self::getString($numeric, $majuscule, $minuscule, $symbols), $length);
    }

    /**
     * Get an alphanumeric string.
     *
     * @param bool $numeric   The string will contain numeric characters.
     * @param bool $majuscule The string will contain majuscule characters.
     * @param bool $minuscule The string will contain minuscule characters.
     * @param bool $symbols   The string will contain symbols characters.
     * @return string
     */
    public static function getString(
        bool $numeric = true,
        bool $majuscule = true,
        bool $minuscule = true,
        bool $symbols = true,
    ): string
    {
        $characters = [
            'numeric' => '1234567890',
            'majuscule' => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            'minuscule' => 'abcefghijklmnopqrstuvwxyz',
            'symbols' => '!@#$%^&*()+',
        ];

        $data = '';
        if ($numeric) {
            $data .= $characters['numeric'];
        }
        if ($majuscule) {
            $data .= $characters['majuscule'];
        }
        if ($minuscule) {
            $data .= $characters['minuscule'];
        }
        if ($symbols) {
            $data .= $characters['symbols'];
        }

        if (empty($data)) {
            throw new InvalidArgumentException('At least one character set must be enabled.');
        }

        return $data;
    }

    /**
     * Generate a random token from a string.
     *
     * @param string $string The string to generate the token from.
     * @param int    $length The length of the token.
     * @return string The generated token.
     * @throws RandomException
     */
    public static function generateFromString(string $string, int $length = 32): string
    {
        $token = '';
        $dataLength = strlen($string);

        for ($i = 0; $i < $length; $i++) {
            $token .= $string[random_int(0, $dataLength - 1)];
        }

        return $token;
    }
}
