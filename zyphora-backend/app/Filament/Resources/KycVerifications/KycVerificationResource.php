<?php

namespace App\Filament\Resources\KycVerifications;

use App\Filament\Resources\KycVerifications\Pages\ManageKycVerifications;
use App\Models\KycVerification;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Colors\Color;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\HtmlString;

class KycVerificationResource extends Resource
{
    protected static ?string $model = KycVerification::class;

    protected static ?string $navigationLabel = 'KYC Verifications';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user.name')
                    ->label('User')
                    ->disabled()
                    ->dehydrated(false),
                
                Select::make('tier')
                    ->label('Tier')
                    ->options([
                        1 => 'Tier 1 - Basic',
                        2 => 'Tier 2 - Enhanced',
                        3 => 'Tier 3 - Premium',
                    ])
                    ->disabled()
                    ->dehydrated(false),
                
                Select::make('status')
                    ->label('Status')
                    ->options([
                        'pending' => 'Pending Review',
                        'reviewing' => 'Under Review',
                        'verified' => 'Verified ✓',
                        'rejected' => 'Rejected ✗',
                    ])
                    ->required()
                    ->native(false)
                    ->live(),
                
                Textarea::make('admin_notes')
                    ->label('Admin Notes')
                    ->placeholder('Add notes about this verification...')
                    ->rows(3)
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('User')
                    ->searchable(query: function (Builder $query, string $search): Builder {
                        return $query->whereHas('user', function (Builder $q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%")
                              ->orWhere('phone_hash', 'like', "%{$search}%");
                        });
                    })
                    ->sortable(),
                
                BadgeColumn::make('tier')
                    ->label('Tier')
                    ->sortable()
                    ->formatStateUsing(fn (int $state): string => match ($state) {
                        1 => 'T1',
                        2 => 'T2',
                        3 => 'T3',
                        default => 'T0',
                    })
                    ->color(fn (int $state): array => match ($state) {
                        1 => Color::Blue,
                        2 => Color::Purple,
                        3 => Color::Emerald,
                        default => Color::Gray,
                    }),
                
                BadgeColumn::make('status')
                    ->label('Status')
                    ->sortable()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Pending',
                        'reviewing' => 'Reviewing',
                        'verified' => 'Verified',
                        'rejected' => 'Rejected',
                        default => ucfirst($state),
                    })
                    ->color(fn (string $state): array => match ($state) {
                        'pending' => Color::Amber,
                        'reviewing' => Color::Blue,
                        'verified' => Color::Emerald,
                        'rejected' => Color::Rose,
                        default => Color::Gray,
                    }),
                
                TextColumn::make('provider_reference')
                    ->label('Reference')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                
                TextColumn::make('created_at')
                    ->label('Submitted')
                    ->dateTime('M j, Y g:i A')
                    ->sortable(),
                
                TextColumn::make('updated_at')
                    ->label('Updated')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                ViewAction::make()
                    ->icon(Heroicon::Eye)
                    ->modalHeading('KYC Verification Details')
                    ->modalContent(function (KycVerification $record): HtmlString {
                        $userData = $record->user;
                        $details = '<div class="space-y-4">';
                        $details .= '<div><strong>User:</strong> ' . e($userData->name ?? 'N/A') . '</div>';
                        $details .= '<div><strong>Email:</strong> ' . e($userData->email ?? 'N/A') . '</div>';
                        $details .= '<div><strong>Tier Requested:</strong> ' . e($record->tier) . '</div>';
                        $details .= '<div><strong>Status:</strong> ' . e($record->status) . '</div>';
                        $details .= '<div><strong>Reference:</strong> ' . e($record->provider_reference ?? 'N/A') . '</div>';
                        $details .= '<div><strong>Submitted:</strong> ' . $record->created_at->format('M j, Y g:i A') . '</div>';
                        
                        if ($record->document_type) {
                            $details .= '<div><strong>Document Type:</strong> ' . e(ucfirst(str_replace('_', ' ', $record->document_type))) . '</div>';
                        }
                        
                        if ($record->document_front) {
                            $details .= '<div><strong>Front Document:</strong> <a href="' . e($record->document_front) . '" target="_blank" class="text-primary-600 underline">View</a></div>';
                        }
                        
                        if ($record->document_back) {
                            $details .= '<div><strong>Back Document:</strong> <a href="' . e($record->document_back) . '" target="_blank" class="text-primary-600 underline">View</a></div>';
                        }
                        
                        if ($record->selfie) {
                            $details .= '<div><strong>Selfie:</strong> <a href="' . e($record->selfie) . '" target="_blank" class="text-primary-600 underline">View</a></div>';
                        }
                        
                        $details .= '</div>';
                        return new HtmlString($details);
                    }),
                
                EditAction::make()
                    ->icon(Heroicon::PencilSquare)
                    ->mutateFormDataUsing(function (array $data, KycVerification $record): array {
                        return $data;
                    })
                    ->after(function (KycVerification $record, array $data): void {
                        // When admin changes status to 'verified', update user's kyc_tier
                        if ($data['status'] === 'verified' && $record->status !== 'verified') {
                            $record->user->update([
                                'kyc_tier' => $record->tier,
                            ]);
                            
                            Notification::make()
                                ->title('KYC Verified Successfully')
                                ->body("User {$record->user->name} has been verified at Tier {$record->tier}")
                                ->success()
                                ->send();
                            
                            // Log the action
                            \App\Models\AdminActionLog::create([
                                'admin_id' => auth()->id(),
                                'target_user_id' => $record->user->id,
                                'action' => 'kyc_verified',
                                'reason' => "Manual KYC verification at Tier {$record->tier}. Admin notes: " . ($data['admin_notes'] ?? 'None'),
                            ]);
                        } elseif ($data['status'] === 'rejected' && $record->status !== 'rejected') {
                            Notification::make()
                                ->title('KYC Rejected')
                                ->body("KYC for user {$record->user->name} has been rejected")
                                ->danger()
                                ->send();
                            
                            \App\Models\AdminActionLog::create([
                                'admin_id' => auth()->id(),
                                'target_user_id' => $record->user->id,
                                'action' => 'kyc_rejected',
                                'reason' => "KYC rejection. Admin notes: " . ($data['admin_notes'] ?? 'None'),
                            ]);
                        }
                    }),
                
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['user']);
    }

    public static function getPages(): array
    {
        return [
            'index' => ManageKycVerifications::route('/'),
        ];
    }
    
    public static function canCreate(): bool
    {
        return false;
    }
}
