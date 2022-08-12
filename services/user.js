export default class User {
	constructor(username, password) {
		this.username = username;
		this.password = password;
	}

	getUsername() {
		return this.username;
	}

	getPassword() {
		return this.password;
	}
}
