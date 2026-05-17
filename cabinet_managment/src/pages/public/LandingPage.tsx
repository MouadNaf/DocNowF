import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Stethoscope, 
  MessageSquare, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Menu,
  X,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { ROUTES, ROLE_HOME } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils/cn';

export function LandingPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-[#1D9E75]/10 selection:text-[#1D9E75]">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 sm:px-12",
        scrolled ? "bg-white/80 backdrop-blur-lg border-b border-gray-100 py-3 shadow-sm" : "bg-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#hero">Accueil</NavLink>
            <NavLink href="#doctors">Médecins</NavLink>
            <NavLink href="#ai">Assistant IA</NavLink>
            <NavLink href="#about">À propos</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to={user?.role ? ROLE_HOME[user.role] : ROUTES.LOGIN}>
                  <Button variant="ghost" className="font-bold">Tableau de bord</Button>
                </Link>
                <div className="h-10 w-10 rounded-full bg-[#E8F7F1] flex items-center justify-center text-[#1D9E75] font-bold border-2 border-white shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" className="font-bold">Connexion</Button>
                </Link>
                <Link to={ROUTES.ROLE_PICKER}>
                  <Button className="bg-[#1D9E75] hover:bg-[#15805d] rounded-full px-6 font-bold shadow-lg shadow-emerald-100">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 md:hidden">
            <NavLink href="#hero" onClick={() => setIsMenuOpen(false)}>Accueil</NavLink>
            <NavLink href="#doctors" onClick={() => setIsMenuOpen(false)}>Médecins</NavLink>
            <NavLink href="#ai" onClick={() => setIsMenuOpen(false)}>Assistant IA</NavLink>
            <div className="h-[1px] bg-gray-100 my-2" />
            {isAuthenticated ? (
              <Link to={user?.role ? ROLE_HOME[user.role] : ROUTES.LOGIN}>
                <Button className="w-full">Tableau de bord</Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to={ROUTES.LOGIN} className="w-full">
                  <Button variant="outline" className="w-full">Connexion</Button>
                </Link>
                <Link to={ROUTES.ROLE_PICKER} className="w-full">
                  <Button className="w-full bg-[#1D9E75]">S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F0FDF4] rounded-l-[100px] -z-10 translate-x-1/4 rotate-12 opacity-50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#1D9E75]/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8F7F1] text-[#1D9E75] rounded-full text-sm font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9E75] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1D9E75]"></span>
              </span>
              Votre futur santé commence ici
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1]">
              Consultation médicale à <span className="text-[#1D9E75]">portée de clic.</span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              DocNow utilise l'intelligence artificielle pour analyser vos symptômes et vous orienter vers les meilleurs spécialistes proches de chez vous.
            </p>

            {/* Search Bar - Combined */}
            <div className="p-2 bg-white rounded-[24px] shadow-2xl shadow-[#1D9E75]/10 border border-gray-100 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Search className="text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Spécialité, symptôme (ex: Cardiologue, maux de tête...)" 
                  className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium"
                />
              </div>
              <Button size="lg" className="bg-[#1D9E75] hover:bg-[#15805d] rounded-2xl px-8 font-bold whitespace-nowrap shadow-lg shadow-emerald-100">
                Trouver un médecin
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
                <div className="h-10 w-10 rounded-full border-2 border-white bg-[#1D9E75] flex items-center justify-center text-white text-[10px] font-bold">
                  +10k
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Plus de <span className="text-gray-900">10,000 patients</span> nous font confiance
              </p>
            </div>
          </div>

          {/* Hero Image / Doctor Card */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="relative rounded-[48px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=2070&auto=format&fit=crop" 
                alt="Healthcare Professional"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Floating Cards */}
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-[32px] shadow-2xl shadow-black/5 border border-gray-100 animate-bounce-slow">
               <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                   <Star size={24} fill="currentColor" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-gray-900">Médecins Certifiés</p>
                   <p className="text-xs text-gray-500">4.9/5 Note moyenne</p>
                 </div>
               </div>
            </div>

            <div className="absolute top-20 -right-8 bg-white p-4 rounded-2xl shadow-2xl shadow-black/5 border border-gray-100 flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-xs font-bold">Médecins en ligne</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="doctors" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900">Tout ce dont vous avez besoin.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Une plateforme complète pour gérer votre santé au quotidien.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search size={28} />}
              title="Recherche intelligente"
              desc="Trouvez le spécialiste idéal en quelques secondes selon votre localisation et vos besoins."
              color="bg-blue-50 text-blue-600"
            />
            <FeatureCard 
              icon={<MessageSquare size={28} />}
              title="Assistant IA"
              desc="Décrivez vos symptômes à notre IA et obtenez une orientation immédiate vers le bon médecin."
              color="bg-emerald-50 text-emerald-600"
            />
            <FeatureCard 
              icon={<ShieldCheck size={28} />}
              title="Dossier Sécurisé"
              desc="Vos données médicales sont cryptées et accessibles uniquement par vous et vos médecins."
              color="bg-purple-50 text-purple-600"
            />
          </div>
        </div>
      </section>

      {/* AI Assistant Promo */}
      <section id="ai" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#1D9E75] rounded-[48px] p-8 lg:p-16 grid lg:grid-cols-2 gap-12 items-center relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
               <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="0.5" />
               </svg>
            </div>
            
            <div className="text-white space-y-8 relative z-10">
              <h2 className="text-4xl lg:text-6xl font-black leading-tight">L'intelligence artificielle au service de votre santé.</h2>
              <p className="text-emerald-50 text-lg">
                Notre assistant DocNow AI analyse vos symptômes avec précision pour vous rassurer et vous guider. Gagnez du temps et évitez les recherches inquiétantes sur internet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-[#1D9E75] hover:bg-emerald-50 rounded-2xl px-8 h-14 font-bold text-lg">
                  Essayer l'assistant
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-2xl px-8 h-14 font-bold text-lg">
                  Comment ça marche ?
                </Button>
              </div>
            </div>

            <div className="relative z-10 hidden lg:block">
              <div className="bg-white/10 backdrop-blur-2xl rounded-[32px] p-6 border border-white/20 shadow-2xl">
                 <div className="space-y-4">
                   <ChatBubble type="user" text="J'ai une douleur persistante au genou gauche depuis 2 jours." />
                   <ChatBubble type="ai" text="Je comprends. Cette douleur est-elle survenue après un effort physique ou un choc ? Avez-vous remarqué un gonflement ?" />
                   <ChatBubble type="user" text="Oui, c'est gonflé après avoir couru." />
                   <ChatBubble type="ai" text="Sur la base de vos symptômes, je vous suggère de consulter un Orthopédiste. Voulez-vous voir les spécialistes disponibles ?" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA For Doctors */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl font-black text-gray-900">Vous êtes un professionnel de santé ?</h2>
            <p className="text-lg text-gray-600">
              Rejoignez plus de 2,000 médecins et établissements qui utilisent DocNow pour gérer leurs rendez-vous et leur patientèle au quotidien.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to={ROUTES.REGISTER_DOCTOR}>
              <Button size="lg" className="bg-[#1D9E75] hover:bg-[#15805d] rounded-2xl px-10 h-16 font-bold text-xl shadow-xl shadow-emerald-100">
                Inscrire mon cabinet
                <ArrowRight size={24} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Logo textClassName="text-white" />
            <p className="text-sm leading-relaxed">
              La plateforme santé de référence pour les patients et les médecins en Algérie.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Plateforme</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-[#1D9E75] transition-colors">Trouver un médecin</a></li>
              <li><a href="#" className="hover:text-[#1D9E75] transition-colors">Assistant IA</a></li>
              <li><a href="#" className="hover:text-[#1D9E75] transition-colors">Prendre RDV</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Pour les pros</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to={ROUTES.REGISTER_DOCTOR} className="hover:text-[#1D9E75] transition-colors">Solution Cabinet</Link></li>
              <li><Link to={ROUTES.REGISTER_CLINIC} className="hover:text-[#1D9E75] transition-colors">Solution Clinique</Link></li>
              <li><a href="#" className="hover:text-[#1D9E75] transition-colors">Tarification</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li>contact@docnow.dz</li>
              <li>+213 (0) 555 00 00 00</li>
              <li>Alger, Algérie</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-16 pt-8 text-center text-xs">
          © 2026 DocNow. Tous droits réservés. Design premium par Antigravity.
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) {
  return (
    <a 
      href={href} 
      onClick={onClick}
      className="text-sm font-bold text-gray-600 hover:text-[#1D9E75] transition-colors"
    >
      {children}
    </a>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3", color)}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function ChatBubble({ type, text }: { type: 'user' | 'ai', text: string }) {
  return (
    <div className={cn(
      "max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed",
      type === 'user' ? "ml-auto bg-white/20 text-white rounded-tr-none" : "bg-white text-gray-900 rounded-tl-none shadow-lg"
    )}>
      {text}
    </div>
  );
}
