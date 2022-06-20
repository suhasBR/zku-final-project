import {WagmiConfig, createClient} from "wagmi";
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {

  const client = createClient();

  return(
    <WagmiConfig client={client}>
    <Component {...pageProps} />
    </WagmiConfig>
  )


}

export default MyApp
