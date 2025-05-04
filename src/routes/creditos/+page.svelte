<script>
	// Página de créditos y licencias
	import { t } from '$lib/i18n';
</script>

<div class="container mx-auto py-12 px-4">
    <h1 class="text-3xl font-bold mb-8">{$t('credits.title')}</h1>
    
    <section class="mb-10">
        <h2 class="text-2xl font-semibold mb-4">{$t('credits.fonts.title')}</h2>
        
        <div class="bg-gray-100 dark:bg-zinc-800 p-6 rounded-lg mb-6">
            <h3 class="text-xl font-medium mb-2">Inter</h3>
            <p class="mb-2">{$t('credits.fonts.designed_by')} Rasmus Andersson</p>
            <p class="mb-2">{$t('credits.fonts.license')}: <a href="https://scripts.sil.org/OFL" class="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener">SIL Open Font License 1.1 (OFL-1.1)</a></p>
            <p>Esta fuente se utiliza bajo los términos de la licencia SIL Open Font License, que permite su uso, redistribución y modificación bajo ciertas condiciones.</p>
        </div>
        
        <div class="bg-gray-100 dark:bg-zinc-800 p-6 rounded-lg">
            <h3 class="text-xl font-medium mb-2">Geist</h3>
            <p class="mb-2">{$t('credits.fonts.designed_by')} Vercel</p>
            <p class="mb-2">{$t('credits.fonts.license')}: <a href="https://scripts.sil.org/OFL" class="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener">SIL Open Font License (OFL)</a></p>
            <p>Esta fuente se utiliza bajo los términos de la licencia SIL Open Font License, que permite su uso, redistribución y modificación bajo ciertas condiciones.</p>
        </div>
    </section>
    
    <section>
        <h2 class="text-2xl font-semibold mb-4">{$t('credits.license_terms.title')}</h2>
        <div class="prose dark:prose-invert max-w-none">
            <p class="mb-4">{$t('credits.license_terms.description')}</p>
            
            <h3 class="text-xl font-medium mb-2">{$t('credits.license_terms.attribution.title')}</h3>
            <p class="mb-4">{$t('credits.license_terms.attribution.description')}</p>
            
            <h3 class="text-xl font-medium mb-2">{$t('credits.license_terms.dapps.title')}</h3>
            <p>{$t('credits.license_terms.dapps.description')}</p>
        </div>
    </section>
    
    <section class="mt-10">
        <h2 class="text-2xl font-semibold mb-4">{$t('credits.full_license.title')}</h2>
        <p class="mb-4">{$t('credits.full_license.description')} <code class="bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded">static/LICENSE-FONTS.txt</code> en este proyecto.</p>
        <a href="/LICENSE-FONTS.txt" class="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200" target="_blank">{$t('credits.full_license.view_button')}</a>
    </section>
</div> 