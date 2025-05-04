<script lang="ts">
	import WalletTestSuite from '$lib/components/WalletTestSuite.svelte';
	import { web3Store } from '$lib/components/web3store';
</script>

<main>
	<h1>Pruebas de Wallet Ethereum</h1>
	<p class="description">
		Esta página permite probar componentes de wallet sin necesidad de tener MetaMask instalado.
		Puedes simular diferentes estados y comportamientos de conexión y transacciones.
	</p>
	
	<div class="test-container">
		<WalletTestSuite />
	</div>
	
	<div class="debug-info">
		<h2>Información del Store</h2>
		<pre>{JSON.stringify($web3Store, (key, value) => 
			typeof value === 'bigint' ? value.toString() : value, 2)}</pre>
	</div>

	<div class="info-box">
		<h2>Cómo usar este componente de prueba</h2>
		<ol>
			<li>Utiliza las pestañas para alternar entre pruebas de conexión y transacciones</li>
			<li>En la pestaña de conexión, configura el comportamiento de la wallet simulada</li>
			<li>Una vez conectado, prueba las funciones de transacción en la segunda pestaña</li>
			<li>Observa el estado del store en la sección de depuración</li>
		</ol>

		<h3>Sugerencias de prueba</h3>
		<ul>
			<li>Prueba "Auto-conectar" para iniciar con una wallet ya conectada</li>
			<li>Simula errores de conexión activando "Simular error"</li>
			<li>Prueba diferentes tiempos de confirmación y tasas de éxito para las transacciones</li>
			<li>Envía varias transacciones para ver cómo se muestran en el historial</li>
		</ul>
	</div>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		margin-bottom: 1rem;
		color: #333;
	}
	
	h2 {
		font-size: 1.3rem;
		margin-top: 2rem;
		margin-bottom: 1rem;
		color: #444;
	}
	
	h3 {
		font-size: 1.1rem;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: #555;
	}
	
	.description {
		margin-bottom: 2rem;
		color: #666;
		line-height: 1.5;
	}

	.test-container {
		margin: 2rem 0;
		display: flex;
		justify-content: center;
	}
	
	.debug-info {
		margin-top: 2rem;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
		border: 1px solid #ddd;
	}
	
	pre {
		background: #444;
		color: #f0f0f0;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		font-size: 0.9rem;
		line-height: 1.4;
	}
	
	.info-box {
		margin-top: 2rem;
		padding: 1.5rem;
		background: #f0f7ff;
		border-radius: 8px;
		border: 1px solid #d0e3ff;
	}
	
	ol, ul {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}
	
	li {
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}
</style> 