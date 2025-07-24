"use client"
import { useMediaQuery } from "@uidotdev/usehooks"

export function useMobile() {
  const isMobile = useMediaQuery("only screen and (max-width : 768px)")
  return isMobile
}

// This file is intentionally left empty as it is replaced by hooks/use-mobile.tsx.
// It is included here to ensure all files are explicitly present.
