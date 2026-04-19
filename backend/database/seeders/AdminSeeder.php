<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run()
{
    \App\Models\User::create([
        'name' => 'Admin',
        'email' => 'mouad@gmail.com',
        'password' => Hash::make('mouad2003'),
        'role' => 'admin',
        'city' => 'Algiers',
        'address' => 'Admin Office',
        'gender' => 'male',
        'phone_number' => '0676752524',
        'date_of_birth' => '2003-08-18',
    ]);
}
}
