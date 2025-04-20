export const ERROR_HANDLER_CONFIG = {
	containerId: 'payment-errors',
	errorItemClass: 'flex items-center gap-1 justify-start',
	errorClass: 'text-sm text-(--destructive-foreground) font-medium',
	errorIconClass: 'w-4 h-4 text-(--destructive-foreground) flex-shrink-0'
}

export const INPUT_FORMATS = {
	CARD_NUMBER: { pattern: '#### #### #### ####', maxLength: 16 },
	EXPIRY_DATE: { pattern: '##/##', maxLength: 4 },
	CVV: { pattern: '###', maxLength: 3 }
}

export const LOADING_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 3a9 9 0 1 0 9 9"/>
  </svg>
`
