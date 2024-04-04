import React, { useEffect, useState } from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useHuddle01 } from "@huddle01/react";
import { publicProvider } from "wagmi/providers/public";
import { polygonMumbai } from "wagmi/chains";
import Context from "../contexts/context";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { SignerContextProvider } from "@/contexts/signerContext";
import { StreamContextProvider } from "@/contexts/streamContext";
import { CurrentUserOrStreamerContextProvider } from "@/contexts/currUserOrStreamerContext";
import {
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  imTokenWallet,
  ledgerWallet,
  omniWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrum, bsc, mainnet, optimism, polygon } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT as string;
const { chains, provider } = configureChains(
  [polygonMumbai],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: "https://responsive-lively-brook.quiknode.pro/4bc6ee0cd8f90e1457df450bc756c10547be2f32",
      }),
    }),
  ]
);

// const { connectors } = getDefaultWallets({
//   appName: "My RainbowKit App",
//   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT as string,
//   chains,
// });

const { wallets } = getDefaultWallets({
  appName: 'rainbowkit.com',
  chains,
  projectId,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'More',
    wallets: [
      argentWallet({ chains, projectId }),
      trustWallet({ chains, projectId }),
      omniWallet({ chains, projectId }),
      imTokenWallet({ chains, projectId }),
      ledgerWallet({ chains, projectId }),
    ],
  },
]);

// const config = createConfig({
//   autoConnect: true,
//   publicClient,
//   webSocketPublicClient,
// });

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  const { initialize, isInitialized } = useHuddle01();
  const [roomId, setRoomId] = useState<string>("No Room Id");
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    // its preferable to use env vars to store projectId
    initialize(process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID as string);
  }, []);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Context.Provider
          value={{
            roomId,
            setRoomId,
            loading,
            setLoading
          }}
        >
          <SignerContextProvider>
            <StreamContextProvider>
              <CurrentUserOrStreamerContextProvider>
                <Component {...pageProps} />
              </CurrentUserOrStreamerContextProvider>
            </StreamContextProvider>
          </SignerContextProvider>
        </Context.Provider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
