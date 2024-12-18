import '@arco-design/web-react/dist/css/arco.css'
import 'virtual:uno.css'
import '../assets/reset.css'
import './index.css'

import { createRoot } from 'react-dom/client'

import { Options } from './Options'

createRoot(document.getElementById('app')).render(
  // <React.StrictMode>
  <Options />,
  // </React.StrictMode>,
)
