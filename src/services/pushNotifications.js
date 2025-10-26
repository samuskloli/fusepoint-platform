// Service d'abonnement aux notifications push (navigateur)

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function ensureSubscribed() {
  if (!(await isPushSupported())) {
    return { success: false, error: 'Push non supporté' }
  }

  if (Notification.permission === 'denied') {
    return { success: false, error: 'Permission refusée' }
  }

  // Demander la permission si nécessaire
  if (Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') {
      return { success: false, error: 'Permission non accordée' }
    }
  }

  // Récupérer l’enregistrement du service worker
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) {
    // Essayer d’enregistrer
    await navigator.serviceWorker.register('/sw.js')
  }
  const registration = await navigator.serviceWorker.ready

  // Récupérer le token d'accès pour authentifier les appels API
  const token = localStorage.getItem('accessToken')
  if (!token) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  // Obtenir la clé publique VAPID
  const res = await fetch('/api/push/vapidPublicKey', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) return { success: false, error: 'Clé VAPID indisponible' }
  const { publicKey } = await res.json()
  const applicationServerKey = urlBase64ToUint8Array(publicKey)

  // S’abonner côté navigateur
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  })

  // Envoyer au serveur
  const saveRes = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(subscription)
  })
  if (!saveRes.ok) return { success: false, error: 'Échec enregistrement abonnement' }

  return { success: true }
}