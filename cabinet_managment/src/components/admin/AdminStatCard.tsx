import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface AdminStatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export function AdminStatCard({ 
  label, 
  value, 
  trend, 
  trendUp, 
  icon, 
  iconBgColor, 
  iconColor 
}: AdminStatCardProps) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <h3 className="text-[32px] font-bold text-gray-900 leading-none">{value}</h3>
          {trend && (
            <p className={cn(
              "text-sm font-bold flex items-center gap-1",
              trendUp ? "text-[#1D9E75]" : "text-red-500"
            )}>
              {trendUp ? '↑' : '↓'} {trend}
              <span className="text-gray-400 font-medium ml-1">ce mois-ci</span>
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform hover:scale-110", 
          iconBgColor, 
          iconColor
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
