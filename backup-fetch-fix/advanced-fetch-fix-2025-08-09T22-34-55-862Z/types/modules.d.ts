// Déclarations de types pour les modules Vue
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Déclarations de types pour les plugins JavaScript
declare module './plugins/currency.js' {
  const plugin: any
  export default plugin
}

declare module './plugins/i18n.js' {
  const plugin: any
  export default plugin
}

// Déclaration de type pour le router
declare module './router/index.js' {
  import type { Router } from 'vue-router'
  const router: Router
  export default router
}