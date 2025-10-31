import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router/index.js'

// Toast notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Currency plugin
import CurrencyPlugin from './plugins/currency.js'

// i18n plugin
import VueI18nPlugin from './plugins/i18n.js'

// Token Manager plugin
import TokenManagerPlugin from './plugins/tokenManager.js'

// Font Awesome CSS pour les balises <i class="fas ...">
import '@fortawesome/fontawesome-free/css/all.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faUser, faUsers, faTicketAlt, faPlus, faEdit, faTrash, faEye, faEyeSlash,
  faCheck, faTimes, faSpinner, faExclamationTriangle, faInfoCircle,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faHome, faDashboard, faProjectDiagram, faUserTie, faSignOutAlt,
  faBars, faSearch, faFilter, faSort, faSortUp, faSortDown,
  faCalendar, faCalendarAlt, faClock, faMapMarkerAlt, faPhone, faEnvelope,
  faGlobe, faLink, faExternalLinkAlt, faDownload, faUpload, faFile, faFileAlt,
  faImage, faVideo, faMusic, faCode, faDatabase, faServer,
  faCog, faCogs, faWrench, faTools, faPalette, faPaintBrush,
  faChartLine, faChartBar, faChartPie, faPercent,
  faBullseye, faFlag, faTrophy, faMedal, faStar,
  faHeart, faThumbsUp, faThumbsDown, faComment, faComments, faShare,
  faBookmark, faTag, faTags, faFolder, faFolderOpen, faArchive,
  faBell, faBellSlash, faEnvelopeOpen, faInbox,
  faLock, faUnlock, faKey, faShield, faUserShield, faEyeDropper,
  faRocket, faLightbulb, faMagic, faBolt, faFire,
  faGem, faCrown, faDiamond, faCoins, faDollarSign, faEuroSign,
  faShoppingCart, faShoppingBag, faCreditCard, faReceipt, faCalculator,
  faBuilding, faIndustry, faStore, faWarehouse,
  faCar, faTruck, faPlane, faShip, faTrain, faBicycle,
  faWifi, faSignal, faPrint,
  faCamera, faCameraRetro, faPhotoVideo, faFilm, faMicrophone,
  faHeadphones, faVolumeUp, faVolumeDown, faVolumeMute, faVolumeOff,
  faPlay, faPause, faStop, faForward, faBackward, faStepForward, faStepBackward,
  faRandom, faRepeat, faSync, faSyncAlt, faRedo, faUndo,
  faCopy, faCut, faPaste, faClipboard, faClipboardList, faClipboardCheck,
  faSave, faFileDownload, faFileUpload, faFileImport, faFileExport,
  faNewspaper, faBook, faBookOpen, faGraduationCap, faUniversity,
  faFlask, faMicroscope, faAtom, faDna, faSeedling, faLeaf,
  faSun, faMoon, faCloud, faCloudRain, faSnowflake, faUmbrella,
  faMapPin, faMap, faCompass, faRoute, faRoad, faBridge,
  faGamepad, faDice, faChess, faPuzzlePiece, faRobot, faSpaceShuttle,
  faGift, faBirthdayCake,
  faHandshake, faHandPeace, faHandRock, faHandPaper,
  faSmile, faLaugh, faMeh, faFrown, faSadTear,
  faGrin, faGrinAlt, faGrinBeam, faGrinSquint, faGrinTongue,
  faKiss, faKissBeam, faKissWinkHeart, faLaughBeam, faLaughSquint,
  faLaughWink, faMehBlank, faMehRollingEyes, faSadCry, faSmileBeam,
  faSmileWink, faSurprise, faTired, faAngry, faDizzy,
  // Icônes spécifiques aux templates de projet
  faBullhorn, faShareAlt, faPenFancy, faMobileAlt,
  faCheckSquare, faListCheck, faBrain, faHistory, faSwatchbook,
  faCodeBranch, faCheckCircle,
  // Ajouts requis par NotificationCenter et actions
  faUserPlus, faCheckDouble,
  // Icônes manquantes identifiées
  faTimesCircle, faExclamationCircle, faAngleDoubleLeft, faAngleLeft, 
  faAngleRight, faAngleDoubleRight, faArrowLeft, faArrowUp, faArrowDown,
  faShieldAlt, faUserCheck, faUserSlash, faUserTag, faHandHoldingDollar,
  faHeartbeat, faTachometerAlt, faMicrochip, faMemory, faHdd, faNetworkWired,
  faSave as faSaveIcon
} from '@fortawesome/free-solid-svg-icons'

// Ajouter les icônes à la bibliothèque
library.add(
  faUser, faUsers, faTicketAlt, faPlus, faEdit, faTrash, faEye, faEyeSlash,
  faCheck, faTimes, faSpinner, faExclamationTriangle, faInfoCircle,
  faChevronDown, faChevronUp, faChevronLeft, faChevronRight,
  faHome, faDashboard, faProjectDiagram, faUserTie, faSignOutAlt,
  faBars, faSearch, faFilter, faSort, faSortUp, faSortDown,
  faCalendar, faCalendarAlt, faClock, faMapMarkerAlt, faPhone, faEnvelope,
  faGlobe, faLink, faExternalLinkAlt, faDownload, faUpload, faFile, faFileAlt,
  faImage, faVideo, faMusic, faCode, faDatabase, faServer,
  faCog, faCogs, faWrench, faTools, faPalette, faPaintBrush,
  faChartLine, faChartBar, faChartPie, faPercent,
  faBullseye, faFlag, faTrophy, faMedal, faStar,
  faHeart, faThumbsUp, faThumbsDown, faComment, faComments, faShare,
  faBookmark, faTag, faTags, faFolder, faFolderOpen, faArchive,
  faBell, faBellSlash, faEnvelopeOpen, faInbox,
  faLock, faUnlock, faKey, faShield, faUserShield, faEyeDropper,
  faRocket, faLightbulb, faMagic, faBolt, faFire,
  faGem, faCrown, faDiamond, faCoins, faDollarSign, faEuroSign,
  faShoppingCart, faShoppingBag, faCreditCard, faReceipt, faCalculator,
  faBuilding, faIndustry, faStore, faWarehouse,
  faCar, faTruck, faPlane, faShip, faTrain, faBicycle,
  faWifi, faSignal, faPrint,
  faCamera, faCameraRetro, faPhotoVideo, faFilm, faMicrophone,
  faHeadphones, faVolumeUp, faVolumeDown, faVolumeMute, faVolumeOff,
  faPlay, faPause, faStop, faForward, faBackward, faStepForward, faStepBackward,
  faRandom, faRepeat, faSync, faSyncAlt, faRedo, faUndo,
  faCopy, faCut, faPaste, faClipboard, faClipboardList, faClipboardCheck,
  faSave, faFileDownload, faFileUpload, faFileImport, faFileExport,
  faNewspaper, faBook, faBookOpen, faGraduationCap, faUniversity,
  faFlask, faMicroscope, faAtom, faDna, faSeedling, faLeaf,
  faSun, faMoon, faCloud, faCloudRain, faSnowflake, faUmbrella,
  faMapPin, faMap, faCompass, faRoute, faRoad, faBridge,
  faGamepad, faDice, faChess, faPuzzlePiece, faRobot, faSpaceShuttle,
  faGift, faBirthdayCake,
  faHandshake, faHandPeace, faHandRock, faHandPaper,
  faSmile, faLaugh, faMeh, faFrown, faSadTear,
  faGrin, faGrinAlt, faGrinBeam, faGrinSquint, faGrinTongue,
  faKiss, faKissBeam, faKissWinkHeart, faLaughBeam, faLaughSquint,
  faLaughWink, faMehBlank, faMehRollingEyes, faSadCry, faSmileBeam,
  faSmileWink, faSurprise, faTired, faAngry, faDizzy,
  // Icônes spécifiques aux templates de projet
  faBullhorn, faShareAlt, faPenFancy, faMobileAlt,
  faCheckSquare, faListCheck, faBrain, faHistory, faSwatchbook,
  faCodeBranch, faCheckCircle,
  // Ajouts requis
  faUserPlus, faCheckDouble,
  // Icônes manquantes ajoutées
  faTimesCircle, faExclamationCircle, faAngleDoubleLeft, faAngleLeft, 
  faAngleRight, faAngleDoubleRight, faArrowLeft, faArrowUp, faArrowDown,
  faShieldAlt, faUserCheck, faUserSlash, faUserTag, faHandHoldingDollar,
  faHeartbeat, faTachometerAlt, faMicrochip, faMemory, faHdd, faNetworkWired,
  faSaveIcon
)

const app = createApp(App)
const pinia = createPinia()

// Enregistrer le composant Font Awesome globalement
app.component('font-awesome-icon', FontAwesomeIcon)

// Configuration des toasts
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)
app.use(CurrencyPlugin)
app.use(VueI18nPlugin)
app.use(TokenManagerPlugin)
app.mount('#app')

// Enregistrer le service worker pour notifications push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
