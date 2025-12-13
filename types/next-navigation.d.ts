declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void
    replace(href: string): void
    back(): void
    forward(): void
    refresh(): void
    prefetch(href: string): void
  }
  
  export function usePathname(): string
  export function useSearchParams(): URLSearchParams
}

declare module 'next' {
  export interface Metadata {
    title?: string | { default?: string; template?: string }
    description?: string
    generator?: string
    manifest?: string
    icons?: {
      icon?: Array<{
        url: string
        media?: string
        type?: string
      }>
      apple?: string
    }
    [key: string]: any
  }

  export interface Viewport {
    themeColor?: string
    width?: string
    initialScale?: number
    maximumScale?: number
    userScalable?: boolean
    [key: string]: any
  }
}

declare module 'next/font/google' {
  export interface FontOptions {
    subsets?: string[]
    weight?: string[] | string
    style?: string[]
    display?: string
    variable?: string
    fallback?: string[]
    adjustFontFallback?: boolean
    preload?: boolean
  }

  export function Inter(options?: FontOptions): {
    className: string
    style: { fontFamily: string }
  }
  
  export function Roboto(options?: FontOptions): {
    className: string
    style: { fontFamily: string }
  }
  
  export function Open_Sans(options?: FontOptions): {
    className: string
    style: { fontFamily: string }
  }
}

