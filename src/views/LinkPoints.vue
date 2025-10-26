<template>
  <Layout>
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-semibold">LinkPoints</h1>
          <p class="text-gray-600">Gérez les liens, QR codes et statistiques.</p>
        </div>
        <button @click="openCreate" class="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 shadow-sm">Créer un LinkPoint</button>
      </div>

      <!-- Récapitulatif global (30 jours) -->
      <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200" v-if="global">
        <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-6">
            <div>
              <div class="text-sm text-gray-500">Total scans (30j)</div>
              <div class="text-xl font-semibold">{{ Math.round(global.totals.scans) }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Total clics (30j)</div>
              <div class="text-xl font-semibold">{{ Math.round(global.totals.clicks) }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">CTR (30j)</div>
              <span :class="ctrBadgeClass(global.ctr)" class="px-2 py-1 rounded text-sm font-medium">{{ formatPercent(global.ctr) }}</span>
            </div>
            <div>
              <div class="text-sm text-gray-500">Moy. journalière</div>
              <div class="text-sm">Scans {{ global.avgPerDay.scans.toFixed(1) }} · Clics {{ global.avgPerDay.clicks.toFixed(1) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="exportGlobalCSV" class="px-3 py-2 border rounded text-sm">Export CSV</button>
            <div class="text-sm text-gray-500">Dernier scan: {{ global.lastScanDate || '—' }}</div>
          </div>
        </div>
        <div class="p-4">
          <canvas ref="globalChartEl" height="100"></canvas>
        </div>
        <!-- Geo stats global -->
        <div class="p-4 border-t" v-if="geo && geo.byRegion && geo.byRegion.length">
          <h3 class="font-medium mb-2">Scans par pays/région (30j)</h3>
          <div class="overflow-y-auto max-h-80 min-w-0">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-left border-b">
                  <th class="py-2 pr-4">Pays</th>
                  <th class="py-2 pr-4">Région</th>
                  <th class="py-2">Scans</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(g, idx) in geo.byRegion" :key="idx" class="border-b">
                  <td class="py-2 pr-4">{{ g.country_code || '—' }}</td>
                  <td class="py-2 pr-4">{{ g.region || '—' }}</td>
                  <td class="py-2 font-medium">{{ g.scans }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Liste -->
        <div class="lg:col-span-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4 border-b">
              <input v-model="search" type="text" placeholder="Rechercher…" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <ul>
              <li v-for="item in filtered" :key="item.id" class="border-t">
                <button @click="select(item)" class="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-md flex items-center gap-3">
                  <img v-if="item.logo_url" :src="item.logo_url" class="h-8 w-8 rounded object-cover" />
                  <div class="min-w-0">
                    <div class="font-medium">{{ item.name }}</div>
                    <div class="text-sm text-gray-500">/{{ item.slug }} <a :href="publicUrl(item.slug)" target="_blank" rel="noopener" class="ml-2 text-primary-600 hover:underline">Voir</a></div>
                  </div>
                </button>
              </li>
            </ul>
          </div>
          <!-- Archivés -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div class="p-4 flex justify-between items-center">
              <h3 class="font-medium">Archivés</h3>
              <button @click="loadArchived" class="px-3 py-2 rounded text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">Rafraîchir</button>
            </div>
            <ul>
              <li v-for="item in filteredArchived" :key="item.id" class="border-t">
                <div class="px-4 py-3 flex items-center justify-between">
                  <button @click="select(item)" class="text-left hover:underline flex items-center gap-3">
                    <img v-if="item.logo_url" :src="item.logo_url" class="h-8 w-8 rounded object-cover" />
                    <div class="min-w-0">
                      <div class="font-medium">{{ item.name }}</div>
                      <div class="text-sm text-gray-500">/{{ item.slug }} <a :href="publicUrl(item.slug)" target="_blank" rel="noopener" class="ml-2 text-primary-600 hover:underline">Voir</a></div>
                    </div>
                  </button>
                  <div class="flex items-center gap-2">
                    <button @click="restore(item)" class="px-3 py-2 text-sm rounded border border-green-300 text-green-700 hover:bg-green-50">Restaurer</button>
                    <button @click="deleteArchived(item)" class="px-3 py-2 text-sm rounded border border-red-300 text-red-700 hover:bg-red-50">Supprimer définitivement</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Détails -->
        <div class="lg:col-span-8">
          <div v-if="selected" class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="p-4">
              <div class="flex items-center gap-3 mb-3">
                <img v-if="selected.logo_url" :src="selected.logo_url" class="h-12 w-12 rounded object-cover" />
                <div class="min-w-0">
                  <div class="font-semibold">{{ selected.name }}</div>
                  <div class="text-sm text-gray-500 truncate">/{{ selected.slug }}</div>
                </div>
              </div>
              <div class="flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap flex-nowrap py-2">
                <div class="flex items-center gap-2">
                  <button @click="openEdit" class="inline-flex items-center px-3 py-2 text-sm rounded bg-primary-600 text-white hover:bg-primary-700 shadow-sm">Modifier</button>
                  <button @click="openDuplicate" class="inline-flex items-center px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Dupliquer</button>
                  <button @click="archiveSelected" class="inline-flex items-center px-3 py-2 text-sm rounded border border-red-300 text-red-700 hover:bg-red-50">Archiver</button>
                </div>
                <div class="flex items-center gap-2">
                  <a :href="publicUrl(selected.slug)" target="_blank" rel="noopener" class="inline-flex items-center px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Voir public</a>
                  <button @click="resetSelected" class="inline-flex items-center px-3 py-2 text-sm rounded border border-red-300 text-red-700 hover:bg-red-50">Réinitialiser stats</button>
                  
                </div>
              </div>
            </div>
            <div class="px-4 border-t">
              <div class="flex items-center gap-2 py-2">
                <button @click="setTab('overview')" :class="tabBtnClass('overview')" class="px-3 py-2 rounded border text-sm">Aperçu</button>
                <button @click="setTab('stats')" :class="tabBtnClass('stats')" class="px-3 py-2 rounded border text-sm">Statistiques</button>
              </div>
            </div>
            <div v-if="activeDetailTab==='overview'" class="grid grid-cols-1 md:grid-cols-12 gap-8 mt-3">
                   <div class="md:col-span-7 border rounded p-4 bg-white">
                     <div class="flex items-center justify-between mb-2">
                       <h3 class="font-medium">Prévisualisation</h3>
                       <div class="flex items-center gap-2">
                         <button @click="copyPublicUrl" class="inline-flex items-center px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Copier le lien</button>
                         <button @click="downloadQr" class="inline-flex items-center px-3 py-2 text-sm rounded bg-primary-600 text-white hover:bg-primary-700 shadow-sm">Télécharger</button>
                       </div>
                     </div>
                     <div class="flex items-center justify-center bg-gray-50 rounded p-4">
                       <img v-if="selected && qrPreviewSrc" :src="qrPreviewSrc" :alt="`QR ${selected.slug}`" class="block border rounded shadow-sm max-w-full h-auto" :style="{ maxWidth: '100%', width: `${Math.min(qr.size||180, 360)}px` }" />
                       <div v-else class="text-sm text-gray-500">Prévisualisation non disponible.</div>
                     </div>
                     <p class="mt-2 text-xs text-gray-500">Le QR se met à jour automatiquement.</p>
                   </div>
                   <div class="md:col-span-5 border rounded p-4 bg-white min-w-0">
                     <h3 class="font-medium mb-2">Options</h3>
                     <div class="space-y-4">
                       <div>
                         <div class="text-sm text-gray-600 mb-1">Dimensions & format</div>
                         <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           <div>
                             <label class="text-xs text-gray-500">Format</label>
                             <select v-model="qr.format" class="w-full px-3 py-2 border rounded">
                               <option value="png">PNG</option>
                               <option value="svg">SVG</option>
                               <option value="pdf">PDF</option>
                             </select>
                           </div>
                           <div class="sm:col-span-2">
                             <label class="text-xs text-gray-500">Taille (px)</label>
                             <div class="flex items-center gap-2">
                               <input type="range" min="120" max="1024" v-model.number="qr.size" class="flex-1 max-w-full" />
                               <input type="number" min="120" max="1024" v-model.number="qr.size" class="w-24 px-3 py-2 border rounded" />
                             </div>
                           </div>
                         </div>
                       </div>
                       <div>
                         <div class="text-sm text-gray-600 mb-1">Qualité & marge</div>
                         <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           <div>
                             <label class="text-xs text-gray-500">Correction d'erreur</label>
                             <select v-model="qr.ecc" class="w-full px-3 py-2 border rounded">
                               <option value="L">L</option>
                               <option value="M">M</option>
                               <option value="Q">Q</option>
                               <option value="H">H</option>
                             </select>
                           </div>
                           <div>
                             <label class="text-xs text-gray-500">Marge</label>
                             <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                               <input type="range" min="0" max="10" v-model.number="qr.margin" class="w-full sm:flex-1" />
                               <input type="number" min="0" max="10" v-model.number="qr.margin" class="w-full sm:w-20 px-3 py-2 border rounded" />
                             </div>
                           </div>
                         </div>
                       </div>
                       <div>
                         <div class="text-sm text-gray-600 mb-1">Couleurs</div>
                         <div class="grid grid-cols-2 gap-3">
                           <div>
                             <label class="text-xs text-gray-500">Couleur sombre</label>
                             <input type="color" v-model="qr.dark" class="w-full h-10 border rounded" />
                           </div>
                           <div>
                             <label class="text-xs text-gray-500">Couleur claire</label>
                             <input type="color" v-model="qr.light" class="w-full h-10 border rounded" />
                           </div>
                         </div>
                       </div>
                       <div class="flex items-center justify-end pt-2 border-t mt-2">
                         <button @click="resetQrOptions" class="inline-flex items-center px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Réinitialiser défauts</button>
                       </div>
                     </div>
                   </div>
                 </div>
                 <!-- Fin de la grille Aperçu/Options -->

               <div v-if="activeDetailTab==='overview'" class="mt-6">
                 <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                   <div class="p-4 flex items-center justify-between">
                     <h3 class="font-medium">Période & Statistiques</h3>
                     <div class="flex items-center gap-2">
                       <button @click="setPeriod(7)" :class="periodBtnClass(7)" class="px-2 py-1 rounded border text-sm">7 jours</button>
                       <button @click="setPeriod(30)" :class="periodBtnClass(30)" class="px-2 py-1 rounded border text-sm">30 jours</button>
                     </div>
                   </div>
                   <div class="p-4">
                     <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                       <div>
-                        <div class="text-xs text-gray-500">Visites (scans)</div>
+                        <div class="text-xs text-gray-500">Total scans</div>
                         <div class="text-lg font-semibold">{{ Math.round(detailTotalsActive.scans) }}</div>
                       </div>
                       <div>
-                        <div class="text-xs text-gray-500">Clics</div>
+                        <div class="text-xs text-gray-500">Total clics</div>
                         <div class="text-lg font-semibold">{{ Math.round(detailTotalsActive.clicks) }}</div>
                       </div>
                       <div>
                         <div class="text-xs text-gray-500">CTR</div>
                         <span :class="ctrBadgeClass(detailCTRActive)" class="px-2 py-1 rounded text-sm font-medium">{{ formatPercent(detailCTRActive) }}</span>
                       </div>
                     </div>
+                    <div class="mt-2 text-xs text-gray-600">
+                      <span class="font-medium">Aide:</span> Un “scan” = visite de la page du LinkPoint. Un “clic” = clic sur un des liens affichés.
+                      <span v-if="selected && selected.type==='external'" class="ml-1">Ce LinkPoint redirige automatiquement ; seuls les scans sont pertinents.</span>
+                    </div>
                     <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <div class="text-xs text-gray-500 mb-1">Scans ({{ activePeriod }} jours)</div>
                         <div class="relative">
                           <svg :width="sparklineWidth" :height="sparklineHeight" viewBox="0 0 200 60" preserveAspectRatio="none" class="w-full h-16">
                             <polyline :points="sparklineScansPoints" fill="none" stroke="#3B82F6" stroke-width="2" />
                           </svg>
                         </div>
                       </div>
                       <div>
                         <div class="text-xs text-gray-500 mb-1">Clics ({{ activePeriod }} jours)</div>
                         <div class="relative">
                           <svg :width="sparklineWidth" :height="sparklineHeight" viewBox="0 0 200 60" preserveAspectRatio="none" class="w-full h-16">
                             <polyline :points="sparklineClicksPoints" fill="none" stroke="#10B981" stroke-width="2" />
                           </svg>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            <!-- Liens -->
            <div class="p-4">
-              <div v-if="detailTotalsActive.clicks === 0" class="text-sm text-gray-600 mb-2">
-                Aucun clic enregistré sur la période sélectionnée. Ouvrez la page publique et cliquez sur un lien pour générer des clics.
-              </div>
               <div class="grid grid-cols-1 gap-4">
                 <div v-for="l in links" :key="l.id" class="border rounded p-3">
                   <div class="flex justify-between items-center">
                     <div>
                       <div class="font-medium">{{ l.label }}</div>
                       <div class="text-sm text-gray-500 break-words">{{ l.url }}</div>
                     </div>
                     <div class="text-right">
                       <div class="text-xs text-gray-500">Clics</div>
                       <div class="font-semibold">{{ linkClicksMap.get(l.id) || 0 }}</div>
                       <a :href="l.url" target="_blank" rel="noopener" class="block mt-1 text-primary-600 hover:underline">Ouvrir</a>
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            <!-- Modal Create / Edit -->
            <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <div class="p-4 border-b flex justify-between items-center">
                  <h2 class="text-lg font-semibold">{{ formMode === 'create' ? 'Créer' : 'Modifier' }} un LinkPoint</h2>
                  <button @click="closeForm" class="text-gray-500">✕</button>
                </div>
                <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-gray-600">Nom</label>
                    <input v-model="form.name" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Type</label>
                    <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="external">Lien externe</option>
                      <option value="generated">Mini-page</option>
                      <option value="links">Liste de liens</option>
                      <option value="vcard">vCard</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Logo URL</label>
                    <input v-model="form.logo_url" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Uploader un logo</label>
                    <input type="file" accept="image/*" @change="onLogoFileChange" class="w-full" />
                    <div v-if="form.logo_url" class="text-xs text-gray-500 mt-1">Aperçu: {{ form.logo_url }}</div>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Style (préréglage)</label>
                    <select v-model="form.theme.preset" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="classic">Classique</option>
                      <option value="minimal">Minimal</option>
                      <option value="bold">Audacieux</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">Style du logo</label>
                    <select v-model="form.theme.logo_style" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="circle">Cercle</option>
                      <option value="rounded">Arrondi</option>
                      <option value="square">Carré</option>
                    </select>
                  </div>
                  <div v-if="form.type === 'external'">
                    <label class="text-sm text-gray-600">URL externe</label>
                    <input v-model="form.external_url" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                </div>
                <div v-if="form.type === 'generated'" class="px-4">
                  <label class="text-sm text-gray-600">Slogan (texte d'accroche)</label>
                  <input v-model="form.theme.slogan" placeholder="Suivez, notez, contactez — en un scan." class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                
                <!-- Section vCard -->
                <div v-if="form.type === 'generated' || form.type === 'vcard'" class="px-4 border-t pt-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-700">Carte de contact (vCard)</h3>
                    <!-- Toggle seulement pour Mini-page -->
                    <label v-if="form.type === 'generated'" class="flex items-center">
                      <input type="checkbox" v-model="form.theme.vcard_enabled" class="mr-2" />
                      <span class="text-xs text-gray-600">Activer</span>
                    </label>
                    <span v-else class="text-xs text-gray-600">Remplissez les champs pour ce LinkPoint vCard</span>
                  </div>
                  <div v-if="form.type === 'vcard' || form.theme.vcard_enabled" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs text-gray-600">Prénom</label>
                      <input v-model="form.theme.vcard.first_name" placeholder="Jean" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Nom de famille</label>
                      <input v-model="form.theme.vcard.last_name" placeholder="Dupont" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Entreprise</label>
                      <input v-model="form.theme.vcard.organization" placeholder="Mon Entreprise" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Poste</label>
                      <input v-model="form.theme.vcard.title" placeholder="Directeur" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Téléphone</label>
                      <input v-model="form.theme.vcard.phone" placeholder="+33 1 23 45 67 89" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Email</label>
                      <input v-model="form.theme.vcard.email" type="email" placeholder="jean.dupont@exemple.com" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div class="md:col-span-2">
                      <label class="text-xs text-gray-600">Site web</label>
                      <input v-model="form.theme.vcard.website" placeholder="https://monsite.com" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div class="md:col-span-2">
                      <label class="text-xs text-gray-600">Adresse</label>
                      <textarea v-model="form.theme.vcard.address" placeholder="123 Rue de la Paix, 75001 Paris, France" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                  </div>
                </div>
                
                <div v-if="form.type === 'links' || form.type === 'generated'" class="px-4">
                  <div class="text-sm font-medium mb-2">Liens</div>
                  <div v-for="(l, idx) in form.links" :key="idx" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input v-model="l.label" placeholder="Label" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    <input v-model="l.url" placeholder="URL" class="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <div class="flex gap-2 mb-4">
                    <button @click="addFormLink" class="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Ajouter un lien</button>
                    <button v-if="form.links.length" @click="removeLastFormLink" class="px-3 py-2 rounded border border-red-300 text-red-700 hover:bg-red-50">Supprimer le dernier</button>
                  </div>
                </div>
                <div class="p-4 border-t flex justify-end gap-2">
                  <button @click="closeForm" class="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Annuler</button>
                  <button @click="submitForm" class="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 shadow-sm">{{ formMode === 'create' ? 'Créer' : 'Enregistrer' }}</button>
                </div>
              </div>
            </div>

            <!-- Modal Duplicate -->
            <div v-if="showDuplicate" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[70vh] overflow-y-auto">
                <div class="p-4 border-b flex justify-between items-center">
                  <h2 class="text-lg font-semibold">Dupliquer le LinkPoint</h2>
                  <button @click="closeDuplicate" class="text-gray-500">✕</button>
                </div>
                <div class="p-4">
                  <p class="text-sm text-gray-600">Êtes-vous sûr de vouloir dupliquer ce LinkPoint ? Un nouveau slug sera généré automatiquement.</p>
                </div>
                <div class="p-4 border-t flex justify-end gap-2">
                  <button @click="closeDuplicate" class="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Annuler</button>
                  <button @click="confirmDuplicate" class="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 shadow-sm">Dupliquer</button>
                </div>
              </div>
            </div>


          <!-- Pas de sélection -->
          <div v-if="!selected" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">Sélectionnez un LinkPoint pour voir ses détails.</div>

          <!-- Statistiques (onglet) -->
          <div v-if="activeDetailTab==='stats'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4 h-[70vh] overflow-y-auto min-h-0">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium">Statistiques détaillées</h3>
              <div class="flex items-center gap-2">
                <button @click="setPeriod(7)" :class="periodBtnClass(7)" class="px-2 py-1 rounded border text-sm">7 jours</button>
                <button @click="setPeriod(30)" :class="periodBtnClass(30)" class="px-2 py-1 rounded border text-sm">30 jours</button>
              </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-min min-h-0">
              <div class="relative min-w-0">
                <h4 class="text-sm text-gray-600 mb-2">Scans et clics par jour</h4>
                <canvas ref="detailChartEl" class="w-full h-64" height="256"></canvas>
              </div>
              <div class="relative min-w-0">
                <h4 class="text-sm text-gray-600 mb-2">CTR par jour</h4>
                <canvas ref="ctrChartEl" class="w-full h-64" height="256"></canvas>
              </div>
            </div>
            <div class="mt-4 text-sm text-gray-600">
              Dernier scan: {{ detailLastScanDate || '—' }} • CTR moyen: {{ formatPercent(detailCTRActive) }}
            </div>
          </div>
        </div>




      </div>
    </div>

</Layout>
</template>

<script>
import Layout from '../components/Layout.vue'
import linkpointsAPI from '../services/linkpointsAPI'
import Chart from 'chart.js/auto'
import api from '@/services/api'

export default {
  name: 'LinkPoints',
  components: { Layout },
  data() {
    return {
      loading: false,
      items: [],
      archivedItems: [],
      search: '',
      selected: null,
      links: [],
      stats: null,
      top: [],
      // déclarer pour réactivité
      devices: { d7: [], d30: [] },
      sources: { d7: [], d30: [] },
      showForm: false,
      formMode: 'create',
      form: { name: '', type: 'external', logo_url: '', external_url: '', links: [], theme: { preset: 'classic', slogan: 'Suivez, notez, contactez — en un scan.', logo_style: 'circle', vcard_enabled: false, vcard: { first_name: '', last_name: '', organization: '', title: '', phone: '', email: '', website: '', address: '' } } },
      showDuplicate: false,
      // Période & charts
      activePeriod: 7,
      chartDetail: null,
      chartCTR: null,
      chartGlobal: null,
      // QR options
      qr: { format: 'png', size: 180, margin: 1, ecc: 'M', dark: '#000000', light: '#FFFFFF' },
      qrBust: 0,
      activeDetailTab: 'overview',
      // Global stats
      global: null,
      // Geo stats
      geo: null,
      // QR preview (blob URL avec auth)
      qrPreviewSrc: '',
      // Stats par lien
      statsByLink: null,
      // Geo du LinkPoint sélectionné
      selectedGeo: { d7: [], d30: [] },

    }
  },
  computed: {
    filtered() {
      const q = this.search.toLowerCase()
      return this.items.filter(i =>
        i.name.toLowerCase().includes(q)
      )
    },
    filteredArchived() {
      const q = this.search.toLowerCase()
      return this.archivedItems.filter(i =>
        i.name.toLowerCase().includes(q)
      )
    },

    devicesActive() { return this.activePeriod === 7 ? (this.devices?.d7 || []) : (this.devices?.d30 || []) },
    sourcesActive() { return this.activePeriod === 7 ? (this.sources?.d7 || []) : (this.sources?.d30 || []) },
    selectedGeoActive() { return this.activePeriod === 7 ? (this.selectedGeo?.d7 || []) : (this.selectedGeo?.d30 || []) },
    // Ajout: CTR basé sur statsByLink et map des clics par lien
    statsByLinkCTR() {
      const scans = Number(this.statsByLink?.total_scans || 0)
      const clicks = Number(this.statsByLink?.total_clicks || 0)
      return scans > 0 ? (clicks * 100.0) / scans : 0
    },
    linkClicksMap() {
      const map = new Map()
      const arr = this.statsByLink?.links || []
      for (const l of arr) { map.set(l.link_id, Number(l.clicks || 0)) }
      return map
    },
    // Ajout: stats détaillées actives selon la période
    detailStatsActive() {
      return this.activePeriod === 7 ? (this.stats?.d7 || []) : (this.stats?.d30 || [])
    },
    // Totaux pour la carte Statistiques
    detailTotalsActive() {
      const arr = this.detailStatsActive || [];
      let scans = 0, clicks = 0;
      for (const d of arr) { scans += Number(d.scans || 0); clicks += Number(d.clicks || 0); }
      return { scans, clicks };
    },
    detailCTRActive() {
      const t = this.detailTotalsActive;
      return t.scans > 0 ? (t.clicks * 100) / t.scans : 0;
    },
    detailLastScanDate() {
      const arr = this.detailStatsActive || [];
      for (let i = arr.length - 1; i >= 0; i--) {
        const d = arr[i];
        if ((d.scans || 0) > 0) return d.date || d.day || d.label || '';
      }
      return '';
    },
    // Dimensions des sparklines
    sparklineWidth() { return 300 },
    sparklineHeight() { return 64 },
    // Points pour les sparklines (scans / clics)
    sparklineScansPoints() {
      const values = (this.detailStatsActive || []).map(d => Number(d.scans || 0))
      return this.makeSparklinePoints(values)
    },
    sparklineClicksPoints() {
      const values = (this.detailStatsActive || []).map(d => Number(d.clicks || 0))
      return this.makeSparklinePoints(values)
    }
  },
  methods: {
    async load() {
      this.loading = true
      try {
        await this.loadItems()
        // Auto-sélectionner le premier LinkPoint pour afficher les détails visuels
        if (!this.selected && Array.isArray(this.items) && this.items.length > 0) {
          this.select(this.items[0])
        }
        await this.loadGlobalStats()
      } finally {
        this.loading = false
      }
    },
    async loadItems() {
      try {
        this.items = await linkpointsAPI.list()
      } catch (e) {
        console.error('Erreur chargement LinkPoints:', e)
        this.items = []
      }
    },
    async loadArchived() {
      try {
        this.archivedItems = await linkpointsAPI.listArchived()
      } catch (e) {
        console.error('Erreur chargement archivés:', e)
        this.archivedItems = []
      }
    },

    publicUrl(slug) {
      return linkpointsAPI.publicUrl(slug)
    },
    qrUrl(id) { return linkpointsAPI.qrUrl(id) },
    async copyPublicUrl() {
      try {
        const slug = this.selected?.slug
        if (!slug) return
        const url = this.publicUrl(slug)
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url)
        } else {
          const ta = document.createElement('textarea')
          ta.value = url
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        alert('Lien public copié dans le presse‑papier.')
      } catch (e) {
        console.error('Erreur copie lien:', e)
        alert('Impossible de copier le lien public.')
      }
    },
    resetQrOptions() {
      this.qr = { format: 'png', size: 180, margin: 1, ecc: 'M', dark: '#000000', light: '#FFFFFF' }
      this.refreshQrPreview()
    },
    periodBtnClass(p) {
      return this.activePeriod === p ? 'bg-gray-100 border-gray-400 text-gray-800' : 'bg-white border-gray-300 text-gray-700';
    },
    tabBtnClass(tab) {
      return this.activeDetailTab === tab ? 'bg-gray-100 border-gray-400 text-gray-800' : 'bg-white border-gray-300 text-gray-700';
    },
    setTab(tab) { this.activeDetailTab = tab },
    setPeriod(p) { this.activePeriod = p },
    qrQueryParams(forcePngPreview = false) {
      const params = new URLSearchParams();
      params.set('format', forcePngPreview ? 'png' : (this.qr.format || 'png'));
      if (this.qr.size) params.set('size', String(this.qr.size));
      if (this.qr.margin !== undefined) params.set('margin', String(this.qr.margin));
      if (this.qr.ecc) params.set('ecc', this.qr.ecc);
      if (this.qr.dark) params.set('dark', this.qr.dark);
      if (this.qr.light) params.set('light', this.qr.light);
      params.set('_', String(this.qrBust));
      return params.toString();
    },
    qrDownloadHref(id) {
      const base = this.qrUrl(id);
      return `${base}?${this.qrQueryParams(false)}`;
    },
    async refreshQrPreview() {
      if (!this.selected || !this.selected.id) return;
      try {
        this.qrBust++
        const base = this.qrUrl(this.selected.id);
        const query = this.qrQueryParams(true);
        const resp = await api.get(`${base}?${query}`, { responseType: 'blob' });
        if (this.qrPreviewSrc && this.qrPreviewSrc.startsWith('blob:')) {
          URL.revokeObjectURL(this.qrPreviewSrc);
        }
        this.qrPreviewSrc = URL.createObjectURL(resp.data);
      } catch (err) {
        console.error('Erreur prévisualisation QR:', err);
        this.qrPreviewSrc = '';
      }
    },
    async downloadQr() {
      if (!this.selected || !this.selected.id) return;
      try {
        const base = this.qrUrl(this.selected.id);
        // Ajout d'un paramètre anti-cache pour garantir une nouvelle génération
        this.qrBust++
        const params = { format: this.qr.format, size: this.qr.size, margin: this.qr.margin, ecc: this.qr.ecc, dark: this.qr.dark, light: this.qr.light, _: String(this.qrBust) };
        const query = new URLSearchParams(params).toString();
        const format = (this.qr.format || 'png').toLowerCase();
        const resp = await api.get(`${base}?${query}`, { responseType: 'blob' });
        const url = URL.createObjectURL(resp.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-${this.selected.slug}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Erreur téléchargement QR:', err);
      }
    },
    async onLogoFileChange(ev) {
      try {
        const file = ev?.target?.files?.[0]
        if (!file) return
        const fd = new FormData()
        fd.append('file', file)
        const { data } = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        const path = data?.file?.path || data?.path || ''
        if (path) this.form.logo_url = path
      } catch (e) {
        console.error('Upload logo échoué:', e)
        alert('Échec de l\'upload du logo')
      }
    },
    openCreate() { 
      this.formMode = 'create'; 
      this.form = { 
        name: '', 
        type: 'external', 
        logo_url: '', 
        external_url: '', 
        links: [], 
        theme: { 
          preset: 'classic', 
          slogan: 'Suivez, notez, contactez — en un scan.', 
          logo_style: 'circle',
          vcard_enabled: false,
          vcard: {
            first_name: '',
            last_name: '',
            organization: '',
            title: '',
            phone: '',
            email: '',
            website: '',
            address: ''
          }
        } 
      }; 
      this.showForm = true 
    },
    openEdit() {
      this.formMode = 'edit';
      const existingLinks = Array.isArray(this.links)
        ? this.links.map(l => ({ label: l.label || '', url: l.url || '', icon: l.icon || null, sort_order: typeof l.sort_order === 'number' ? l.sort_order : 0 }))
        : [];
      const parsedTheme = (() => { 
        const t = this.selected?.theme; 
        if (!t) return { 
          preset: 'classic', 
          slogan: 'Suivez, notez, contactez — en un scan.', 
          logo_style: 'circle',
          vcard_enabled: false,
          vcard: {
            first_name: '',
            last_name: '',
            organization: '',
            title: '',
            phone: '',
            email: '',
            website: '',
            address: ''
          }
        }; 
        if (typeof t === 'string') { 
          try { 
            const parsed = JSON.parse(t);
            // Assurer que les champs vCard existent
            if (!parsed.vcard_enabled) parsed.vcard_enabled = false;
            if (!parsed.vcard) parsed.vcard = {
              first_name: '',
              last_name: '',
              organization: '',
              title: '',
              phone: '',
              email: '',
              website: '',
              address: ''
            };
            return parsed;
          } catch { 
            return { 
              preset: 'classic', 
              slogan: 'Suivez, notez, contactez — en un scan.', 
              logo_style: 'circle',
              vcard_enabled: false,
              vcard: {
                first_name: '',
                last_name: '',
                organization: '',
                title: '',
                phone: '',
                email: '',
                website: '',
                address: ''
              }
            } 
          } 
        } 
        // Assurer que les champs vCard existent pour les objets existants
        if (!t.vcard_enabled) t.vcard_enabled = false;
        if (!t.vcard) t.vcard = {
          first_name: '',
          last_name: '',
          organization: '',
          title: '',
          phone: '',
          email: '',
          website: '',
          address: ''
        };
        return t; 
      })();
      this.form = { name: this.selected.name, type: this.selected.type, logo_url: this.selected.logo_url, external_url: this.selected.external_url, links: existingLinks, theme: parsedTheme };
      this.showForm = true;
    },
    async backupNow() {
    if (!this.selected || !this.selected.id) return;
    try {
    await linkpointsAPI.regenerateBackup(this.selected.id);
    alert('Backup régénéré avec succès.');
    } catch (e) {
    console.error('Erreur régénération backup:', e);
    alert('Erreur lors de la régénération du backup.');
    }
    },
    closeForm() { this.showForm = false },
    addFormLink() { this.form.links.push({ label: '', url: '' }) },
    removeLastFormLink() { this.form.links.pop() },
    async submitForm() {
      if (this.formMode === 'create') {
        const created = await linkpointsAPI.create(this.form)
        this.showForm = false
        await this.loadItems()
        this.select(created)
      } else {
        const updated = await linkpointsAPI.update(this.selected.id, this.form)
        this.showForm = false
        await this.loadItems()
        this.select(updated)
      }
    },
    select(item) {
      this.selected = item
      this.loadDetail(item.id)
    },
    async loadDetail(id) {
      try {
        const detail = await linkpointsAPI.detail(id)
        this.selected = detail.linkpoint || this.selected
        this.links = detail.links || []
        this.devices = detail.devices || { d7: [], d30: [] }
        this.sources = detail.sources || { d7: [], d30: [] }
        this.selectedGeo = detail.geo || { d7: [], d30: [] }
        this.stats = detail.stats || { d7: [], d30: [] }
      } catch (e) {
        console.error('Erreur chargement détail LinkPoint:', e)
        this.links = []
        this.devices = { d7: [], d30: [] }
        this.sources = { d7: [], d30: [] }
        this.selectedGeo = { d7: [], d30: [] }
        this.stats = { d7: [], d30: [] }
      }
      await this.loadStatsByLinkForSelected()
      this.refreshQrPreview()
    },
    async loadStatsByLinkForSelected() {
      if (!this.selected || !this.selected.id) { this.statsByLink = null; return }
      try {
        const res = await linkpointsAPI.statsByLink(this.activePeriod)
        const found = Array.isArray(res?.results) ? res.results.find(r => r.linkpoint_id === this.selected.id) : null
        this.statsByLink = found || { total_scans: 0, total_clicks: 0, links: [] }
      } catch (e) {
        console.error('Erreur chargement stats par lien:', e)
        this.statsByLink = { total_scans: 0, total_clicks: 0, links: [] }
      }
    },
    async restore(item) {
      await linkpointsAPI.update(item.id, { archived: 0 })
      await this.loadArchived()
      await this.loadItems()
    },
    async deleteArchived(item) {
      if (!confirm('Supprimer définitivement ce LinkPoint ?')) return
      await linkpointsAPI.remove(item.id)
      await this.loadArchived()
    },
    async archiveSelected() {
      if (!this.selected || !this.selected.id) return
      if (!confirm('Archiver ce LinkPoint ?')) return
      try {
        await linkpointsAPI.update(this.selected.id, { archived: 1 })
        this.selected = null
        await this.loadItems()
        await this.loadArchived()
      } catch (e) {
        console.error('Erreur lors de l\'archivage:', e)
        alert('Impossible d\'archiver ce LinkPoint.')
      }
    },
    async loadGlobalStats() {
      try {
        this.global = await linkpointsAPI.globalStats(30)
      } catch (e) {
        console.error('Erreur chargement stats globales:', e)
        this.global = null
      }
    },
    // Ajout: helper pour générer les points des sparklines
    makeSparklinePoints(values) {
      const w = Number(this.sparklineWidth || 300)
      const h = Number(this.sparklineHeight || 64)
      const arr = Array.isArray(values) ? values : []
      const n = arr.length
      if (n === 0) return `0,${h}`
      const max = Math.max(1, ...arr.map(v => Number(v || 0)))
      const step = n > 1 ? w / (n - 1) : w
      return arr.map((v, i) => {
        const x = Math.round(i * step)
        const y = Math.round(h - (Number(v || 0) / max) * h)
        return `${x},${y}`
      }).join(' ')
    },
    formatPercent(v) { return `${(v||0).toFixed(1)}%` },
    ctrBadgeClass(v) { return v>10 ? 'bg-green-100 text-green-800' : v>2 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800' },
    resetSelected() {
      if (!this.selected) return
      linkpointsAPI.reset(this.selected.id, 'hard').then(() => this.loadDetail(this.selected.id))
    },
    openDuplicate() {
      if (!this.selected) return
      this.showDuplicate = true
    },
    closeDuplicate() {
      this.showDuplicate = false
    },
    async confirmDuplicate() {
      if (!this.selected) return
      try {
        const duplicated = await linkpointsAPI.duplicate(this.selected.id)
        this.showDuplicate = false
        await this.loadItems()
        this.select(duplicated)
      } catch (e) {
        console.error('Erreur lors de la duplication:', e)
        alert('Impossible de dupliquer ce LinkPoint.')
      }
    },
    renderDetailCharts() {
      try {
        if (!this.$refs.detailChartEl || !this.$refs.ctrChartEl) return;
        const arr = this.detailStatsActive || [];
        const labels = arr.map((d, i) => d.date || d.day || d.label || String(i + 1));
        const scans = arr.map(d => Number(d.scans || 0));
        const clicks = arr.map(d => Number(d.clicks || 0));
        const ctr = arr.map((d) => (Number(d.scans || 0) > 0 ? (Number(d.clicks || 0) * 100) / Number(d.scans || 0) : 0));

        if (this.chartDetail) { this.chartDetail.destroy(); this.chartDetail = null; }
        if (this.chartCTR) { this.chartCTR.destroy(); this.chartCTR = null; }

        this.chartDetail = new Chart(this.$refs.detailChartEl.getContext('2d'), {
          type: 'line',
          data: {
            labels,
            datasets: [
              { label: 'Scans', data: scans, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.3 },
              { label: 'Clics', data: clicks, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.3 },
            ]
          },
          options: { responsive: false, maintainAspectRatio: false, animation: false, plugins: { legend: { display: true } }, scales: { x: { display: true }, y: { display: true, beginAtZero: true } } }
        });

        this.chartCTR = new Chart(this.$refs.ctrChartEl.getContext('2d'), {
          type: 'line',
          data: { labels, datasets: [{ label: 'CTR (%)', data: ctr, borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.3 }] },
          options: { responsive: false, maintainAspectRatio: false, animation: false, plugins: { legend: { display: true } }, scales: { x: { display: true }, y: { display: true, beginAtZero: true } } }
        });
      } catch (e) { console.error('Erreur rendu charts:', e); }
    },
    destroyDetailCharts() {
      try {
        if (this.chartDetail) { this.chartDetail.destroy(); this.chartDetail = null; }
        if (this.chartCTR) { this.chartCTR.destroy(); this.chartCTR = null; }
      } catch (e) { /* noop */ }
    }
  },
  watch: {
    qr: {
      deep: true,
      handler() {
        if (this.selected && this.selected.id) {
          this.refreshQrPreview();
        }
      }
    },
    // Recharger les stats par lien quand la période change et rafraîchir les graphiques si l'onglet stats est actif
    activePeriod() {
      this.loadStatsByLinkForSelected();
      if (this.activeDetailTab === 'stats') this.$nextTick(() => this.renderDetailCharts());
    },
    activeDetailTab(val) {
      if (val === 'stats') this.$nextTick(() => this.renderDetailCharts());
      else this.destroyDetailCharts();
    },
    detailStatsActive() {
      if (this.activeDetailTab === 'stats') this.$nextTick(() => this.renderDetailCharts());
    }
  },
  mounted() {
    this.load()
  },
  beforeUnmount() {
    if (this.qrPreviewSrc && this.qrPreviewSrc.startsWith('blob:')) {
      URL.revokeObjectURL(this.qrPreviewSrc);
    }
  }
}
</script>

<style scoped>
</style>