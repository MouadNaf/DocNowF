export function Brand() {
  return (
    <div className="mb-7 flex items-center justify-center gap-2.5">
      <div className="flex h-9 w-9 .flex-shrink-0 items-center justify-center rounded-xl bg-[#E1F5EE]">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="1" y="1" width="7.5" height="7.5" rx="2.5" fill="#1D9E75" />
          <rect x="11.5" y="1" width="7.5" height="7.5" rx="2.5" fill="#1D9E75" />
          <rect x="1" y="11.5" width="7.5" height="7.5" rx="2.5" fill="#1D9E75" />
          <rect x="11.5" y="11.5" width="7.5" height="7.5" rx="2.5" fill="#9FE1CB" />
        </svg>
      </div>
      <span className="text-[17px] font-semibold tracking-tight text-gray-900 dark:text-slate-100">Takwit Health</span>
    </div>
  )
}
