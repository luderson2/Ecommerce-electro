'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImageProps {
  src: string
  alt: string
  priority?: boolean
  className?: string
  sizes?: string
}

export default function ProductImage({
  src,
  alt,
  priority = false,
  className = 'object-contain p-8',
  sizes = '(max-width: 1024px) 100vw, 50vw',
}: ProductImageProps) {
  const [erreur, setErreur] = useState(false)

  return (
    <Image
      src={erreur ? '/placeholder.svg' : src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setErreur(true)}
      unoptimized={!erreur && src.includes('placehold.co')}
    />
  )
}
