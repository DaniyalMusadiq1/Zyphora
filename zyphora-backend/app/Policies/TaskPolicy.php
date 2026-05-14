<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Task;

class TaskPolicy
{
    public function viewAny(Admin $admin): bool
    {
        return $admin->is_superadmin === true;
    }

    public function view(Admin $admin, Task $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function create(Admin $admin): bool
    {
        return $admin->is_superadmin === true;
    }

    public function update(Admin $admin, Task $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function delete(Admin $admin, Task $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function restore(Admin $admin, Task $model): bool
    {
        return $admin->is_superadmin === true;
    }

    public function forceDelete(Admin $admin, Task $model): bool
    {
        return $admin->is_superadmin === true;
    }
}
