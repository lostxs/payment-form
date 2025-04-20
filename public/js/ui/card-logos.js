export class CardLogosUI {
	constructor(containerId) {
		this.container = document.getElementById(containerId)
		this.highlightedCardType = null
		if (!this.container) {
			console.warn(`Container #${containerId} not found`)
		}
	}

	getHighlightedCardType() {
		return this.highlightedCardType
	}

	preloadImages(cards) {
		const urls = cards.flatMap(card =>
			[card.icons?.light, card.icons?.dark].filter(Boolean)
		)

		urls.forEach(url => {
			new Image().src = url
		})
	}

	render(cards) {
		if (!this.container) return

		this.container.innerHTML = cards
			.map(
				card => `
      <div data-card-type="${card.type}" data-active="false" class="size-full relative hidden data-[active=true]:block">
        <img src="${card.icons?.light}" alt="${card.type}" class="absolute inset-0 size-full object-cover object-center">
      </div>
    `
			)
			.join('')

		this.highlightCard(cards[0].type)
	}

	highlightCard(cardType) {
		const currentActiveLogo = this.container.querySelector('.active')

		if (
			!currentActiveLogo ||
			currentActiveLogo.dataset.cardType !== cardType
		) {
			this.container
				.querySelectorAll('[data-card-type]')
				.forEach(logo => {
					logo.dataset.active = 'false'
				})

			const newActiveLogo = this.container.querySelector(
				`[data-card-type="${cardType}"]`
			)
			if (newActiveLogo) {
				newActiveLogo.dataset.active = 'true'
				this.highlightedCardType = cardType
			}
		}
	}
}
