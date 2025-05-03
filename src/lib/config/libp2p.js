//import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { webRTC } from '@libp2p/webrtc'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
//import { mplex } from '@libp2p/mplex'
import { MemoryDatastore } from 'datastore-core'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
//import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { libp2pDefaults } from 'helia'

const datastore = new MemoryDatastore()
const defaults = libp2pDefaults();

export const Libp2pOptions = {
    ...defaults,
    datastore,
    transports: [
        webSockets(),
        circuitRelayTransport(),
        webRTC()],
    streamMuxers: [yamux()],
    connectionEncryption: [noise()],
    services: {
        identify: identify()
        //relay: circuitRelayServer()
        //pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
    }
}