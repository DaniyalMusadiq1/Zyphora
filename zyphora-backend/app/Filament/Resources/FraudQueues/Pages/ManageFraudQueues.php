<?php

namespace App\Filament\Resources\FraudQueues\Pages;

use App\Filament\Resources\FraudQueues\FraudQueueResource;
use Filament\Resources\Pages\ManageRecords;

class ManageFraudQueues extends ManageRecords
{
    protected static string $resource = FraudQueueResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
