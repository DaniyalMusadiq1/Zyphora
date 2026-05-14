<?php

namespace App\Services;

use App\Models\DeviceRegistry;
use App\Models\User;

class DeviceRegistryService
{
    public function assertCanRegister(string $deviceId): void
    {
        $max = (int) config('zyphora.max_accounts_per_device', 2);
        $row = DeviceRegistry::query()->find($deviceId);

        if ($row && (int) $row->account_count >= $max) {
            abort(422, 'Device account limit reached.');
        }
    }

    public function attachUserDevice(User $user, string $deviceId): void
    {
        if ($user->device_id === $deviceId) {
            return;
        }

        $this->assertCanRegister($deviceId);

        $row = DeviceRegistry::query()->firstOrNew(['device_id' => $deviceId]);
        $row->account_count = (int) $row->account_count + 1;
        $row->save();

        $user->device_id = $deviceId;
        $user->save();
    }
}
