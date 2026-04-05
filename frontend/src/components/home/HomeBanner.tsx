'use client'

import Image from 'next/image'
import { useState } from 'react'

interface BannerProps {
  url: string
  title?: string
  subtitle?: string
}

const FALLBACK_BANNER = '/portada.webp'

export const HomeBanner = ({ url, title, subtitle }: BannerProps) => {
  const [hasError, setHasError] = useState(false)
  const imageUrl = !url || hasError ? FALLBACK_BANNER : url

  return (
    // SE ENCOGIÓ EL BANNER AQUÍ: h-[40vh] min-h-[250px] max-h-[450px]
    <div className="relative w-full h-[40vh] min-h-[250px] max-h-[450px] bg-slate-100 flex items-center justify-center overflow-hidden">
      <Image
        src={imageUrl}
        alt="Portada principal"
        fill
        className="object-cover object-center"
        priority
        onError={() => setHasError(true)}
        unoptimized
      />

      <div className="absolute inset-0 bg-black/45 z-0" />

      {/* Contenido centrado con anchos máximos */}
      <div className="relative z-10 text-center px-4 py-4 flex flex-col gap-2 md:gap-6 items-center">
        {title && (
          <h1 className="text-xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-xl max-w-[280px] md:max-w-none text-balance">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-xs md:text-xl lg:text-2xl text-stone-200 drop-shadow-lg font-medium max-w-[240px] md:max-w-2xl text-balance">
            {subtitle}
          </p>
        )}
      </div>
      {/* ¡OJO! Borré todo lo que había aquí adentro para limpiar el desastre */}
      <div className="md:hidden relative z-20 -mt-10 px-4 w-full"></div>
    </div>
  )
}
