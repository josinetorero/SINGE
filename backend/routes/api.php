<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

// Rotas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [AuthController::class, 'user']);

});

// Rotas de teste de autorização
Route::middleware(['auth:sanctum', 'perfil:Administrador'])
    ->get('/teste-admin', function () {
        return response()->json([
            'message' => 'Acesso autorizado ao administrador.'
        ]);
    });

Route::middleware(['auth:sanctum', 'perfil:Coordenador'])
    ->get('/teste-coordenador', function () {
        return response()->json([
            'message' => 'Acesso autorizado ao coordenador.'
        ]);
    });

Route::middleware(['auth:sanctum', 'perfil:Cidadão'])
    ->get('/teste-cidadao', function () {
        return response()->json([
            'message' => 'Acesso autorizado ao cidadão.'
        ]);
    });