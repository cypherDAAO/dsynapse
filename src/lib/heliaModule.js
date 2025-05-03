import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs'
import { Libp2pOptions } from './config/libp2p.js';
import { createLibp2p } from 'libp2p';
//import * as dotenv from 'dotenv';
//dotenv.config();

export default async function initHelia() {
  // ToDo add logic to import privKey if exists
  // if not generate new and store it.
  try {
    const libp2p = await createLibp2p(Libp2pOptions);
    const node = await createHelia({ libp2p });
    const fs = unixfs(node);
    return {
        node,
        fs,
    };
  } catch (error) {
    console.error('Error setting up helia', error);
  }
}
