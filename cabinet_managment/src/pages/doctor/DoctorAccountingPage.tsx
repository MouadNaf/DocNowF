import React, { useMemo } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useAppointments } from '@/shared/api/hooks';
import { StatCard } from '@/components/ui/StatCard';
import { DollarSign, AlertCircle, CheckCircle2, Wallet, Plus, ArrowUpRight, ArrowDownLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useWallet, useWalletTransactions, useRechargeRequests } from '@/shared/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { submitRechargeRequest } from '@/shared/api/doctor.api';

export function DoctorAccountingPage() {
    const { appointments, loading: aptsLoading } = useAppointments();
    const { data: wallet, loading: walletLoading, refresh: refreshWallet } = useWallet();
    const { transactions, loading: txLoading } = useWalletTransactions();
    const { requests, refresh: refreshRequests } = useRechargeRequests();
    
    const [isRecharging, setIsRecharging] = React.useState(false);
    const [rechargeAmount, setRechargeAmount] = React.useState('1000');
    const [proofFile, setProofFile] = React.useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [rechargeError, setRechargeError] = React.useState('');
    const [rechargeSuccess, setRechargeSuccess] = React.useState(false);

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile) return setRechargeError('Please upload payment proof');
        
        setIsSubmitting(true);
        setRechargeError('');
        
        try {
            const formData = new FormData();
            formData.append('amount', rechargeAmount);
            formData.append('payment_proof', proofFile);
            
            await submitRechargeRequest(formData);
            setRechargeSuccess(true);
            setIsRecharging(false);
            refreshWallet();
            refreshRequests();
        } catch (err: any) {
            setRechargeError(err.response?.data?.message || 'Failed to submit recharge request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const loading = aptsLoading || walletLoading;

    const { totalExpected, totalPaid, totalUnpaid } = useMemo(() => {
        let expected = 0;
        let paid = 0;
        let unpaid = 0;

        appointments.forEach(apt => {
            const fee = Number(apt.consultation_fee || 0);
            expected += fee;
            if (apt.payment_status === 'paid') {
                paid += fee;
            } else {
                unpaid += fee;
            }
        });

        return { totalExpected: expected, totalPaid: paid, totalUnpaid: unpaid };
    }, [appointments]);

    return (
        <DoctorLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Accounting & Revenue</h2>
                    <p className="text-gray-500">Track your consultation fees and payment statuses.</p>
                </div>

                {loading ? (
                    <div className="p-4 text-center">Loading accounting data...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <StatCard 
                                title="Wallet Balance" 
                                value={`${wallet?.balance || 0} DZD`} 
                                icon={<Wallet size={24} />} 
                                iconBgClass="bg-emerald-50"
                                iconColorClass="text-[#1D9E75]"
                                subtext={wallet?.is_exhausted ? "Account Blocked" : "Active Balance"}
                                subtextColorClass={wallet?.is_exhausted ? "text-red-500" : "text-emerald-500"}
                            />
                            <StatCard 
                                title="Expected Revenue" 
                                value={`${totalExpected} DZD`} 
                                icon={<DollarSign size={24} />} 
                                iconBgClass="bg-blue-50"
                                iconColorClass="text-blue-500"
                            />
                            <StatCard 
                                title="Total Paid" 
                                value={`${totalPaid} DZD`} 
                                icon={<CheckCircle2 size={24} />} 
                                iconBgClass="bg-green-50"
                                iconColorClass="text-green-600"
                            />
                            <StatCard 
                                title="Pending" 
                                value={`${totalUnpaid} DZD`} 
                                icon={<AlertCircle size={24} />} 
                                iconBgClass="bg-yellow-50"
                                iconColorClass="text-yellow-500"
                            />
                        </div>

                        {rechargeSuccess && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 flex items-center justify-between">
                                <p className="font-medium">Recharge request submitted successfully! Admin will review it shortly.</p>
                                <button onClick={() => setRechargeSuccess(false)} className="text-green-900 font-bold">×</button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Platform Fees History</h3>
                                        <span className="text-sm text-gray-500 font-medium">Auto-deducted per completed appointment</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {txLoading ? (
                                                    <tr><td colSpan={4} className="p-4 text-center">Loading transactions...</td></tr>
                                                ) : transactions.length === 0 ? (
                                                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">No transactions yet.</td></tr>
                                                ) : transactions.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(tx.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                {tx.amount > 0 ? (
                                                                    <ArrowUpRight size={16} className="text-emerald-500" />
                                                                ) : (
                                                                    <ArrowDownLeft size={16} className="text-red-500" />
                                                                )}
                                                                <span className="text-sm font-medium text-gray-900 capitalize">
                                                                    {tx.type.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {tx.amount > 0 ? '+' : ''}{tx.amount} DA
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {tx.balance_after} DA
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Patient Payment History</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {appointments.map((apt) => (
                                                    <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {apt.appointment_date}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                            {apt.patient?.name || `Patient #${apt.patient_id}`}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                            {apt.consultation_fee ?? 0} DA
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${apt.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {apt.payment_status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-[#f0f9f6] rounded-2xl border border-[#d1e9e0] p-6 shadow-sm">
                                    <div className="size-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                        <Plus className="text-[#1D9E75]" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">Recharge Your Wallet</h4>
                                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                        Submit a recharge request by uploading your payment proof (CCP/Baridimob/Bank Transfer).
                                    </p>
                                    
                                    {!isRecharging ? (
                                        <Button className="w-full rounded-xl gap-2" onClick={() => setIsRecharging(true)}>
                                            <Plus size={18} />
                                            Submit Recharge Request
                                        </Button>
                                    ) : (
                                        <form onSubmit={handleRecharge} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                            <Input 
                                                label="Amount (DA)" 
                                                type="number" 
                                                value={rechargeAmount}
                                                onChange={(e) => setRechargeAmount(e.target.value)}
                                                min="100"
                                                required
                                            />
                                            
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Payment Proof</label>
                                                <div className="relative group cursor-pointer">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        required
                                                    />
                                                    <div className="w-full h-24 border-2 border-dashed border-gray-200 group-hover:border-[#1D9E75] rounded-xl flex flex-col items-center justify-center bg-white transition-colors">
                                                        {proofFile ? (
                                                            <p className="text-xs font-medium text-gray-900 px-2 text-center truncate w-full">{proofFile.name}</p>
                                                        ) : (
                                                            <>
                                                                <ImageIcon className="text-gray-400 group-hover:text-[#1D9E75]" size={20} />
                                                                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Select Image</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {rechargeError && <p className="text-xs text-red-500 font-medium">{rechargeError}</p>}

                                            <div className="flex gap-2 pt-2">
                                                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsRecharging(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" className="flex-1 rounded-xl" loading={isSubmitting}>
                                                    Submit
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4">Recharge Requests History</h4>
                                    <div className="space-y-3">
                                        {requests.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">No recent requests.</p>
                                        ) : requests.map((req) => (
                                            <div key={req.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{req.amount} DA</p>
                                                    <p className="text-[10px] text-gray-500">{new Date(req.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                                    req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-4">Payment Methods</h4>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">CCP (Algerie Poste)</p>
                                            <p className="text-sm font-bold text-gray-900">0012345678 / 90</p>
                                            <p className="text-xs text-gray-500">Name: DocNow SARL</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Baridimob RIP</p>
                                            <p className="text-sm font-bold text-gray-900">007 99999 0012345678 90</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DoctorLayout>
    );
}
