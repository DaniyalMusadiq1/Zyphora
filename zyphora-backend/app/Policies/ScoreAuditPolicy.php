<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\ScoreAudit;

class ScoreAuditPolicy
{
    public function viewAny(Admin $admin): bool
    {
        return $admin->is_superadmin === true;
    }

    public function view(Admin $admin, ScoreAudit $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function create(Admin $admin): bool
    {
        return $admin->is_superadmin === true;
    }

    public function update(Admin $admin, ScoreAudit $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function delete(Admin $admin, ScoreAudit $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function restore(Admin $admin, ScoreAudit $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function forceDelete(Admin $admin, ScoreAudit $model): bool
    {
        return $admin->is_superadmin === true;
    }
}
