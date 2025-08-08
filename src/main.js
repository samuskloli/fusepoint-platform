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
  faUserCog, faUserTag, faKey
} from '@fortawesome/free-solid-svg-icons'

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
  faUserCog, faUserTag, faKey
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
app.mount('#app')
