import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  subtextColorClass?: string; // e.g. text-green-500
  icon: ReactNode;
  iconBgClass?: string; // e.g. bg-blue-50
  iconColorClass?: string; // e.g. text-blue-500
}

export function StatCard({ 
  title, 
  value, 
  subtext, 
  subtextColorClass = 'text-green-500', 
  icon, 
  iconBgClass = 'bg-blue-50', 
  iconColorClass = 'text-blue-500' 
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          
          {subtext && (
            <p className={`text-sm font-semibold mt-3 ${subtextColorClass}`}>
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${iconBgClass} ${iconColorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
