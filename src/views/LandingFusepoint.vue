<template>
  <div class="min-h-screen bg-white text-neutral-900">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200" role="banner">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href="/" class="font-semibold tracking-tight text-neutral-900 flex items-center gap-2" aria-label="Accueil Fusepoint">
          <img src="/fusepoint-logo.svg" alt="Fusepoint" class="h-6 w-auto" />
        </a>
        <nav class="hidden md:flex items-center gap-6 text-sm text-neutral-700">
          <a href="#comment-ca-marche" class="hover:text-neutral-900">Produit</a>
          <a href="#pricing-title" class="hover:text-neutral-900">Tarifs</a>
          <a href="#faq-title" class="hover:text-neutral-900">FAQ</a>
        </nav>
        <div class="flex items-center gap-3">
          <a href="#comment-ca-marche" data-cta="header-comment" @click="trackCta('header-comment')" class="hidden sm:inline-flex items-center rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900">Voir comment on te simplifie la vie</a>
          <button data-cta="header-agent" @click="openAgentDialog" class="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900" aria-haspopup="dialog">Parler à l’Agent</button>
        </div>
      </div>
    </header>

    <main id="contenu" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Decorative gradient background -->
      <div aria-hidden="true" class="pointer-events-none relative -z-10">
        <div class="absolute inset-x-0 -top-8 h-56 bg-gradient-to-r from-neutral-100 via-white to-neutral-100 blur-xl"></div>
      </div>

      <!-- 1 Hero -->
      <section class="py-16 sm:py-20" aria-labelledby="hero-title" data-reveal>
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 id="hero-title" class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">Pilote ton activité comme une grande entreprise — sans devenir marketeur.</h1>
            <p class="mt-4 text-lg text-neutral-700">Fusepoint veille sur ta présence en ligne, t’alerte quand il faut agir et te guide pas à pas avec l’Agent. Même sans budget pub.</p>
            <ul class="mt-6 space-y-2 text-neutral-800">
              <li class="flex items-start gap-2"><svg class="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>3 actions/semaine, claires et pertinentes</span></li>
              <li class="flex items-start gap-2"><svg class="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Bilan mensuel simple, décisions prioritaires</span></li>
              <li class="flex items-start gap-2"><svg class="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Sans jargon, fait pour les PME locales</span></li>
            </ul>
            <div class="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="#comment-ca-marche" data-cta="hero-comment" @click="trackCta('hero-comment')" class="inline-flex items-center rounded-full bg-neutral-900 text-white px-5 py-3 text-sm font-medium hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900">Voir comment on te simplifie la vie</a>
              <button data-cta="hero-agent" @click="openAgentDialog" class="inline-flex items-center rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900" aria-haspopup="dialog">Parler à l’Agent</button>
            </div>
            <p class="mt-3 text-neutral-600">Gratuit pour commencer · Sans engagement · Rapport mensuel clair</p>
          </div>
          <div class="relative">
            <div class="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-neutral-100 blur-md" aria-hidden="true"></div>
            <img src="/fusepoint-bg.svg" alt="Illustration Fusepoint" class="mx-auto max-h-72 w-auto" />
          </div>
        </div>

        <!-- Trust badges -->
        <div class="mt-10 grid sm:grid-cols-3 gap-4 text-sm text-neutral-700">
          <div class="flex items-center gap-2 justify-center"><svg class="h-5 w-5 text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg><span>Fait pour les PME suisses</span></div>
          <div class="flex items-center gap-2 justify-center"><svg class="h-5 w-5 text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12l5 5L21 4"/></svg><span>Sans jargon. Actions concrètes.</span></div>
          <div class="flex items-center gap-2 justify-center"><svg class="h-5 w-5 text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg><span>Note moyenne 4.8/5</span></div>
        </div>
      </section>

      <!-- 8 Offres & tarifs -->
      <section class="py-12 border-t border-neutral-200" aria-labelledby="pricing-title" data-reveal>
        <h2 id="pricing-title" class="text-2xl font-bold">Commence petit, grandis à ton rythme.</h2>
        <div class="mt-6 grid sm:grid-cols-3 gap-6">
          <!-- Découverte -->
          <div class="rounded-2xl shadow-lg p-6 border border-neutral-200 bg-white">
            <div class="flex items-baseline justify-between"><h3 class="font-semibold">Découverte</h3><span class="text-sm text-neutral-700">0 CHF</span></div>
            <p class="mt-2 text-neutral-700">Suivi basique · Score mensuel · Diagnostic</p>
            <ul class="mt-3 space-y-2 text-sm text-neutral-800">
              <li class="flex items-start gap-2"><svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Score Fusepoint mensuel</span></li>
              <li class="flex items-start gap-2"><svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Diagnostic express</span></li>
            </ul>
            <button data-plan="decouverte" @click="trackPlan('decouverte')" class="mt-4 inline-flex items-center rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800">Commencer ce plan</button>
          </div>
          <!-- Essentiel (Recommandé) -->
          <div class="rounded-2xl shadow-lg p-6 border-2 border-neutral-900 bg-white relative">
            <span class="absolute -top-3 left-6 rounded-full bg-neutral-900 text-white px-3 py-1 text-xs">Recommandé</span>
            <div class="flex items-baseline justify-between"><h3 class="font-semibold">Essentiel</h3><span class="text-sm text-neutral-700">90 CHF/mois</span></div>
            <p class="mt-2 text-neutral-700">Alertes · Plan hebdo · Bilan · Modèles</p>
            <ul class="mt-3 space-y-2 text-sm text-neutral-800">
              <li class="flex items-start gap-2"><svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>3 actions/semaine guidées</span></li>
              <li class="flex items-start gap-2"><svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Bilan mensuel priorisé</span></li>
              <li class="flex items-start gap-2"><svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Modèles prêts à l’emploi</span></li>
            </ul>
            <button data-plan="essentiel" @click="trackPlan('essentiel')" class="mt-4 inline-flex items-center rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800">Commencer ce plan</button>
            <p class="mt-2 text-xs text-neutral-600">Sans engagement. Mise en route en 48 h.</p>
          </div>
          <!-- Accompagnement -->
          <div class="rounded-2xl shadow-lg p-6 border border-neutral-200 bg-white">
            <div class="flex items-baseline justify-between"><h3 class="font-semibold">Accompagnement</h3><span class="text-sm text-neutral-700">200 CHF/mois</span></div>
            <p class="mt-2 text-neutral-700">+ Revue avec l’Agent · Aide · Priorisation</p>
            <ul class="mt-3 space-y-2 text-sm text-neutral-800">
              <li class="flex items-start gap-2"><svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Session mensuelle avec l’Agent</span></li>
              <li class="flex items-start gap-2"><svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Priorisation assistée</span></li>
              <li class="flex items-start gap-2"><svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>Support dédié</span></li>
            </ul>
            <button data-plan="accompagnement" @click="trackPlan('accompagnement')" class="mt-4 inline-flex items-center rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800">Commencer ce plan</button>
          </div>
        </div>
      </section>

      <!-- 9 Preuves & FAQ -->
      <section class="py-12 border-t border-neutral-200" aria-labelledby="faq-title" data-reveal>
        <h2 id="faq-title" class="text-2xl font-bold">Preuves & FAQ</h2>
        <div class="mt-4 flex items-center gap-2 text-neutral-800">
          <svg class="h-5 w-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <span class="font-medium">4.8/5</span>
          <span class="text-neutral-600">— d’après nos clients locaux</span>
        </div>
        <div class="mt-6 grid sm:grid-cols-3 gap-6">
          <div class="rounded-2xl border border-neutral-200 p-6 shadow-sm bg-white"><p class="font-medium">Témoignage #1</p><p class="mt-2 text-neutral-700">“Placeholder.”</p></div>
          <div class="rounded-2xl border border-neutral-200 p-6 shadow-sm bg-white"><p class="font-medium">Témoignage #2</p><p class="mt-2 text-neutral-700">“Placeholder.”</p></div>
          <div class="rounded-2xl border border-neutral-200 p-6 shadow-sm bg-white"><p class="font-medium">Témoignage #3</p><p class="mt-2 text-neutral-700">“Placeholder.”</p></div>
        </div>
        <div class="mt-8 divide-y divide-neutral-200 border border-neutral-200 rounded-2xl">
          <details class="p-4" @toggle="trackFaq('no-ads', $event.target.open)"><summary class="cursor-pointer list-none font-medium flex items-center justify-between"><span>Et si je ne fais pas de pub ?</span><svg class="h-5 w-5 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9l6 6 6-6"/></svg></summary><p class="mt-2 text-neutral-700">Parfait, on travaille la base.</p></details>
          <details class="p-4" @toggle="trackFaq('time', $event.target.open)"><summary class="cursor-pointer list-none font-medium flex items-center justify-between"><span>Combien de temps ça me prend ?</span><svg class="h-5 w-5 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9l6 6 6-6"/></svg></summary><p class="mt-2 text-neutral-700">10 min/semaine + 10 min/mois.</p></details>
          <details class="p-4" @toggle="trackFaq('stop-anytime', $event.target.open)"><summary class="cursor-pointer list-none font-medium flex items-center justify-between"><span>Puis-je arrêter quand je veux ?</span><svg class="h-5 w-5 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9l6 6 6-6"/></svg></summary><p class="mt-2 text-neutral-700">Oui.</p></details>
        </div>
      </section>

      <!-- 10 CTA final -->
      <section class="py-14 border-t border-neutral-200" aria-labelledby="cta-title" data-reveal>
        <h2 id="cta-title" class="text-2xl font-bold">Tu veux avancer sans te prendre la tête ?</h2>
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <button data-cta="cta-diagnostic" @click="trackCta('cta-diagnostic')" class="inline-flex items-center rounded-full bg-neutral-900 text-white px-5 py-3 text-sm font-medium hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900">Lancer mon diagnostic gratuit</button>
          <button data-cta="cta-agent" @click="openAgentDialog" class="inline-flex items-center rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900" aria-haspopup="dialog">Parler à l’Agent</button>
        </div>
      </section>

      <!-- SEO JSON-LD injecté au montage via script -->
      
    </main>

    <!-- Dialog Agent -->
    <div v-if="isAgentDialogOpen" class="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="agent-title">
      <div class="absolute inset-0 bg-black/30" @click="closeAgentDialog" aria-hidden="true"></div>
      <div class="relative mx-auto mt-24 w-[92%] sm:w-[560px] rounded-2xl bg-white shadow-xl border border-neutral-200">
        <div class="p-6">
          <h3 id="agent-title" class="text-xl font-semibold">Parler à l’Agent</h3>
          <p class="mt-2 text-neutral-700">Laisse-nous tes coordonnées, on te rappelle vite.</p>
          <form class="mt-4 space-y-3" @submit.prevent="submitAgent()">
            <label class="block">
              <span class="text-sm">Email</span>
              <input type="email" required class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900" />
            </label>
            <label class="block">
              <span class="text-sm">Message</span>
              <textarea rows="3" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"></textarea>
            </label>
            <div class="flex items-center gap-3 pt-2">
              <button type="submit" data-cta="agent-send" @click="trackCta('agent-send')" class="inline-flex items-center rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800">Envoyer</button>
              <button type="button" class="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50" @click="closeAgentDialog">Fermer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const isAgentDialogOpen = ref(false)
function openAgentDialog() { isAgentDialogOpen.value = true }
function closeAgentDialog() { isAgentDialogOpen.value = false }
function submitAgent() {
  if (typeof window !== 'undefined' && typeof window.fpTrack === 'function') {
    window.fpTrack('agent_submit', { source: 'dialog' })
  }
  isAgentDialogOpen.value = false
}

function trackCta(id) { if (typeof window !== 'undefined' && typeof window.fpTrack === 'function') window.fpTrack('cta', { id }) }
function trackPlan(id) { if (typeof window !== 'undefined' && typeof window.fpTrack === 'function') window.fpTrack('plan', { id }) }
function trackFaq(id, opened) { if (typeof window !== 'undefined' && typeof window.fpTrack === 'function') window.fpTrack('faq', { id, opened }) }

// Fade-in on scroll + inject JSON-LD
onMounted(() => {
  const nodes = Array.from(document.querySelectorAll('[data-reveal]'))
  nodes.forEach(n => n.classList.add('opacity-0', 'translate-y-4'))
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal')
        e.target.classList.remove('opacity-0', 'translate-y-4')
        io.unobserve(e.target)
      }
    })
  }, { threshold: 0.15 })
  nodes.forEach(n => io.observe(n))

  // Inject JSON-LD Product
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Fusepoint',
    description: 'Assistant de gestion numérique pour PME. Suivi, alertes, accompagnement humain.',
    brand: { '@type': 'Brand', name: 'Fusepoint' },
    offers: [
      { '@type': 'Offer', priceCurrency: 'CHF', price: '0' },
      { '@type': 'Offer', priceCurrency: 'CHF', price: '90' },
      { '@type': 'Offer', priceCurrency: 'CHF', price: '200' }
    ]
  }
  const productScript = document.createElement('script')
  productScript.type = 'application/ld+json'
  productScript.text = JSON.stringify(productJsonLd)
  document.head.appendChild(productScript)

  // Inject JSON-LD FAQ
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Et si je ne fais pas de pub ?', acceptedAnswer: { '@type': 'Answer', text: 'Parfait, on travaille la base.' } },
      { '@type': 'Question', name: 'Combien de temps ça me prend ?', acceptedAnswer: { '@type': 'Answer', text: '10 min/semaine + 10 min/mois.' } },
      { '@type': 'Question', name: 'Puis-je arrêter quand je veux ?', acceptedAnswer: { '@type': 'Answer', text: 'Oui.' } }
    ]
  }
  const faqScript = document.createElement('script')
  faqScript.type = 'application/ld+json'
  faqScript.text = JSON.stringify(faqJsonLd)
  document.head.appendChild(faqScript)
})
</script>

<style>
.reveal { opacity: 1 !important; transform: none !important; transition: opacity .6s ease, transform .6s ease; }
</style>