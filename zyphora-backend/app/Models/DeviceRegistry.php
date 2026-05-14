<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceRegistry extends Model
{
    protected $table = 'device_registry';

    protected $primaryKey = 'device_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'device_id',
        'account_count',
        'flagged',
    ];

    protected function casts(): array
    {
        return [
            'flagged' => 'boolean',
        ];
    }
}
