import Image from 'next/image'

interface BannerProps {
  url: string
  title?: string
  subtitle?: string
}

export const HomeBanner = ({ url, title, subtitle }: BannerProps) => {
  return (
    /* Contenedor con flex-col y centrado para el texto */
    <div className="relative w-full h-[60vh] min-h-[300px] bg-slate-100 flex flex-col items-center justify-center overflow-hidden">
      
      <Image 
        src={url} 
        alt="Portada principal" 
        fill 
        className="object-cover object-right" 
        priority 
      />


      {/* CONTENIDO: Centrado horizontalmente (items-center) y con texto centrado (text-center) */}
      <div className="relative z-10 text-center px-4 py-4 flex flex-col gap-4 md:gap-6 items-center w-full">
        {title && (
          /* drop-shadow-xl ayuda a que el texto blanco se lea si la imagen es clara */
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] max-w-[90%] md:max-w-none text-balance mx-auto">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-sm md:text-xl lg:text-2xl text-stone-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-medium max-w-[85%] md:max-w-2xl text-balance mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="md:hidden relative z-20 -mt-10 px-4 w-full flex justify-center">
      </div>
    </div>
  )
}