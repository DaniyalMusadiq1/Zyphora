<?php
namespace App\Services;

use App\Models\DeviceRegistry;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DeviceRegistryService
{
    public function assertCanRegister(string $deviceId): void
    {
        $count = DeviceRegistry::query()
            ->where('device_id', $deviceId)
            ->select('user_id')
            ->distinct()
            ->count();

        if ($count >= 2) {
            throw ValidationException::withMessages([
                'device' => 'Maximum 2 accounts allowed per device.'
            ]);
        }
    }

    public function attachUserDevice(User $user, string $deviceId, Request $request = null): void
    {
        $request = $request ?? request();

        DeviceRegistry::updateOrCreate(
            [
                'device_id' => $deviceId,
                'user_id'   => $user->id,
            ],
            [
                'ip_address'     => $request->ip(),
                'user_agent'     => $request->userAgent(),
                'location_city'  => $this->getCityFromIp($request->ip()),
                'location_country' => $this->getCountryFromIp($request->ip()),
                'last_used_at'   => now(),
            ]
        );
    }

    private function getCityFromIp(?string $ip): ?string
    {
        // Optional: integrate freegeoip.app or similar
        return null;
    }

    private function getCountryFromIp(?string $ip): ?string
    {
        return null;
    }
}