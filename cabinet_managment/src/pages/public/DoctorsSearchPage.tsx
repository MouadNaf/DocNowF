import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock, 
  X, 
  Star, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { usePreferencesStore } from '@/store/preferences.store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { WILAYAS } from '@/constants/algeria';
import { ROUTES } from '@/constants/routes';

interface Doctor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  specialty: string;
  gender: 'male' | 'female';
  city: string;
  address: string;
  phone_number?: string;
  profile_picture?: string;
  rating: string;
  reviews: string;
  fee: string;
  about: string;
  hospital: string;
  cabinet_id: string;
  cabinet_type: 'private' | 'clinic' | 'collective';
  is_verified: boolean;
  is_active: boolean;
}

interface Slot {
  start: string;
  end: string;
  is_available: boolean;
}

export function DoctorsSearchPage() {
  const { user } = useAuthStore();
  const language = usePreferencesStore((s) => s.language);
  const navigate = useNavigate();

  // Search & Filter state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState('');

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/doctors');
        if (res.data && res.data.success) {
          setDoctors(res.data.data || []);
        } else {
          setError('Impossible de charger la liste des médecins.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Une erreur est survenue lors de la récupération des médecins.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slots when booking doctor or date changes
  useEffect(() => {
    if (!bookingDoctor) return;

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setSlotsError('');
        setSelectedSlot(null);
        
        const res = await api.get(
          `/appointments/slots/${bookingDoctor.id}/${bookingDate}/${bookingDoctor.cabinet_type}/${bookingDoctor.cabinet_id}`
        );

        if (res.data && res.data.success) {
          setSlots(res.data.data?.slots || []);
          if (res.data.message) {
            setSlotsError(res.data.message);
          }
        } else {
          setSlotsError('Impossible de charger les créneaux disponibles.');
        }
      } catch (err: any) {
        console.error(err);
        setSlotsError(err.response?.data?.message || 'Erreur lors du chargement des créneaux.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [bookingDoctor, bookingDate]);

  // Handle appointment booking submission
  const handleBookAppointment = async () => {
    if (!bookingDoctor || !selectedSlot) return;

    if (!user) {
      setBookingStatus('error');
      setBookingMessage(t(language, 'loginToBook'));
      return;
    }

    try {
      setBookingStatus('submitting');
      const payload = {
        doctor_id: bookingDoctor.id,
        appointment_date: bookingDate,
        start_time: selectedSlot.start,
        cabinet_type: bookingDoctor.cabinet_type,
        cabinet_id: bookingDoctor.cabinet_id
      };

      const res = await api.post('/appointments', payload);
      if (res.data && res.data.success) {
        setBookingStatus('success');
      } else {
        setBookingStatus('error');
        setBookingMessage(res.data?.message || "Erreur lors de la réservation.");
      }
    } catch (err: any) {
      console.error(err);
      setBookingStatus('error');
      setBookingMessage(err.response?.data?.message || "Une erreur s'est produite lors de la réservation.");
    }
  };

  // Filter logic:
  // 1. Exclude the currently logged-in doctor ("same one doesn't display herself/himself")
  // 2. Filter by search query (name or specialty)
  // 3. Filter by dropdown values (Specialty, Wilaya, Gender)
  const filteredDoctors = doctors.filter((doc) => {
    // 1. Exclude self
    if (user && String(doc.user_id) === String(user.id)) {
      return false;
    }

    // 2. Search query (name or specialty)
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Dropdown filters
    const matchesSpecialty = selectedSpecialty === '' || doc.specialty === selectedSpecialty;
    const matchesCity = selectedCity === '' || doc.city === selectedCity;
    const matchesGender = selectedGender === '' || doc.gender === selectedGender;

    return matchesSearch && matchesSpecialty && matchesCity && matchesGender;
  });

  // Extract unique specialties for filtering
  const specialties = Array.from(new Set(doctors.map((d) => d.specialty))).filter(Boolean);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-75">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight">
          {t(language, 'searchCompareBook')}
        </h1>
        <p className="text-gray-500 font-medium text-base">
          {t(language, 'findHealthcarePro')}
        </p>
      </div>

      {/* Modern Combined Search & Filter Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-emerald-50/50 p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search query input */}
          <div className="lg:col-span-2 relative flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
            <Search className="text-gray-400 mr-3 shrink-0" size={20} />
            <input 
              type="text" 
              placeholder={t(language, 'searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-full text-gray-700 font-medium placeholder-gray-400 outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 transition">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Specialty Select */}
          <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-full text-gray-700 font-bold outline-none cursor-pointer"
            >
              <option value="">{t(language, 'specialtiesAll')}</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Wilaya/City Select */}
          <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 w-full text-gray-700 font-bold outline-none cursor-pointer"
            >
              <option value="">{t(language, 'wilayasAll')}</option>
              {WILAYAS.map((w) => (
                <option key={w.code} value={w.name}>{w.code} - {w.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender Filter row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">{t(language, 'gender')}</span>
            <button 
              onClick={() => setSelectedGender('')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === '' ? 'bg-[#1D9E75] text-white shadow-md shadow-emerald-50' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {t(language, 'all')}
            </button>
            <button 
              onClick={() => setSelectedGender('male')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === 'male' ? 'bg-[#1D9E75] text-white shadow-md shadow-emerald-50' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {t(language, 'male')}
            </button>
            <button 
              onClick={() => setSelectedGender('female')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === 'female' ? 'bg-[#1D9E75] text-white shadow-md shadow-emerald-50' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {t(language, 'female')}
            </button>
          </div>
          
          <div className="text-xs font-bold text-gray-400">
            {filteredDoctors.length} {t(language, 'doctorsFound')}
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-[#1D9E75]" size={40} />
          <p className="text-gray-500 font-bold">{t(language, 'loadingPros')}</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-700 max-w-md mx-auto">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={36} />
          <h3 className="font-bold text-lg mb-1">{t(language, 'loadingError')}</h3>
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm max-w-xl mx-auto">
          <MapPin className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="font-black text-xl text-gray-900 mb-2">{t(language, 'noDoctorFound')}</h3>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            {t(language, 'noDoctorDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className="bg-white rounded-[40px] border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Image and Verified Header */}
                <div className="flex gap-4 mb-5">
                  <div className="w-16 h-16 rounded-[24px] overflow-hidden bg-gray-50 border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-[#1D9E75] font-black text-xl">
                    {doctor.profile_picture ? (
                      <img src={doctor.profile_picture} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      doctor.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-gray-900 group-hover:text-[#1D9E75] transition-colors">{doctor.name}</h3>
                      {doctor.is_verified && (
                        <CheckCircle2 size={16} className="text-[#1D9E75] shrink-0" fill="currentColor" style={{ color: 'white', fill: '#1D9E75' }} />
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#1D9E75]">{doctor.specialty}</p>
                    <div className="flex items-center gap-1 mt-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-bold text-gray-900">{doctor.rating}</span>
                      <span className="text-[10px] text-gray-400 font-medium">({doctor.reviews} avis)</span>
                    </div>
                  </div>
                </div>

                {/* Info block */}
                <div className="space-y-3 py-4 border-t border-b border-gray-50 text-sm">
                  <div className="flex items-start gap-2.5 text-gray-600">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-xs line-clamp-2">{doctor.hospital} - {doctor.address}, {doctor.city}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <DollarSign size={16} className="text-gray-400 shrink-0" />
                    <span className="font-bold text-xs text-gray-900">{t(language, 'fee')} {doctor.fee}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-medium leading-relaxed my-4 line-clamp-3">
                  {doctor.about}
                </p>
              </div>

              <Button 
                onClick={() => setBookingDoctor(doctor)}
                className="w-full bg-[#1D9E75] hover:bg-[#15805d] rounded-2xl font-bold py-3 text-sm transition-all shadow-md shadow-emerald-50"
              >
                {t(language, 'bookAppointment')}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Drawer / Modal */}
      {bookingDoctor && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
              <div>
                <h2 className="text-xl font-black text-gray-900">{t(language, 'bookAppointmentTitle')}</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  {bookingDoctor.name} · {bookingDoctor.specialty}
                </p>
              </div>
              <button 
                onClick={() => {
                  setBookingDoctor(null);
                  setBookingStatus('idle');
                }}
                className="p-2 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content states */}
            {bookingStatus === 'success' ? (
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto text-[#1D9E75]">
                  <CheckCircle2 size={48} fill="currentColor" style={{ color: 'white', fill: '#1D9E75' }} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">{t(language, 'appointmentBooked')}</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-xs mx-auto">
                    {t(language, 'appointmentBookedDesc')}
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setBookingDoctor(null)}
                    className="flex-1 rounded-2xl font-bold py-3 text-sm"
                  >
                    {t(language, 'close')}
                  </Button>
                  <Button 
                    onClick={() => {
                      setBookingDoctor(null);
                      navigate((user?.role as string) === 'patient' ? ROUTES.PATIENT_APPOINTMENTS : '/doctor/appointments');
                    }}
                    className="flex-1 bg-[#1D9E75] hover:bg-[#15805d] rounded-2xl font-bold py-3 text-sm"
                  >
                    {t(language, 'myAppointments')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
                {/* Step 1: Date selection */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[#1D9E75] flex items-center gap-1.5">
                    <Calendar size={14} /> {t(language, 'chooseDate')}
                  </label>
                  <input 
                    type="date" 
                    min={today}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/10 outline-none cursor-pointer"
                  />
                </div>

                {/* Step 2: Slot Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[#1D9E75] flex items-center gap-1.5">
                    <Clock size={14} /> {t(language, 'availableSlots')}
                  </label>

                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-10 gap-2.5">
                      <Loader2 className="animate-spin text-[#1D9E75]" size={20} />
                      <span className="text-xs font-bold text-gray-500">{t(language, 'searchingSlots')}</span>
                    </div>
                  ) : slotsError ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs font-semibold leading-relaxed">
                      {slotsError}
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-100 text-gray-500 p-6 rounded-2xl text-center text-xs font-bold">
                      {t(language, 'noScheduleConfigured')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2.5">
                      {slots.map((slot) => {
                        const isSelected = selectedSlot?.start === slot.start;
                        return (
                          <button
                            key={slot.start}
                            disabled={!slot.is_available}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-3 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
                              !slot.is_available 
                                ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                                : isSelected
                                ? 'bg-[#1D9E75] border-[#1D9E75] text-white shadow-md shadow-emerald-50'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-[#1D9E75] hover:text-[#1D9E75]'
                            }`}
                          >
                            {slot.start}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {bookingStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{bookingMessage}</span>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setBookingDoctor(null);
                      setBookingStatus('idle');
                    }}
                    className="rounded-2xl font-bold py-3 text-sm px-6"
                  >
                    {t(language, 'cancel')}
                  </Button>
                  <Button 
                    onClick={handleBookAppointment}
                    disabled={!selectedSlot || bookingStatus === 'submitting'}
                    loading={bookingStatus === 'submitting'}
                    className="bg-[#1D9E75] hover:bg-[#15805d] rounded-2xl font-bold py-3 text-sm px-8"
                  >
                    {t(language, 'confirmAppointment')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
