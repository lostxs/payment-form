export class EventBus {
	constructor() {
		this.events = {}
	}

	on(event, callback) {
		if (!this.events[event]) this.events[event] = []
		this.events[event].push(callback)
	}

	emit(event, data) {
		;(this.events[event] || []).forEach(callback => callback(data))
	}
}
