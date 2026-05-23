import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon issue with Leaflet in Vite/React by using direct CDN links
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface LocationPickerProps {
  latitude?: number | null
  longitude?: number | null
  onChange: (lat: number, lng: number) => void
  disabled?: boolean
  height?: string
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  disabled = false,
  height = '300px'
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Default coordinate: Algiers center
  const defaultLat = 36.7538
  const defaultLng = 3.0588

  const initialLat = latitude || defaultLat
  const initialLng = longitude || defaultLng

  // Handle map initialisation
  useEffect(() => {
    if (!mapContainerRef.current) return

    // If map already exists, just return
    if (mapRef.current) return

    // Initialise Leaflet Map
    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13)
    mapRef.current = map

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Add marker
    const marker = L.marker([initialLat, initialLng], {
      icon: defaultIcon,
      draggable: !disabled
    }).addTo(map)
    markerRef.current = marker

    // Handle marker drag end
    marker.on('dragend', () => {
      const position = marker.getLatLng()
      onChange(position.lat, position.lng)
    })

    // Handle map click
    if (!disabled) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        onChange(lat, lng)
      })
    }

    return () => {
      // Clean up map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [disabled, onChange])

  // Update marker position if coordinates change externally (e.g. resetting form or loading saved settings)
  useEffect(() => {
    if (mapRef.current && markerRef.current && latitude && longitude) {
      const currentPos = markerRef.current.getLatLng()
      if (currentPos.lat !== latitude || currentPos.lng !== longitude) {
        markerRef.current.setLatLng([latitude, longitude])
        mapRef.current.setView([latitude, longitude], mapRef.current.getZoom())
      }
    }
  }, [latitude, longitude])

  return (
    <div className="space-y-2">
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner z-0 overflow-hidden"
      />
      {!disabled && (
        <p className="text-xs text-gray-500 dark:text-slate-500 text-center font-medium">
          Faites glisser le marqueur ou cliquez sur la carte pour choisir la position exacte
        </p>
      )}
    </div>
  )
}
