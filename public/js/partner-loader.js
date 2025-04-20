export async function loadPlugins(paymentForm) {
	if (!window.partnerConfig?.customScripts?.length) {
		return
	}

	for (const scriptConfig of window.partnerConfig.customScripts) {
		try {
			const scriptUrl =
				typeof scriptConfig === 'string'
					? scriptConfig
					: scriptConfig.url

			// cache busting parameter
			const module = await import(`${scriptUrl}?t=${Date.now()}`)

			if (module.default) {
				paymentForm.registerPlugin(module.default)
			}
		} catch (error) {
			console.error(`Failed to load plugin: ${scriptConfig}`, error)
		}
	}
}
