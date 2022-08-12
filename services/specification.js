export default class Specification {
	constructor(hash, bits) {
		this.hash = hash;
		this.bits = bits;
	}

	getHash() {
		return this.hash;
	}

	getBits() {
		return this.bits;
	}
}
