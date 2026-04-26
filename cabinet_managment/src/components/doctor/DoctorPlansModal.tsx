import React from 'react';
import { Button } from '@/components/ui/Button';
import { Check, Crown, Zap, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const plans = [
  {
    name: 'Basique',
    price: 'Gratuit',
    description: 'Pour les médecins qui débutent sur la plateforme.',
    features: [
      'Profil public vérifié',
      'Visibilité dans les recherches',
      'Réception de messages',
      'Gestion de base des patients'
    ],
    buttonText: 'Plan actuel',
    isPremium: false
  },
  {
    name: 'Premium Professional',
    price: '2,500 DZD',
    period: '/ mois',
    description: 'Tout ce dont vous avez besoin pour gérer votre cabinet privé.',
    features: [
      'Création de cabinet privé',
      'Prise de rendez-vous en ligne',
      'Gestion des secrétaires',
      'Statistiques avancées',
      'Support prioritaire 24/7'
    ],
    buttonText: 'Passer au Premium',
    highlight: true,
    isPremium: true
  }
];

interface DoctorPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DoctorPlansModal({ isOpen, onClose }: DoctorPlansModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 sm:p-12 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Propulsez votre pratique au <span className="text-[#1D9E75]">niveau supérieur</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
              Choisissez le plan qui correspond à vos besoins et commencez à gérer votre cabinet numérique dès aujourd'hui.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={cn(
                  "relative bg-white rounded-[32px] p-8 sm:p-10 border transition-all duration-300",
                  plan.highlight 
                    ? "border-[#1D9E75] shadow-xl shadow-emerald-50 lg:scale-105 z-10" 
                    : "border-gray-100"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white px-5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Crown size={14} /> Recommandé
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 font-bold">{plan.period}</span>}
                  </div>

                  <div className="space-y-4 pt-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className={cn(
                          "size-6 rounded-full flex items-center justify-center shrink-0",
                          plan.highlight ? "bg-emerald-50 text-[#1D9E75]" : "bg-gray-50 text-gray-400"
                        )}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-gray-600 font-medium text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button 
                      fullWidth 
                      size="lg" 
                      className={cn(
                        "rounded-2xl py-6 text-base font-bold transition-all",
                        plan.highlight 
                          ? "bg-[#1D9E75] hover:bg-[#15805d] shadow-lg shadow-emerald-100" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      variant={plan.highlight ? 'default' : 'secondary'}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1D9E75]/5 rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border border-[#1D9E75]/10 mt-8">
            <div className="size-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck size={28} className="text-[#1D9E75]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-lg font-bold text-gray-900">Garantie de satisfaction</h4>
              <p className="text-gray-600 mt-1 font-medium text-sm">
                Essayez le plan Premium pendant 14 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement.
              </p>
            </div>
            <Zap size={40} className="text-emerald-200 hidden md:block shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
