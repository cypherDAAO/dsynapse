import { ethers } from 'ethers';
import { web3Store } from '$lib/components/web3store';
import { get } from 'svelte/store';
import contractAbi from './DCO2s.json';

// Dirección del contrato inteligente desplegado
const CONTRACT_ADDRESS = '0x8028f7a9cd0dE3029922dd67919B76C3ae320419';

// Interfaz para el CID empaquetado que devuelve el contrato
export interface PackedCID {
    CID1: string;
    CID2: string;
}

// Interfaz para los LLMs que se obtienen del contrato
export interface LLM {
    name: string;
    packedCid: PackedCID;
    cid: string; // CID completo ya desempaquetado
}

/**
 * Convierte un bytes32 (hex string) a string legible
 */
function bytes32ToString(hex: string): string {
    // Eliminar '0x' del inicio si existe
    if (hex.startsWith('0x')) {
        hex = hex.substring(2);
    }
    
    // Convertir hex a string, eliminando bytes nulos
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.substring(i, i + 2), 16);
        if (code !== 0) {
            str += String.fromCharCode(code);
        }
    }
    return str;
}

/**
 * Une dos bytes32 para formar un CID completo
 */
function combinePackedCIDToString(cid1: string, cid2: string): string {
    const str1 = bytes32ToString(cid1);
    const str2 = bytes32ToString(cid2);
    return str1 + str2;
}

/**
 * Obtiene una instancia del contrato conectada
 */
export function getContractInstance() {
    const state = get(web3Store);
    
    if (!state.provider || !state.signer) {
        throw new Error('Wallet no conectada');
    }
    
    return new ethers.Contract(CONTRACT_ADDRESS, contractAbi, state.signer);
}

/**
 * Obtiene los nombres de todos los LLMs disponibles en el contrato
 */
export async function getLLMNames(): Promise<string[]> {
    try {
        const contract = getContractInstance();
        const bytes32Names = await contract.listLLMNames();
        
        // Convertir de bytes32 a strings legibles
        return bytes32Names.map((bytes32Name: string) => bytes32ToString(bytes32Name));
    } catch (error) {
        console.error('Error al obtener nombres de LLMs:', error);
        throw error;
    }
}

/**
 * Obtiene el CID de un LLM específico
 */
export async function getLLMCid(llmName: string): Promise<string> {
    try {
        const contract = getContractInstance();
        
        // Convertir nombre a bytes32
        const nameBytes32 = ethers.encodeBytes32String(llmName);
        
        // Obtener el PackedCID del contrato
        const packedCid = await contract.getLLM(nameBytes32);
        
        // Combinar los dos bytes32 para formar el CID completo
        return combinePackedCIDToString(packedCid.CID1, packedCid.CID2);
    } catch (error) {
        console.error(`Error al obtener CID para ${llmName}:`, error);
        throw error;
    }
}

/**
 * Obtiene todos los LLMs disponibles con sus CIDs
 */
export async function getAllLLMs(): Promise<LLM[]> {
    try {
        console.log('🔍 LLMIndexer - Obteniendo instancia del contrato...');
        const contract = getContractInstance();
        
        console.log('🔍 LLMIndexer - Llamando al método listLLMNames del contrato...');
        const bytes32Names = await contract.listLLMNames();
        console.log('🔍 LLMIndexer - Nombres recibidos (formato bytes32):', bytes32Names);
        
        const llms: LLM[] = [];
        
        for (const bytes32Name of bytes32Names) {
            const name = bytes32ToString(bytes32Name);
            console.log(`🔍 LLMIndexer - Procesando LLM: ${name} (${bytes32Name})`);
            
            console.log(`🔍 LLMIndexer - Obteniendo información del LLM ${name}...`);
            const packedCid = await contract.getLLM(bytes32Name);
            console.log(`🔍 LLMIndexer - PackedCID recibido para ${name}:`, packedCid);
            
            const fullCid = combinePackedCIDToString(packedCid.CID1, packedCid.CID2);
            console.log(`🔍 LLMIndexer - CID combinado para ${name}: ${fullCid}`);
            
            llms.push({
                name,
                packedCid: {
                    CID1: packedCid.CID1,
                    CID2: packedCid.CID2
                },
                cid: fullCid
            });
        }
        
        console.log('🔍 LLMIndexer - Todos los LLMs procesados:', llms);
        return llms;
    } catch (error) {
        console.error('❌ LLMIndexer - Error al obtener todos los LLMs:', error);
        throw error;
    }
}

/**
 * Verifica si un LLM específico existe
 */
export async function llmExists(llmName: string): Promise<boolean> {
    try {
        const contract = getContractInstance();
        
        // Convertir nombre a bytes32
        const nameBytes32 = ethers.encodeBytes32String(llmName);
        
        return await contract.llmExists(nameBytes32);
    } catch (error) {
        console.error(`Error al verificar si existe ${llmName}:`, error);
        throw error;
    }
} 