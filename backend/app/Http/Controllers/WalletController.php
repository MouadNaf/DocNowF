<?php

namespace App\Http\Controllers;

use App\Models\RechargeRequest;
use App\Models\Transaction;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    protected $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    /**
     * Get doctor wallet information.
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user->doctor) {
            return response()->json(['message' => 'Doctor profile not found'], 404);
        }

        $doctor = $user->doctor;

        return response()->json([
            'balance' => $doctor->wallet_balance,
            'low_balance_threshold' => $doctor->low_balance_threshold,
            'is_exhausted' => $doctor->wallet_balance <= 0,
            'recent_transactions' => $doctor->transactions()->latest()->take(5)->get(),
        ]);
    }

    /**
     * Get transaction history.
     */
    public function transactions()
    {
        $user = Auth::user();
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transactions = $doctor->transactions()->latest()->paginate(15);

        return response()->json($transactions);
    }

    /**
     * Submit a recharge request (Doctor).
     */
    public function submitRechargeRequest(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'payment_proof' => 'required|image|max:2048',
        ]);

        $user = Auth::user();
        $doctor = $user->doctor;

        if (!$doctor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $path = $request->file('payment_proof')->store('recharge_proofs', 'public');

        $rechargeRequest = RechargeRequest::create([
            'doctor_id' => $doctor->id,
            'amount' => $request->amount,
            'payment_proof' => $path,
            'status' => 'pending',
        ]);

        \App\Services\NotificationService::notifyAdmins(
            'Nouvelle demande de recharge',
            "Le Dr. {$doctor->user->name} a soumis une demande de recharge de {$request->amount} DZD.",
            'system',
            ['recharge_request_id' => $rechargeRequest->id]
        );

        return response()->json([
            'message' => 'Recharge request submitted successfully. It will be reviewed by an admin.',
            'data' => $rechargeRequest
        ]);
    }

    /**
     * List own recharge requests (Doctor).
     */
    public function doctorRechargeRequests()
    {
        $doctor = Auth::user()->doctor;
        if (!$doctor) return response()->json(['message' => 'Unauthorized'], 403);

        $requests = RechargeRequest::where('doctor_id', $doctor->id)->latest()->take(10)->get();
        return response()->json($requests);
    }

    /**
     * List all recharge requests (Admin).
     */
    public function adminRechargeRequests()
    {
        $requests = RechargeRequest::with('doctor.user')->latest()->paginate(15);
        return response()->json($requests);
    }

    /**
     * Approve recharge request (Admin).
     */
    public function approveRechargeRequest(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $rechargeRequest = RechargeRequest::findOrFail($id);

            if ($rechargeRequest->status !== 'pending') {
                return response()->json(['message' => 'Request already processed'], 400);
            }

            $rechargeRequest->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'notes' => $request->notes,
            ]);

            $this->walletService->recharge(
                $rechargeRequest->doctor,
                $rechargeRequest->amount,
                "Manual recharge approved (Request #{$rechargeRequest->id})",
                Auth::id()
            );

            return response()->json(['message' => 'Recharge approved successfully']);
        });
    }

    /**
     * Reject recharge request (Admin).
     */
    public function rejectRechargeRequest(Request $request, $id)
    {
        $rechargeRequest = RechargeRequest::findOrFail($id);

        if ($rechargeRequest->status !== 'pending') {
            return response()->json(['message' => 'Request already processed'], 400);
        }

        $rechargeRequest->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'notes' => $request->notes,
        ]);

        $this->walletService->notifyRechargeRejected($rechargeRequest->doctor, $request->notes ?? '');

        return response()->json(['message' => 'Recharge rejected']);
    }
}
