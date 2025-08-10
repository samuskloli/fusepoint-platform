import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// Toast notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Currency plugin
import CurrencyPlugin from './plugins/currency'

// i18n plugin
import VueI18nPlugin from './plugins/i18n'

// Pinia persistence plugin
import { createPiniaPersistence } from './plugins/pinia-persistence'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faUserTie, faUsers, faTicketAlt, faComments, faUserCheck, faClock, faSearch,
  faSpinner, faBuilding, faCalendarPlus, faComment, faEnvelope, faEllipsisH,
  faEye, faTrashAlt, faCalendar, faCheck, faCheckCircle, faUser, faPaperPlane,
  faTimes, faExclamationTriangle, faTrash, faShieldAlt, faCog, faRocket, faUserTimes,
  faBell, faSyncAlt, faArrowUp, faArrowDown, faMinus, faTachometerAlt, faChartLine,
  faClipboardList, faHeartbeat, faInfoCircle, faEdit, faLock, faTimesCircle,
  faDownload, faRedo, faMicrochip, faMemory, faHdd, faNetworkWired, faCogs,
  faServer, faArchive, faExclamationCircle, faAngleDoubleLeft, faAngleLeft,
  faAngleRight, faAngleDoubleRight, faChevronUp, faChevronDown, faPlus, faQuestionCircle,
  faSignInAlt, faSignOutAlt, faSort, faSortUp, faSortDown, faUndo, faMagic, faSave,
  faUpload, faPalette, faPlug, faUserSlash, faUserPlus, faRobot, faBrain, faChartBar,
  faUserCog, faUserTag, faKey, faExclamation, faFlask, faEyeSlash, faCheckDouble, faBellSlash,
  // Icônes pour les modèles de projets
  faBullhorn, faGlobe, faShareAlt, faMobileAlt, faPenFancy, faLayerGroup, faProjectDiagram,
  faFolder, faComments as faCommentsAlt, faTimeline, faCheckSquare, faBullseye, faFileAlt,
  faPaintBrush, faStar, faCode, faListCheck, faHistory, faCalendarAlt, faImage,
  faSwatchbook, faCodeBranch, faTags, faChartPie, faCheckCircle as faCheckCircleAlt,
  // Icônes manquantes pour l'interface
  faHeart, faEllipsisV, faTh, faList, faCopy, faShare, faPlay, faPause, faFlag,
  faCircle, faPlayCircle, faPauseCircle, faQuestion, faLightbulb, faHammer,
  faTasks, faUserPlus as faUserPlusIcon, faChevronLeft, faChevronRight, faAngleDoubleRight,
  faPuzzlePiece, faRobot as faRobotIcon, faCrystalBall, faBrain as faBrainIcon,
  faChartBar as faChartBarIcon, faCommentDots, faCopyright, faInbox, faFile,
  faFilePdf, faFileWord, faFileExcel, faFilePowerpoint, faFileVideo, faFileAudio,
  faFileArchive, faFileImage, faCloudUploadAlt, faFolderOpen, faVideo, faMusic,
  faClipboard, faClipboardCheck, faUserCheck as faUserCheckIcon, faCalendarTimes,
  faAngleUp, faAngleDown, faPaperclip, faFolderPlus, faCalendarCheck
} from '@fortawesome/free-solid-svg-icons'

// Import des icônes regular (outline)
import { 
  faHeart as farHeart, faCircle as farCircle, faCheckCircle as farCheckCircle,
  faFile as farFile, faFolder as farFolder, faCalendar as farCalendar
} from '@fortawesome/free-regular-svg-icons'

// Ajouter les icônes à la bibliothèque
library.add(
  faUserTie, faUsers, faTicketAlt, faComments, faUserCheck, faClock, faSearch,
  faSpinner, faBuilding, faCalendarPlus, faComment, faEnvelope, faEllipsisH,
  faEye, faTrashAlt, faCalendar, faCheck, faCheckCircle, faUser, faPaperPlane,
  faTimes, faExclamationTriangle, faTrash, faShieldAlt, faCog, faRocket, faUserTimes,
  faBell, faSyncAlt, faArrowUp, faArrowDown, faMinus, faTachometerAlt, faChartLine,
  faClipboardList, faHeartbeat, faInfoCircle, faEdit, faLock, faTimesCircle,
  faDownload, faRedo, faMicrochip, faMemory, faHdd, faNetworkWired, faCogs,
  faServer, faArchive, faExclamationCircle, faAngleDoubleLeft, faAngleLeft,
  faAngleRight, faAngleDoubleRight, faChevronUp, faChevronDown, faPlus, faQuestionCircle,
  faSignInAlt, faSignOutAlt, faSort, faSortUp, faSortDown, faUndo, faMagic, faSave,
  faUpload, faPalette, faPlug, faUserSlash, faUserPlus, faRobot, faBrain, faChartBar,
  faUserCog, faUserTag, faKey, faExclamation, faFlask, faEyeSlash, faCheckDouble, faBellSlash,
  // Icônes pour les modèles de projets
  faBullhorn, faGlobe, faShareAlt, faMobileAlt, faPenFancy, faLayerGroup, faProjectDiagram,
  faFolder, faCommentsAlt, faTimeline, faCheckSquare, faBullseye, faFileAlt,
  faPaintBrush, faStar, faCode, faListCheck, faHistory, faCalendarAlt, faImage,
  faSwatchbook, faCodeBranch, faTags, faChartPie, faCheckCircleAlt,
  // Icônes manquantes pour l'interface
  faHeart, faEllipsisV, faTh, faList, faCopy, faShare, faPlay, faPause, faFlag,
  faCircle, faPlayCircle, faPauseCircle, faQuestion, faLightbulb, faHammer,
  faTasks, faUserPlusIcon, faChevronLeft, faChevronRight, faAngleDoubleRight,
  faPuzzlePiece, faRobotIcon, faCrystalBall, faBrainIcon,
  faChartBarIcon, faCommentDots, faCopyright, faInbox, faFile,
  faFilePdf, faFileWord, faFileExcel, faFilePowerpoint, faFileVideo, faFileAudio,
  faFileArchive, faFileImage, faCloudUploadAlt, faFolderOpen, faVideo, faMusic,
  faClipboard, faClipboardCheck, faUserCheckIcon, faCalendarTimes,
  faAngleUp, faAngleDown, faPaperclip, faFolderPlus, faCalendarCheck,
  // Icônes regular (outline)
  farHeart, farCircle, farCheckCircle, farFile, farFolder, farCalendar
)

const app = createApp(App)
const pinia = createPinia()
const piniaPersistence = createPiniaPersistence()
pinia.use(piniaPersistence)

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
app.mount('#app')
