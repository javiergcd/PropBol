'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'

import MarkerClusterGroup from 'react-leaflet-cluster'

// 🔥 FIX iconos leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

// 🏠 Icono de casas
const houseIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/69/69524.png',
  iconSize: [25, 25],
})

// 📍 Icono usuario
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
  iconSize: [30, 30],
})

// 🏠 Icono de casa al seleccionar
const selectedIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
})


// 🎯 Componente para centrar mapa
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap()
  map.setView(center, 20)
  return null
}
export default function MapView({ properties, selectedProperty, onSelect }) {
  const center: [number, number] = [-17.39, -66.15]

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  // 📍 Obtener ubicación del usuario
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => {
        console.error('Error ubicación:', err)
      }
    )
  }, [])

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🏠 Propiedades */}
      <MarkerClusterGroup>
        {properties
          .filter(p => p.lat && p.lng)
          .map((p) => (
            <Marker
              key={p.id} // ✅ IMPORTANTE
              position={[p.lat, p.lng]}
              icon={selectedProperty?.id === p.id ? selectedIcon : houseIcon}
              eventHandlers={{
                click: () => onSelect(p) // 👈 IMPORTANTE
              }}
            >
              <Popup>
                <strong>{p.titulo}</strong><br />
                    {p.ubicacion}<br />
                🏠 {p.tipo}<br />
                💲 {p.precio}
              </Popup>
            </Marker>
          ))}
      </MarkerClusterGroup>

      {/* 📍 Usuario */}
      {userLocation && (
        <>
          <Marker position={userLocation} icon={userIcon}>
            <Popup>📍 Tu ubicación</Popup>
          </Marker>

          <ChangeView center={userLocation} />
        </>
      )}

      {/* 🎯 Selección */}
      {selectedProperty && (
        <ChangeView center={[selectedProperty.lat, selectedProperty.lng]} />
      )}
    </MapContainer>
  )
}