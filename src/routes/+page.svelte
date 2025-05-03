<script lang="ts">
    interface ipfsStruct {
      node: HeliaLibp2p<Libp2p<{ x: Record<string, unknown> }>>;
      fs: UnixFS;
    }
    let message: String = "Hello helia";
    let cid: String;
    let peerID: String;

    import { onMount } from 'svelte';

    onMount(async () => {
            let ipfs: ipfsStruct;
            let { default: initHelia } = await import('$lib/heliaModule')
            ipfs = await initHelia();
            window.node = ipfs.node;
            peerID = ipfs.node.libp2p.peerId.toString()
            cid = await ipfs.fs.addBytes(new TextEncoder().encode(message));
            //cid = cidTemp.toString();
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



