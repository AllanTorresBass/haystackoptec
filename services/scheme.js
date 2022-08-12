import { SchemeInterface } from "./interfaces";

export default class Scheme {
	constructor() {
		this.name = null;
		this.params = {};
	}

	param(name) {
		let value = null;
		const params = this.params;

		Object.keys(params).forEach(function (key) {
			if (key.toLowerCase() === name.toLowerCase()) {
				value = params[key];
			}
		});

		return value;
	}

	getName() {
		return this.name;
	}
}
