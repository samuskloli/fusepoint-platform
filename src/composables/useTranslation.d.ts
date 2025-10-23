import { Ref } from 'vue'

export interface TranslationFunction {
  (key: string, params?: Record<string, any>): string
}

export interface UseTranslationReturn {
  t: TranslationFunction
  locale: Ref<string>
  setLocale: (locale: string) => void
  availableLocales: string[]
}

export declare function useTranslation(): UseTranslationReturn