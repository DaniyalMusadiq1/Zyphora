<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\User;

class UserPolicy
{
    public function viewAny(Admin $admin): bool
    {
        return $admin->is_superadmin === true;
    }

    public function view(Admin $admin, User $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function create(Admin $admin): bool
    {
        return $admin->is_superadmin === true;
    }

    public function update(Admin $admin, User $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function delete(Admin $admin, User $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function restore(Admin $admin, User $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function forceDelete(Admin $admin, User $model): bool
    {
        return $admin->is_superadmin === true;
    }
}
