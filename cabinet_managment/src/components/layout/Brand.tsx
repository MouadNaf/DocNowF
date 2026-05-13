export function Brand() {
  return (
    <div className="mb-7 flex items-center justify-center gap-2.5">
      <div className="h-9 w-9 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className="h-full w-full">
          <defs>
            <linearGradient id="brandHeart" x1="12" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#35C97D" />
              <stop offset="1" stopColor="#1D9E75" />
            </linearGradient>
          </defs>
          <path
            d="M32 62c-1.1 0-2.1-.3-3-1.1C12.8 47.8 2.2 38.4 2.2 26.8 2.2 17.2 9.8 9.6 19.2 9.6c5.1 0 9.8 2.3 12.8 6.3 3-4 7.7-6.3 12.8-6.3 9.4 0 17 7.6 17 17.2 0 11.6-10.6 21-26.8 34.1-.9.8-1.9 1.1-3 1.1z"
            fill="url(#brandHeart)"
          />
          <path
            d="M8 34h13l3.6-8.2 5.3 15.4 4.5-10.2h21"
            stroke="#F4FFF7"
            strokeWidth="3.9"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-[17px] font-semibold tracking-tight text-gray-900 dark:text-slate-100">DocNow</span>
    </div>
  )
}
