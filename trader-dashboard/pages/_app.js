import ApiKeyOverlay from '../components/ApiKeyOverlay';
import '../styles/globals.css'

export default function App({Component,pageProps}){return (<>
  <Component {...pageProps} />
  <ApiKeyOverlay />
</>)}
