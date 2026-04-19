<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PrivateCabinetController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\AppointmentController;

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

    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

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
        Route::get(
           '/slots/{doctorId}/{date}/{cabinetType}/{cabinetId}',
            [AppointmentController::class, 'generateSlots']
);
        Route::get('/', [AppointmentController::class, 'index']);
        Route::get('/dashboard/doc', [AppointmentController::class, 'getDoctorDashboard']);
    });

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

            Route::get('/doctors/pending', [AdminController::class, 'getPendingDoctors']);
            Route::post('/doctors/{id}/approve', [AdminController::class, 'approveDoctor']);
            Route::delete('/doctors/{id}/reject', [AdminController::class, 'rejectDoctor']);
        });
});