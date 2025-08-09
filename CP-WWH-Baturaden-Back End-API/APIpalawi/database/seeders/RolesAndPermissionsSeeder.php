<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User; 

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Buat Permissions
        Permission::create(['name' => 'edit booking status']);
        Permission::create(['name' => 'manage all']);

        // Buat Roles dan berikan permission
        Role::create(['name' => 'user']);

        $bookingManagerRole = Role::create(['name' => 'booking-manager']);
        $bookingManagerRole->givePermissionTo('edit booking status');

        $superAdminRole = Role::create(['name' => 'super-admin']);
        $superAdminRole->givePermissionTo('manage all');

        // --- Buat User Contoh ---

        // Pengguna Super Admin
        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            // Tidak perlu bcrypt() lagi. Model User akan otomatis mengenkripsi.
            'password' => 'password',
        ])->assignRole('super-admin');

        // Pengguna Booking Manager
        User::factory()->create([
            'name' => 'Booking Manager',
            'email' => 'manager@example.com',
            'password' => 'password',
        ])->assignRole('booking-manager');
    }
}
