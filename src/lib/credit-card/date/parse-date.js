/**
 * Parses date string into month and year components
 * @param {string} dateString - Date string (MM/YY, MM/YYYY, etc.)
 * @returns {Object} Parsed date { month, year }
 */
export function parseDate(dateString) {
	if (typeof dateString !== 'string') {
		return { month: '', year: '' }
	}

	// Handle various formats
	const formats = [
		// MM/YY or MM/YYYY
		/^(?<month>\d{1,2})\s*[/-]\s*(?<year>\d{2,4})$/,
		// MM YY or MM YYYY
		/^(?<month>\d{1,2})\s+(?<year>\d{2,4})$/,
		// MMDD or MMDDYY or MMDDYYYY
		/^(?<month>\d{1,2})(?<year>\d{2,4})$/
	]

	for (const format of formats) {
		const match = dateString.match(format)
		if (match) {
			return {
				month: match.groups.month,
				year: match.groups.year
			}
		}
	}

	// Fallback for ambiguous formats
	return { month: '', year: '' }
}
