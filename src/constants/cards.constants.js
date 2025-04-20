export const CARD_TYPES = {
	VISA: {
		type: 'VISA',
		patterns: [4],
		lengths: [16],
		cvvLength: [3]
	},
	MASTERCARD: {
		type: 'MASTERCARD',
		patterns: [
			[51, 55],
			[2221, 2229],
			[223, 229],
			[23, 26],
			[270, 271],
			2720
		],
		lengths: [16],
		cvvLength: [3]
	},
	MIR: {
		type: 'MIR',
		patterns: [[2200, 2204]],
		lengths: [16],
		cvvLength: [3]
	}
}

export const COMMISSION_TYPES = {
	FIXED: 'fixed',
	PERCENT: 'percent',
	MIXED: 'mixed'
}

export const CARD_TYPES_COMMISSION = {
	[CARD_TYPES.VISA.type]: {
		type: COMMISSION_TYPES.PERCENT,
		value: 0.01 // 1%
	},
	[CARD_TYPES.MASTERCARD.type]: {
		type: COMMISSION_TYPES.FIXED,
		value: 10 // 10 units of the order currency
	},
	[CARD_TYPES.MIR.type]: {
		type: COMMISSION_TYPES.MIXED,
		percentValue: 0.01, // 1%
		fixedValue: 10 // +10 units of the order currency
	}
}

export const CARD_TYPES_ICONS = {
	[CARD_TYPES.VISA.type]: {
		light: '/assets/visa.svg',
		dark: ''
	},
	[CARD_TYPES.MASTERCARD.type]: {
		light: '/assets/mastercard.svg',
		dark: ''
	},
	[CARD_TYPES.MIR.type]: {
		light: '/assets/mir.svg',
		dark: ''
	}
}
