<script lang="ts">
	import { web3Store } from '$lib/components/web3store';
	import { ethers } from 'ethers';
	import { onMount } from 'svelte';

	// ---- CONFIGURACIÓN DE PRUEBAS ----
	// Estado de la conexión de wallet
	export let autoConnect = false;
	export let mockAccount = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
	export let mockChainId = 1n; // Ethereum Mainnet
	export let simulateError = false;
	export let simulateLoading = false;
	export let errorMessage = 'Error simulado de conexión';

	// Estado de transacciones
	let pendingTransactions: Transaction[] = [];
	let completedTransactions: Transaction[] = [];
	export let autoConfirmTime = 3; // segundos
	export let successRate = 90; // porcentaje de éxito
	
	// Datos de entrada para transacciones
	let recipientAddress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
	let amount = '0.01';
	let gasPrice = '20';
	
	// Variables de estado interno
	let isTestMode = true;
	let isSimulatedConnected = false;
	let activeTab = 'connection'; // 'connection' o 'transactions'

	// Interfaz de transacción
	interface Transaction {
		id: string;
		from: string;
		to: string;
		amount: string;
		gasPrice: string;
		status: 'pending' | 'success' | 'failed';
		hash: string;
		timestamp: number;
		error?: string;
	}
	
	// Comprobar si hay wallet conectada
	$: isWalletConnected = $web3Store.isConnected && $web3Store.account;
	
	// ---- FUNCIONES DE SIMULACIÓN DE CONEXIÓN ----
	// Simular conexión de wallet
	const simulateConnect = () => {
		if (simulateError) {
			web3Store.update((state) => ({
				...state,
				error: errorMessage,
				isLoading: false
			}));
			return;
		}

		if (simulateLoading) {
			web3Store.update((state) => ({
				...state,
				isLoading: true,
				error: null
			}));
			return;
		}

		// Simular un proveedor
		const mockProvider = {
			getNetwork: () => Promise.resolve({ chainId: mockChainId }),
			getSigner: () => ({
				getAddress: () => Promise.resolve(mockAccount)
			})
		};

		web3Store.update((state) => ({
			...state,
			provider: mockProvider as unknown as ethers.BrowserProvider,
			signer: mockProvider.getSigner() as unknown as ethers.JsonRpcSigner,
			account: mockAccount,
			chainId: mockChainId,
			isConnected: true,
			isLoading: false,
			error: null
		}));

		isSimulatedConnected = true;
	};

	// Simular desconexión de wallet
	const simulateDisconnect = () => {
		web3Store.update((state) => ({
			...state,
			provider: null,
			signer: null,
			account: null,
			chainId: null,
			isConnected: false,
			isLoading: false,
			error: null
		}));

		isSimulatedConnected = false;
	};

	// ---- FUNCIONES DE SIMULACIÓN DE TRANSACCIONES ----
	// Enviar transacción simulada
	function sendTransaction() {
		if (!isWalletConnected || !$web3Store.account) return;
		
		// Crear hash aleatorio para la transacción
		const hash = '0x' + Array.from({length: 64}, () => 
			'0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
		
		// Crear transacción
		const tx: Transaction = {
			id: Math.random().toString(36).substring(2, 9),
			from: $web3Store.account,
			to: recipientAddress,
			amount,
			gasPrice,
			status: 'pending',
			hash,
			timestamp: Date.now()
		};
		
		// Añadir a pendientes
		pendingTransactions = [...pendingTransactions, tx];
		
		// Simular confirmación después de un tiempo
		setTimeout(() => {
			// Determinar si la transacción tiene éxito basado en la tasa de éxito
			const isSuccess = Math.random() * 100 <= successRate;
			
			// Actualizar estado
			pendingTransactions = pendingTransactions.filter(t => t.id !== tx.id);
			
			const completedTx: Transaction = {
				...tx,
				status: isSuccess ? 'success' : 'failed',
				error: isSuccess ? undefined : 'Transacción rechazada por la red'
			};
			
			completedTransactions = [completedTx, ...completedTransactions];
		}, autoConfirmTime * 1000);
	}
	
	// Limpiar transacciones
	function clearTransactions() {
		completedTransactions = [];
	}
	
	// Formatear tiempo relativo
	function timeAgo(timestamp: number): string {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		
		if (seconds < 60) return `hace ${seconds} segundos`;
		if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
		if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
		return `hace ${Math.floor(seconds / 86400)} días`;
	}

	// Auto conectar al cargar
	onMount(() => {
		if (autoConnect && !simulateError) {
			simulateConnect();
		}

		return () => {
			// Limpiar al desmontar
			if (isTestMode && isSimulatedConnected) {
				simulateDisconnect();
			}
		};
	});
</script>

<div class="wallet-test-suite">
	<div class="tabs">
		<button 
			class="tab-button {activeTab === 'connection' ? 'active' : ''}" 
			on:click={() => activeTab = 'connection'}
		>
			Conexión de Wallet
		</button>
		<button 
			class="tab-button {activeTab === 'transactions' ? 'active' : ''}" 
			on:click={() => activeTab = 'transactions'}
		>
			Transacciones
		</button>
	</div>
	
	<div class="tab-content">
		<!-- Pestaña de conexión de wallet -->
		{#if activeTab === 'connection'}
			<div class="connection-tab">
				<div class="test-controls">
					<h3>Simulador de Wallet</h3>
					<div class="controls-grid">
						<div class="control-group">
							<label>
								<input type="checkbox" bind:checked={autoConnect} />
								Auto-conectar
							</label>
						</div>
						<div class="control-group">
							<label>
								<input type="checkbox" bind:checked={simulateError} />
								Simular error
							</label>
						</div>
						<div class="control-group">
							<label>
								<input type="checkbox" bind:checked={simulateLoading} />
								Simular cargando
							</label>
						</div>
						<div class="control-group">
							<label for="mockAccount">Dirección:</label>
							<input type="text" id="mockAccount" bind:value={mockAccount} />
						</div>
						<div class="control-group">
							<label for="errorMessage">Mensaje de error:</label>
							<input type="text" id="errorMessage" bind:value={errorMessage} />
						</div>
					</div>
					<div class="test-buttons">
						<button class="test-button connect" on:click={simulateConnect}>Simular Conexión</button>
						<button class="test-button disconnect" on:click={simulateDisconnect}>Simular Desconexión</button>
					</div>
				</div>

				<div class="wallet-status">
					<h3>Estado de la Wallet</h3>
					<div class="status-item">
						<span class="status-label">Conectado:</span>
						<span class="status-value">{$web3Store.isConnected ? 'Sí' : 'No'}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Cargando:</span>
						<span class="status-value">{$web3Store.isLoading ? 'Sí' : 'No'}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Cuenta:</span>
						<span class="status-value">{$web3Store.account || 'No conectado'}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Red:</span>
						<span class="status-value">{$web3Store.chainId ? `ID: ${$web3Store.chainId}` : 'No conectado'}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Error:</span>
						<span class="status-value error">{$web3Store.error || 'Ninguno'}</span>
					</div>
				</div>

				<div class="wallet-display">
					<h3>Vista de la Wallet</h3>
					{#if $web3Store.isLoading}
						<div class="wallet-ui loading">
							<button disabled>Conectando...</button>
						</div>
					{:else if $web3Store.isConnected}
						<div class="wallet-ui connected">
							<span class="account-display">
								{$web3Store.account?.substring(0, 6)}...{$web3Store.account?.substring($web3Store.account?.length - 4)}
							</span>
							<button on:click={simulateDisconnect}>Desconectar</button>
						</div>
					{:else}
						<div class="wallet-ui disconnected">
							<button on:click={simulateConnect}>Conectar Wallet</button>
							{#if $web3Store.error}
								<p class="error-message">{$web3Store.error}</p>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		
		<!-- Pestaña de transacciones -->
		{:else if activeTab === 'transactions'}
			<div class="transactions-tab">
				<h3>Simular Transacciones</h3>
				
				{#if isWalletConnected}
					<div class="transaction-form">
						<div class="form-group">
							<label for="recipient">Dirección Destino:</label>
							<input type="text" id="recipient" bind:value={recipientAddress} />
						</div>
						
						<div class="form-row">
							<div class="form-group">
								<label for="amount">Cantidad (ETH):</label>
								<input type="text" id="amount" bind:value={amount} />
							</div>
							
							<div class="form-group">
								<label for="gas">Gas (Gwei):</label>
								<input type="text" id="gas" bind:value={gasPrice} />
							</div>
						</div>
						
						<button class="send-button" on:click={sendTransaction}>Enviar Transacción</button>
					</div>
					
					<div class="transaction-settings">
						<div class="form-group">
							<label for="confirm-time">Tiempo de confirmación (segundos):</label>
							<input type="range" id="confirm-time" min="1" max="10" bind:value={autoConfirmTime} />
							<span>{autoConfirmTime}s</span>
						</div>
						
						<div class="form-group">
							<label for="success-rate">Tasa de éxito:</label>
							<input type="range" id="success-rate" min="0" max="100" bind:value={successRate} />
							<span>{successRate}%</span>
						</div>
					</div>
					
					<!-- Transacciones pendientes -->
					{#if pendingTransactions.length > 0}
						<div class="transaction-list pending">
							<h4>Transacciones Pendientes</h4>
							{#each pendingTransactions as tx}
								<div class="transaction-item pending">
									<div class="tx-status pending">
										<span class="loader"></span>
									</div>
									<div class="tx-details">
										<div class="tx-hash">{tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}</div>
										<div class="tx-info">
											<span class="tx-amount">{tx.amount} ETH</span>
											<span class="tx-addresses">De: {tx.from.substring(0, 6)}... A: {tx.to.substring(0, 6)}...</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
					
					<!-- Transacciones completadas -->
					{#if completedTransactions.length > 0}
						<div class="transaction-list completed">
							<div class="list-header">
								<h4>Historial de Transacciones</h4>
								<button class="clear-button" on:click={clearTransactions}>Limpiar</button>
							</div>
							
							{#each completedTransactions as tx}
								<div class="transaction-item {tx.status}">
									<div class="tx-status {tx.status}"></div>
									<div class="tx-details">
										<div class="tx-hash">{tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}</div>
										<div class="tx-info">
											<span class="tx-amount">{tx.amount} ETH</span>
											<span class="tx-addresses">De: {tx.from.substring(0, 6)}... A: {tx.to.substring(0, 6)}...</span>
										</div>
										<div class="tx-time">{timeAgo(tx.timestamp)}</div>
										{#if tx.error}
											<div class="tx-error">{tx.error}</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="no-transactions">No hay transacciones completadas</p>
					{/if}
				{:else}
					<div class="not-connected">
						<p>Conéctate a una wallet para simular transacciones</p>
						<button class="connect-first" on:click={() => { activeTab = 'connection'; }}>
							Ir a conexión de wallet
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.wallet-test-suite {
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1.5rem;
		margin: 1rem 0;
		background: #f9f9f9;
		max-width: 600px;
	}

	/* Estilos de pestañas */
	.tabs {
		display: flex;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #ddd;
	}
	
	.tab-button {
		background: none;
		border: none;
		padding: 0.75rem 1.25rem;
		font-size: 1rem;
		cursor: pointer;
		border-bottom: 3px solid transparent;
		color: #666;
	}
	
	.tab-button:hover {
		background: #f0f0f0;
		color: #333;
	}
	
	.tab-button.active {
		border-bottom-color: #4a56e2;
		color: #4a56e2;
		font-weight: bold;
	}
	
	.tab-content {
		min-height: 300px;
	}

	/* Estilos generales */
	h3 {
		font-size: 1.2rem;
		margin-top: 0;
		margin-bottom: 1rem;
		color: #333;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.5rem;
	}
	
	h4 {
		font-size: 1rem;
		margin: 0.5rem 0;
		color: #444;
	}

	/* Estilos para la pestaña de conexión */
	.test-controls,
	.wallet-status,
	.wallet-display {
		margin-bottom: 1.5rem;
	}

	.controls-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
	}

	.control-group input[type="text"] {
		padding: 0.4rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.test-buttons {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.test-button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
		flex: 1;
	}

	.test-button.connect {
		background: #4caf50;
		color: white;
	}

	.test-button.disconnect {
		background: #f44336;
		color: white;
	}

	.status-item {
		display: flex;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.status-label {
		width: 80px;
		font-weight: bold;
		color: #555;
	}

	.status-value {
		flex: 1;
	}

	.status-value.error {
		color: #f44336;
	}

	.wallet-ui {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		border: 1px dashed #ccc;
		border-radius: 4px;
		background: white;
	}

	.wallet-ui button {
		background: #4a56e2;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}

	.wallet-ui button:hover {
		background: #3a46c2;
	}

	.wallet-ui button:disabled {
		background: #9ca3f4;
		cursor: wait;
	}

	.account-display {
		font-family: monospace;
		padding: 0.5rem;
		background: #f1f1f1;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	.error-message {
		color: red;
		margin-top: 0.5rem;
		font-size: 0.8rem;
	}

	/* Estilos para la pestaña de transacciones */
	.transaction-form {
		margin-bottom: 1.5rem;
	}
	
	.form-group {
		margin-bottom: 0.75rem;
	}
	
	.form-row {
		display: flex;
		gap: 1rem;
	}
	
	.form-row .form-group {
		flex: 1;
	}
	
	label {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.9rem;
		color: #555;
	}
	
	input[type="text"] {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 0.9rem;
	}
	
	input[type="range"] {
		width: 80%;
		vertical-align: middle;
	}
	
	.transaction-settings {
		margin-bottom: 1.5rem;
		padding: 0.75rem;
		background: #eee;
		border-radius: 6px;
	}
	
	.transaction-settings .form-group {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	
	.transaction-settings label {
		width: 60%;
		margin-bottom: 0;
	}
	
	.transaction-settings span {
		margin-left: 0.5rem;
		font-size: 0.9rem;
		color: #555;
	}
	
	.send-button {
		width: 100%;
		padding: 0.75rem;
		background: #4a56e2;
		color: white;
		border: none;
		border-radius: 4px;
		font-weight: bold;
		cursor: pointer;
		margin-top: 0.5rem;
	}
	
	.send-button:hover {
		background: #3a46c2;
	}
	
	.transaction-list {
		margin-top: 1.5rem;
		border-top: 1px solid #eee;
		padding-top: 0.75rem;
	}
	
	.list-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}
	
	.clear-button {
		font-size: 0.8rem;
		background: none;
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		color: #666;
		cursor: pointer;
	}
	
	.clear-button:hover {
		background: #f0f0f0;
	}
	
	.transaction-item {
		display: flex;
		padding: 0.75rem;
		border: 1px solid #eee;
		border-radius: 6px;
		margin-bottom: 0.75rem;
		background: white;
	}
	
	.tx-status {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		margin-right: 0.75rem;
		margin-top: 0.25rem;
		flex-shrink: 0;
	}
	
	.tx-status.pending {
		background: #ffc107;
		position: relative;
	}
	
	.tx-status.success {
		background: #4caf50;
	}
	
	.tx-status.failed {
		background: #f44336;
	}
	
	.loader {
		width: 100%;
		height: 100%;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s linear infinite;
		position: absolute;
		top: 0;
		left: 0;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.tx-details {
		flex: 1;
	}
	
	.tx-hash {
		font-family: monospace;
		color: #555;
		margin-bottom: 0.25rem;
	}
	
	.tx-info {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		margin-bottom: 0.25rem;
	}
	
	.tx-amount {
		font-weight: bold;
	}
	
	.tx-addresses {
		color: #666;
	}
	
	.tx-time {
		font-size: 0.8rem;
		color: #888;
	}
	
	.tx-error {
		font-size: 0.8rem;
		color: #f44336;
		margin-top: 0.25rem;
	}
	
	.not-connected {
		text-align: center;
		padding: 1.5rem;
		color: #666;
		background: #f0f0f0;
		border-radius: 6px;
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
	
	.connect-first {
		background: #4a56e2;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}
	
	.no-transactions {
		text-align: center;
		color: #888;
		font-style: italic;
		padding: 1rem;
	}
</style> 