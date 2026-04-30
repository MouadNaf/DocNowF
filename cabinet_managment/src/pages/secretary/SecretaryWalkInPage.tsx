import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useCreateWalkIn, usePatients } from '@/hooks/useSecretary'
import { ROUTES } from '@/constants/routes'
import { Search, UserPlus, Clock, Calendar, User, Phone, MapPin, CheckCircle, X } from 'lucide-react'

export function SecretaryWalkInPage() {
  const navigate = useNavigate()
  const create = useCreateWalkIn()

  // Form State - Appointment
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))

  // Form State - Patient Search
  const [searchQuery, setSearchQuery] = useState('')
  const { data: searchResults, isLoading: isSearching } = usePatients(searchQuery)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Form State - New Patient Details
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newGender, setNewGender] = useState<'male' | 'female' | ''>('')
  const [newCity, setNewCity] = useState('')
  const [error, setError] = useState('')

  const handleSelectPatient = (p: any) => {
    setSelectedPatient(p)
    setIsAddingNew(false)
    setSearchQuery('')
  }

  const handleStartNewPatient = () => {
    setSelectedPatient(null)
    setIsAddingNew(true)
    setSearchQuery('')
    // Pre-fill name if searchQuery looks like a name
    if (isNaN(Number(searchQuery))) {
      setNewName(searchQuery)
    } else {
      setNewPhone(searchQuery)
    }
  }

  const resetPatientSelection = () => {
    setSelectedPatient(null)
    setIsAddingNew(false)
  }

  const handleSubmit = () => {
    if (!selectedPatient && !isAddingNew) {
      setError('Veuillez sélectionner ou créer un patient.')
      return
    }

    if (isAddingNew && (!newName.trim() || !newPhone.trim())) {
      setError('Le nom et le téléphone du nouveau patient sont obligatoires.')
      return
    }

    setError('')
    const payload = isAddingNew 
      ? { 
          name: newName, 
          phone: newPhone, 
          email: newEmail || undefined, 
          gender: newGender || undefined, 
          city: newCity || undefined,
          appointment_date: date,
          start_time: time
        }
      : { 
          patient_id: selectedPatient.id,
          appointment_date: date,
          start_time: time
        }

    create.mutate(payload as any, {
      onSuccess: () => navigate(ROUTES.SECRETARY_DASHBOARD),
      onError: (err: any) => {
        setError(err?.response?.data?.message || 'Erreur lors de la création.')
      }
    })
  }

  return (
    <SecretaryLayout title="Nouveau Rendez-vous">
      <div className="max-w-3xl space-y-6">
        
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-[#F9FEFD] border-b px-6 py-4">
            <h3 className="text-lg font-bold text-gray-800">Détails de l'admission</h3>
            <p className="text-xs text-gray-500">Remplissez les informations pour valider le rendez-vous.</p>
          </div>

          <div className="p-6 space-y-8">
            {/* 1. Appointment Info */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#1D9E75] font-bold text-sm uppercase tracking-wider">
                <Clock size={16} />
                <span>1. Horaire du rendez-vous</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 ml-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1D9E75]/10 focus:border-[#1D9E75] transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 ml-1">Heure</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      type="time" 
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1D9E75]/10 focus:border-[#1D9E75] transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Patient Search/Select */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#1D9E75] font-bold text-sm uppercase tracking-wider">
                <User size={16} />
                <span>2. Identification du patient</span>
              </div>

              {!selectedPatient && !isAddingNew ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un patient par nom ou téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 border-2 border-gray-100 rounded-2xl focus:border-[#1D9E75] focus:ring-0 text-base shadow-sm transition-all"
                  />
                  
                  {searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      {isSearching ? (
                        <div className="p-6 text-center text-gray-400">
                          <div className="animate-spin h-6 w-6 border-2 border-[#1D9E75] border-t-transparent rounded-full mx-auto mb-2" />
                          Recherche...
                        </div>
                      ) : (
                        <>
                          {searchResults?.map((p: any) => (
                            <button
                              key={p.id}
                              onClick={() => handleSelectPatient(p)}
                              className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between group border-b last:border-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                  {p.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 group-hover:text-[#1D9E75] transition-colors">{p.name}</div>
                                  <div className="text-xs text-gray-500">{p.phone}</div>
                                </div>
                              </div>
                              <CheckCircle size={20} className="text-transparent group-hover:text-[#1D9E75]" />
                            </button>
                          ))}
                          <button
                            onClick={handleStartNewPatient}
                            className="w-full px-6 py-4 text-left hover:bg-[#F0FAF7] flex items-center gap-3 text-[#1D9E75] font-bold bg-[#F9FEFD]"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#E5F6F0] flex items-center justify-center">
                              <UserPlus size={20} />
                            </div>
                            <div>
                              <div>Nouveau Patient</div>
                              <div className="text-[10px] opacity-70 uppercase tracking-widest">Créer un profil complet</div>
                            </div>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#F0FAF7] border border-[#1D9E75]/20 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-lg font-bold">
                      {(selectedPatient?.name || newName || '?').charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{selectedPatient?.name || newName}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone size={12} /> {selectedPatient?.phone || newPhone}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={resetPatientSelection}
                    className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </section>

            {/* 3. New Patient Form Expansion */}
            {isAddingNew && (
              <section className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-[#1D9E75] font-bold text-sm uppercase tracking-wider">
                  <UserPlus size={16} />
                  <span>3. Nouveau Profil Patient</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1 space-y-1">
                    <label className="text-xs font-medium text-gray-500 ml-1">Nom complet *</label>
                    <input 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full h-11 border rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#1D9E75]/10 focus:border-[#1D9E75] transition-all"
                      placeholder="Nom et Prénom"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1">
                    <label className="text-xs font-medium text-gray-500 ml-1">Téléphone *</label>
                    <input 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full h-11 border rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#1D9E75]/10 focus:border-[#1D9E75] transition-all"
                      placeholder="Numéro de mobile"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 ml-1">Email</label>
                    <input 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full h-11 border rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#1D9E75]/10 focus:border-[#1D9E75] transition-all"
                      placeholder="exemple@mail.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 ml-1">Genre</label>
                    <select 
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                      className="w-full h-11 border rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#1D9E75]/10 focus:border-[#1D9E75] transition-all"
                    >
                      <option value="">Non spécifié</option>
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-500 ml-1">Ville / Adresse</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full h-11 pl-10 border rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#1D9E75]/10 focus:border-[#1D9E75] transition-all"
                        placeholder="Ex: Alger, Centre"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-shake">{error}</div>}

            <div className="pt-6 flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 h-14 border-2 border-gray-100 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={create.isPending}
                className="flex-[2] h-14 bg-[#1D9E75] text-white rounded-2xl font-bold shadow-xl shadow-[#1D9E75]/20 hover:bg-[#168a65] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {create.isPending ? (
                  <div className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Valider le Rendez-vous</>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </SecretaryLayout>
  )
}
