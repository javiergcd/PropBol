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