<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PrivateCabinetController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| AUTH ROUTES (ANY LOGGED USER)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/doctors', [\App\Http\Controllers\PublicDoctorController::class, 'index']);

    Route::get('/me', function (Request $request) {
        $user = $request->user();
        $authController = new \App\Http\Controllers\AuthController();
        $reflection = new \ReflectionClass($authController);
        $method = $reflection->getMethod('getRoleData');
        $method->setAccessible(true);
        $roleData = $method->invoke($authController, $user);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'city' => $user->city,
            'address' => $user->address,
            'gender' => $user->gender,
            'date_of_birth' => $user->date_of_birth,
            'role' => $user->role,
            'profile_picture' => $user->profile_picture 
                ? asset("storage/{$user->profile_picture}") 
                : null,
            'role_data' => $roleData,
        ]);
    });

    Route::put('/profile', [AuthController::class, 'updateProfile']);

    /*
    |--------------------------------------------------------------------------
    | APPOINTMENTS (PATIENT + SECRETARY)
    |--------------------------------------------------------------------------
    */

    Route::prefix('appointments')->group(function () {

        Route::post('/', [AppointmentController::class, 'store']);
        Route::get('/{appointment}', [AppointmentController::class, 'show']);
        Route::put('/{appointme
        nt}', [AppointmentController::class, 'cancel']);
        Route::get('/slots/{doctorId}/{date}/{cabinetType}/{cabinetId}',
            [AppointmentController::class, 'generateSlots']
        );
        Route::post('/walk-in', [DashboardController::class, 'walkIn']);
        Route::get('/dashboard/doc', [AppointmentController::class, 'getDoctorDashboard']);
    });

    // Doctor Dashboard & Consultation (Specific Logic)
    Route::group(['prefix' => 'doctor'], function() {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/calendar', [DashboardController::class, 'calendar']);
        Route::get('/appointments/{id}', [DashboardController::class, 'show']);
        Route::post('/appointments/{id}/consultation', [DashboardController::class, 'saveConsultation']);
        Route::patch('/appointments/{id}/set-price', [DashboardController::class, 'setPrice']);
        Route::patch('/appointments/{id}/mark-paid', [DashboardController::class, 'markPaid']);
        Route::get('/patients/{id}/history', [DashboardController::class, 'patientHistory']);
    });

    Route::get('/patients', [DashboardController::class, 'patients']);
    Route::get('/patients/search-by-phone', [DashboardController::class, 'searchByPhone']);
    Route::post('/patients', [DashboardController::class, 'storePatient']);
    Route::get('/appointments', [DashboardController::class, 'appointments']);
    Route::patch('/appointments/{id}/status', [DashboardController::class, 'updateStatus']);
    Route::patch('/appointments/{id}/note', [DashboardController::class, 'updateNote']);
    Route::post('/appointments/{id}/payment', [DashboardController::class, 'markPaid']);

    /*
    |--------------------------------------------------------------------------
    | DOCTOR ONLY (verified + active)
    |--------------------------------------------------------------------------
    */

    Route::middleware('doctor.approved')->group(function () {

        /* PRIVATE CABINET */
        Route::prefix('private-cabinets')->group(function () {

            Route::post('/', [PrivateCabinetController::class, 'store']);
            Route::get('/', [PrivateCabinetController::class, 'show']);
            Route::put('/{id}', [PrivateCabinetController::class, 'update']);
            Route::delete('/{id}', [PrivateCabinetController::class, 'destroy']);

            /* availability */
            Route::post('/availabilities', [PrivateCabinetController::class, 'createAvailability']);
            Route::get('/availabilities', [PrivateCabinetController::class, 'getAvailabilities']);
            Route::put('/availabilities/{id}', [PrivateCabinetController::class, 'updateAvailability']);
            Route::delete('/availabilities/{id}', [PrivateCabinetController::class, 'deleteAvailability']);

            /* unavailability */
            Route::post('/unavailabilities', [PrivateCabinetController::class, 'createUnavailability']);
            Route::get('/unavailabilities', [PrivateCabinetController::class, 'getUnavailabilities']);
            Route::delete('/unavailabilities/{id}', [PrivateCabinetController::class, 'deleteUnavailability']);

            /* secretaries */
            Route::get('/secretaries', [PrivateCabinetController::class, 'getSecretaries']);
            Route::post('/secretaries', [PrivateCabinetController::class, 'createSecretary']);
            Route::delete('/secretaries/{id}', [PrivateCabinetController::class, 'deleteSecretary']);

            /* doctor view appointments */
            Route::get('/appointments', [PrivateCabinetController::class, 'getAppointments']);
        });

        /* consultations */
        Route::prefix('consultations')->group(function () {

            Route::post('{appointmentId}', [ConsultationController::class, 'store']);
            Route::get('/{appointmentId}', [ConsultationController::class, 'show']);
            Route::put('/{appointmentId}', [ConsultationController::class, 'update']);
            Route::delete('/{appointmentId}', [ConsultationController::class, 'destroy']);
            Route::get('/', [ConsultationController::class, 'index']);
            Route::get('/stats/doctor', [ConsultationController::class, 'getDoctorStats']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */

    Route::middleware('admin')
        ->prefix('admin')
        ->group(function () {

            Route::get('/doctors', [AdminController::class, 'getAllDoctors']);
            Route::get('/doctors/pending', [AdminController::class, 'getPendingDoctors']);
            Route::post('/doctors/{id}/approve', [AdminController::class, 'approveDoctor']);
            Route::patch('/doctors/{id}/toggle-status', [AdminController::class, 'toggleDoctorStatus']);
            Route::delete('/doctors/{id}/reject', [AdminController::class, 'rejectDoctor']);

            Route::get('/clinics', [AdminController::class, 'getAllClinics']);
            Route::post('/clinics/{id}/approve', [AdminController::class, 'approveClinic']);
            Route::patch('/clinics/{id}/toggle-status', [AdminController::class, 'toggleClinicStatus']);
            Route::delete('/clinics/{id}/reject', [AdminController::class, 'rejectClinic']);

            Route::get('/cabinets', [AdminController::class, 'getAllCabinets']);
            Route::get('/private-cabinets', [AdminController::class, 'getAllPrivateCabinets']);
            Route::post('/cabinets/{id}/approve', [AdminController::class, 'approveCabinet']);
            Route::patch('/cabinets/{id}/toggle-status', [AdminController::class, 'toggleCabinetStatus']);
            Route::delete('/cabinets/{id}/reject', [AdminController::class, 'rejectCabinet']);

            Route::get('/secretaries', [AdminController::class, 'getAllSecretaries']);
            Route::get('/patients', [AdminController::class, 'getAllPatients']);
        });
});