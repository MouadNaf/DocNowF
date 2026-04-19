import { Check } from 'lucide-react'

const features = [
  'Manage appointments, schedules & patient flow',
  'Connect with clinics and collective practices',
  'Secure, built for Algerian healthcare',
]

export function AuthHeroPanel({ className = '' }: { className?: string }) {
  return (
    <aside
      className={`relative flex min-h-\[220px\] flex-col overflow-hidden bg-[#0f3d2f] px-8 py-10 text-white lg:max-h-screen lg:min-h-screen lg:overflow-y-auto lg:px-10 lg:py-12 ${className}`}
      aria-label="Takwit Health overview"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'%3E%3Cpath fill='%23ffffff' d='M0 200c120-40 200-40 320 0s200 40 320 0v200H0z'/%3E%3C/svg%3E")`,
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 45%',
        }}
      />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-\[320px\] rounded-full bg-[#1d9e75]/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-16 top-1/3 size-\[200px\] rounded-full bg-white/5 blur-2xl" aria-hidden />

      <div className="relative .z-\[1\] flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <span className="text-xl font-light leading-none text-white">+</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">Takwit Health</span>
      </div>

      <div className="relative .z-\[1\] mt-8 lg:mt-14">
        <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2rem] lg:leading-[1.15]">
          Healthcare management, simplified.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
          Algeria&apos;s unified platform for doctors, clinics, and cabinets — one place to run schedules and stay compliant.
        </p>
      </div>

      <ul className="relative .z-\[1\] mt-8 space-y-3.5 lg:mt-10">
        {features.map((text) => (
          <li key={text} className="flex gap-3 text-sm leading-snug text-white/95">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1d9e75] ring-2 ring-white/25">
              <Check className="size-3 text-white" strokeWidth={3} aria-hidden />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <div className="relative .z-\[1\] mt-10 grid grid-cols-3 gap-3 border-t border-white/15 pt-8 lg:mt-auto lg:pt-10">
        <div>
          <p className="text-lg font-bold tabular-nums">500+</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">Doctors</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums">50+</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">Clinics</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums">10K+</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">Patients</p>
        </div>
      </div>

      <figure className="relative .z-\[1\] mt-8 rounded-2xl border border-white/10 bg-white\/\[0.08\] p-4 backdrop-blur-sm lg:mt-8">
        <blockquote className="text-sm leading-relaxed text-white/90">
          &ldquo;Takwit cut our no-shows and gave us one clear schedule across two sites.&rdquo;
        </blockquote>
        <figcaption className="mt-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1d9e75]/40 text-xs font-semibold text-white ring-2 ring-white/20">
            AB
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Dr. Amina Benali</p>
            <p className="text-xs text-white/70">Neurologist</p>
          </div>
        </figcaption>
      </figure>
    </aside>
  )
}
