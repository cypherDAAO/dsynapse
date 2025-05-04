import { writable } from 'svelte/store';
import { ethers } from 'ethers';

// Declaración de tipos para window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {method: string, params?: string[]}) => Promise<unknown>;
      on: (event: string, callback: (params: unknown) => void) => void;
      removeListener: (event: string, callback: (params: unknown) => void) => void;
    }
  }
}

// Estado inicial
const initialState = {
    provider: null as ethers.BrowserProvider | null,
    signer: null as ethers.JsonRpcSigner | null,
    account: null as string | null,
    chainId: null as bigint | null,
    isConnected: false,
    error: null as string | null,
    isLoading: false,
};

// Tipo inferido del estado
type Web3State = typeof initialState;

// Creamos el store reactivo
export const web3Store = writable<Web3State>(initialState);

// Función para conectar a MetaMask
export const connectWallet = async (): Promise<void> => {
    web3Store.update((state) => ({ ...state, isLoading: true, error: null }));

    if (typeof window !== 'undefined' && window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];

            if (accounts && accounts.length > 0) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const network = await provider.getNetwork();
                const signer = await provider.getSigner();
                const account = await signer.getAddress();

                web3Store.update((state) => ({
                    ...state,
                    provider,
                    signer,
                    account,
                    chainId: network.chainId,
                    isConnected: true,
                    isLoading: false,
                }));

                // Escuchar cambios de cuenta y red
                addEthereumListeners();
            } else {
                web3Store.update((state) => ({ 
                    ...state, 
                    error: 'No accounts found.', 
                    isLoading: false 
                }));
            }
        } catch (err) {
            console.error("Error connecting wallet:", err);
            web3Store.update((state) => ({ 
                ...state, 
                error: err instanceof Error ? err.message : 'Failed to connect wallet.', 
                isLoading: false 
            }));
        }
    } else {
        web3Store.update((state) => ({ 
            ...state, 
            error: 'MetaMask not detected. Please install it.', 
            isLoading: false 
        }));
    }
};

// Función para desconectar
export const disconnectWallet = (): void => {
    web3Store.set(initialState);
    removeEthereumListeners();
    console.log("Wallet disconnected");
};

// Manejadores de eventos
const handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
        console.log('MetaMask locked or no accounts connected.');
        disconnectWallet();
    } else {
        web3Store.update(state => ({ ...state, account: accounts[0] }));
        console.log("Account changed:", accounts[0]);
    }
};

const handleChainChanged = (chainIdHex: string): void => {
    console.log("Network changed to:", chainIdHex);
    window.location.reload();
};

const addEthereumListeners = (): void => {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.on) {
        window.ethereum.on('accountsChanged', handleAccountsChanged as (params: unknown) => void);
        window.ethereum.on('chainChanged', handleChainChanged as (params: unknown) => void);
        console.log("Ethereum listeners added.");
    }
};

const removeEthereumListeners = (): void => {
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged as (params: unknown) => void);
        window.ethereum.removeListener('chainChanged', handleChainChanged as (params: unknown) => void);
        console.log("Ethereum listeners removed.");
    }
}; 