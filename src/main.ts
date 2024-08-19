import './index.css'
import { createApp } from 'vue'
import App from './App.vue'
import { addIcons, OhVueIcon } from 'oh-vue-icons'

import * as BiIcons from 'oh-vue-icons/icons/bi'
const Bi = Object.values({ ...BiIcons })
addIcons(...Bi)

const app = createApp(App)
app.component('v-icon', OhVueIcon)
app.mount('#app')
