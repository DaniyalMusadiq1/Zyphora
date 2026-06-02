<?php

namespace App\Filament\Resources\KycVerifications\Pages;

use App\Filament\Resources\KycVerifications\KycVerificationResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageKycVerifications extends ManageRecords
{
    protected static string $resource = KycVerificationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // No create action since KYC verifications are created by users
        ];
    }
}
