<script lang="ts">
    import type { HeliaLibp2p } from 'helia';
    import type { Libp2p } from '@libp2p/interface';
    import type { UnixFS } from '@helia/unixfs';
    import { onMount } from 'svelte';

    interface ipfsStruct {
      node: HeliaLibp2p<any>;
      fs: UnixFS;
    }
    let message: string = "Hello helia";
    let cid: string;
    let peerID: string;

    onMount(async () => {
            let ipfs: ipfsStruct | undefined;
            let { default: initHelia } = await import('$lib/heliaModule')
            const heliaNode = await initHelia();
            if (heliaNode) {
                ipfs = {
                    node: heliaNode.node,
                    fs: heliaNode.fs
                };
                (window as any).node = ipfs.node;
                peerID = ipfs.node.libp2p.peerId.toString();
                const cidTemp = await ipfs.fs.addBytes(new TextEncoder().encode(message));
                cid = cidTemp.toString();
            }
            console.log('CID:', cid);
            console.log('peerID:', peerID);
    });
</script>
<h1 class="text-3xl font-bold">IPFS DApp Manager</h1>
<h3>message: { message }</h3>
<h3>CID: { cid }</h3>
<h3>peerID: { peerID }</h3>
<style lang="postcss">
  @reference "tailwindcss";
  :global(html) {
    background-color: theme(--color-gray-100);
  }
</style>



