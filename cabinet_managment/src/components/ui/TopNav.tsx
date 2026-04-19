import { Bell, Moon } from 'lucide-react';

export function TopNav() {
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-100 bg-white px-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 leading-tight">Welcome back, Dr.</h2>
        <p className="text-sm font-medium text-gray-500 mt-1">{formattedDate}</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Language toggle placeholders */}
        <div className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
          <span className="text-gray-400 text-lg border-r border-gray-300 pr-2">A<span className="text-xs">文</span></span>
          English
        </div>

        {/* Theme Toggle placeholder */}
        <button className="text-gray-500 hover:text-gray-700 transition">
          <Moon size={20} />
        </button>

        {/* Notifications placeholder */}
        <div className="relative cursor-pointer text-gray-500 hover:text-gray-700 transition">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-gray-100 pl-6 cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
            DSJ
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Dr. Sarah Johnson</p>
            <p className="text-xs font-semibold text-gray-400 mt-1">Doctor</p>
          </div>
        </div>
      </div>
    </header>
  );
}
