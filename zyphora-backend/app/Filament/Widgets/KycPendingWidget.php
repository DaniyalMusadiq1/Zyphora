<?php

namespace App\Filament\Widgets;

use App\Models\KycVerification;
use Filament\Widgets\TableWidget as BaseWidget;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Support\Colors\Color;
use Illuminate\Database\Eloquent\Builder;

class KycPendingWidget extends BaseWidget
{
    protected int | string | array $columnSpan = 'full';

    protected static ?int $sort = 2;

    public function table(Table $table): Table
    {
        return $table
            ->query(KycVerification::query()->where('status', 'pending'))
            ->columns([
                TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->limit(20),
                
                BadgeColumn::make('tier')
                    ->label('Tier')
                    ->formatStateUsing(fn (int $state): string => 'T' . $state)
                    ->color(fn (int $state): array => match ($state) {
                        1 => Color::Blue,
                        2 => Color::Purple,
                        3 => Color::Emerald,
                        default => Color::Gray,
                    }),
                
                TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime('M j, g:i A')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'asc')
            ->paginated([5, 10, 25])
            ->headerActions([])
            ->recordActions([]);
    }
}
