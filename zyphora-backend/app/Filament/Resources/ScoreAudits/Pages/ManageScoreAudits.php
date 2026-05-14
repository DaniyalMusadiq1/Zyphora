<?php

namespace App\Filament\Resources\ScoreAudits\Pages;

use App\Filament\Resources\ScoreAudits\ScoreAuditResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageScoreAudits extends ManageRecords
{
    protected static string $resource = ScoreAuditResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
