import decode from "base-64";
import axios from "axios";
var dataQuery3;
class Encryptor {
	Base64Table =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	sha256K = new Array(
		1116352408,
		1899447441,
		-1245643825,
		-373957723,
		961987163,
		1508970993,
		-1841331548,
		-1424204075,
		-670586216,
		310598401,
		607225278,
		1426881987,
		1925078388,
		-2132889090,
		-1680079193,
		-1046744716,
		-459576895,
		-272742522,
		264347078,
		604807628,
		770255983,
		1249150122,
		1555081692,
		1996064986,
		-1740746414,
		-1473132947,
		-1341970488,
		-1084653625,
		-958395405,
		-710438585,
		113926993,
		338241895,
		666307205,
		773529912,
		1294757372,
		1396182291,
		1695183700,
		1986661051,
		-2117940946,
		-1838011259,
		-1564481375,
		-1474664885,
		-1035236496,
		-949202525,
		-778901479,
		-694614492,
		-200395387,
		275423344,
		430227734,
		506948616,
		659060556,
		883997877,
		958139571,
		1322822218,
		1537002063,
		1747873779,
		1955562222,
		2024104815,
		-2067236844,
		-1933114872,
		-1866530822,
		-1538233109,
		-1090935817,
		-965641998
	);

	convertStringToBigEndian(string) {
		const output = Array(string.length >> 2);

		for (var i = 0; i < output.length; i++) {
			output[i] = 0;
		}

		for (var i = 0; i < string.length * 8; i += 8) {
			output[i >> 5] |= (string.charCodeAt(i / 8) & 0xff) << (24 - (i % 32));
		}

		return output;
	}

	convertBigEndianToString(words) {
		let output = "";

		for (let i = 0; i < words.length * 32; i += 8) {
			output += String.fromCharCode((words[i >> 5] >>> (24 - (i % 32))) & 0xff);
		}

		return output;
	}

	getNonce(length) {
		if (length == null) {
			length = 24;
		}

		let text = "";
		const possible = this.Base64Table;

		for (let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return "akel+0hsuBb70SwjOEvd0KDJ944f4563c67e950c77e94e4a846028ea";
	}

	calculateXor(a, b, convertStringToBigEndian, convertBigEndianToString) {
		const aw = convertStringToBigEndian(a);
		const bw = convertStringToBigEndian(b);

		if (aw.length != bw.length) {
			throw "Lengths don't match";
		}

		for (let i = 0; i < aw.length; ++i) {
			aw[i] ^= bw[i];
		}

		return convertBigEndianToString(aw);
	}

	convertToHexadecimalString(string, uppercase = false) {
		const hexadecimalTable = uppercase
			? "0123456789ABCDEF"
			: "0123456789abcdef";
		let output = "";
		let x;

		for (let i = 0; i < string.length; i++) {
			x = string.charCodeAt(i);
			output +=
				hexadecimalTable.charAt((x >>> 4) & 0x0f) +
				hexadecimalTable.charAt(x & 0x0f);
		}

		return output;
	}

	getBase64String(string) {
		const base64Padding = "=";
		const length = string.length;
		let output = "";
		let triplet;

		for (let i = 0; i < length; i += 3) {
			triplet =
				(string.charCodeAt(i) << 16) |
				(i + 1 < length ? string.charCodeAt(i + 1) << 8 : 0) |
				(i + 2 < length ? string.charCodeAt(i + 2) : 0);

			for (let j = 0; j < 4; j++) {
				if (i * 8 + j * 6 > string.length * 8) {
					output += base64Padding;
				} else {
					output += this.Base64Table.charAt((triplet >>> (6 * (3 - j))) & 0x3f);
				}
			}
		}

		return output;
	}

	getBase64QueryString(string) {
		return this.getBase64String(string)
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");
	}

	decodeBase64Uri(string) {
		return decode(string.replace(/\-/g, "+").replace(/_/g, "/"));
	}

	encodeStringToUTF8(string) {
		return unescape(encodeURIComponent(string));
	}

	bitwiseRotate(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}

	safeAdd(x, y) {
		const lsw = (x & 0xffff) + (y & 0xffff);
		const msw = (x >> 16) + (y >> 16) + (lsw >> 16);

		return (msw << 16) | (lsw & 0xffff);
	}

	getSHA1Tcf(t, b, c, d) {
		if (t < 20) return (b & c) | (~b & d);

		if (t < 40) return b ^ c ^ d;

		if (t < 60) return (b & c) | (b & d) | (c & d);

		return b ^ c ^ d;
	}

	gerSHA1AdditiveConstant(t) {
		return t < 20
			? 1518500249
			: t < 40
			? 1859775393
			: t < 60
			? -1894007588
			: -899497514;
	}

	getSHA1FromBigEndian(words, length) {
		words[length >> 5] |= 0x80 << (24 - (length % 32));
		words[(((length + 64) >> 9) << 4) + 15] = length;

		const w = Array(80);
		let a = 1732584193;
		let b = -271733879;
		let c = -1732584194;
		let d = 271733878;
		let e = -1009589776;

		for (let i = 0; i < words.length; i += 16) {
			const olda = a;
			const oldb = b;
			const oldc = c;
			const oldd = d;
			const olde = e;

			for (let j = 0; j < 80; j++) {
				if (j < 16) w[j] = words[i + j];
				else {
					w[j] = this.bitwiseRotate(
						w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16],
						1
					);
				}
				const t = this.safeAdd(
					this.safeAdd(this.bitwiseRotate(a, 5), this.getSHA1Tcf(j, b, c, d)),
					this.safeAdd(this.safeAdd(e, w[j]), this.gerSHA1AdditiveConstant(j))
				);
				e = d;
				d = c;
				c = this.bitwiseRotate(b, 30);
				b = a;
				a = t;
			}

			a = this.safeAdd(a, olda);
			b = this.safeAdd(b, oldb);
			c = this.safeAdd(c, oldc);
			d = this.safeAdd(d, oldd);
			e = this.safeAdd(e, olde);
		}

		return Array(a, b, c, d, e);
	}

	getCalculateHMACSHA1(key, data) {
		let bkey = this.convertStringToBigEndian(key);

		if (bkey.length > 16) {
			bkey = this.getSHA1FromBigEndian(bkey, key.length * 8);
		}

		const ipad = Array(16);
		const opad = Array(16);
		for (let i = 0; i < 16; i++) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5c5c5c5c;
		}

		const hash = this.getSHA1FromBigEndian(
			ipad.concat(this.convertStringToBigEndian(data)),
			512 + data.length * 8
		);

		return this.convertBigEndianToString(
			this.getSHA1FromBigEndian(opad.concat(hash), 512 + 160)
		);
	}

	getSHA1FromString(string) {
		return this.convertBigEndianToString(
			this.getSHA1FromBigEndian(
				this.convertStringToBigEndian(string),
				string.length * 8
			)
		);
	}

	sha1(data, key) {
		let hash;

		data = this.encodeStringToUTF8(data ?? "");

		if (key === undefined) {
			hash = this.getSHA1FromString(data);
		} else {
			key = this.encodeStringToUTF8(key);
			hash = this.getCalculateHMACSHA1(key, data);
		}

		return hash;
	}

	sha256S(X, n) {
		return (X >>> n) | (X << (32 - n));
	}

	sha256R(X, n) {
		return X >>> n;
	}

	getSha256Sigma0256(x) {
		return this.sha256S(x, 2) ^ this.sha256S(x, 13) ^ this.sha256S(x, 22);
	}

	getSha256Sigma1256(x) {
		return this.sha256S(x, 6) ^ this.sha256S(x, 11) ^ this.sha256S(x, 25);
	}

	getSha256Gamma0256(x) {
		return this.sha256S(x, 7) ^ this.sha256S(x, 18) ^ this.sha256R(x, 3);
	}

	getSha256Gamma1256(x) {
		return this.sha256S(x, 17) ^ this.sha256S(x, 19) ^ this.sha256R(x, 10);
	}

	sha256Ch(x, y, z) {
		return (x & y) ^ (~x & z);
	}

	sha256Maj(x, y, z) {
		return (x & y) ^ (x & z) ^ (y & z);
	}

	getSHA256FromBigEndian(words, length) {
		const HASH = new Array(
			1779033703,
			-1150833019,
			1013904242,
			-1521486534,
			1359893119,
			-1694144372,
			528734635,
			1541459225
		);
		const W = new Array(64);
		let a, b, c, d, e, f, g, h;
		let i, j, T1, T2;

		/* append padding */
		words[length >> 5] |= 0x80 << (24 - (length % 32));
		words[(((length + 64) >> 9) << 4) + 15] = length;

		for (i = 0; i < words.length; i += 16) {
			a = HASH[0];
			b = HASH[1];
			c = HASH[2];
			d = HASH[3];
			e = HASH[4];
			f = HASH[5];
			g = HASH[6];
			h = HASH[7];

			for (j = 0; j < 64; j++) {
				if (j < 16) W[j] = words[j + i];
				else {
					W[j] = this.safeAdd(
						this.safeAdd(
							this.safeAdd(this.getSha256Gamma1256(W[j - 2]), W[j - 7]),
							this.getSha256Gamma0256(W[j - 15])
						),
						W[j - 16]
					);
				}

				T1 = this.safeAdd(
					this.safeAdd(
						this.safeAdd(
							this.safeAdd(h, this.getSha256Sigma1256(e)),
							this.sha256Ch(e, f, g)
						),
						this.sha256K[j]
					),
					W[j]
				);
				T2 = this.safeAdd(this.getSha256Sigma0256(a), this.sha256Maj(a, b, c));
				h = g;
				g = f;
				f = e;
				e = this.safeAdd(d, T1);
				d = c;
				c = b;
				b = a;
				a = this.safeAdd(T1, T2);
			}

			HASH[0] = this.safeAdd(a, HASH[0]);
			HASH[1] = this.safeAdd(b, HASH[1]);
			HASH[2] = this.safeAdd(c, HASH[2]);
			HASH[3] = this.safeAdd(d, HASH[3]);
			HASH[4] = this.safeAdd(e, HASH[4]);
			HASH[5] = this.safeAdd(f, HASH[5]);
			HASH[6] = this.safeAdd(g, HASH[6]);
			HASH[7] = this.safeAdd(h, HASH[7]);
		}

		return HASH;
	}

	getCalculateSHA256(string) {
		return this.convertBigEndianToString(
			this.getSHA256FromBigEndian(
				this.convertStringToBigEndian(string),
				string.length * 8
			)
		);
	}

	getCalculateHMACSHA256(key, data) {
		let bkey = this.convertStringToBigEndian(key);

		if (bkey.length > 16) {
			bkey = this.getSHA256FromBigEndian(bkey, key.length * 8);
		}

		const ipad = Array(16);
		const opad = Array(16);

		for (let i = 0; i < 16; i++) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5c5c5c5c;
		}

		const hash = this.getSHA256FromBigEndian(
			ipad.concat(this.convertStringToBigEndian(data)),
			512 + data.length * 8
		);

		return this.convertBigEndianToString(
			this.getSHA256FromBigEndian(opad.concat(hash), 512 + 256)
		);
	}

	sha256(encryptor, data, key) {
		let hash;

		if (key === undefined) {
			hash = encryptor.getCalculateSHA256(data ?? "");
		} else {
			hash = encryptor.getCalculateHMACSHA256(key, data);
		}

		return hash;
	}

	calculateF(P, S, c, i) {
		let U_r;
		let U_c;

		S = S + this.convertBigEndianToString([i]);
		U_r = U_c = this.getCalculateHMACSHA256(P, S);
		for (let iter = 1; iter < c; ++iter) {
			U_c = this.getCalculateHMACSHA256(P, U_c);
			U_r = this.calculateXor(
				U_r,
				U_c,
				this.convertStringToBigEndian,
				this.convertBigEndianToString
			);
		}
		return U_r;
	}

	getPbkdf2HmacSha256(key, salt, iteration, dkLe) {
		const hLen = 32; // sha256 output hash size in bytes
		// @ts-ignore
		const l = Math.ceil(dkLe / hLen);
		// @ts-ignore
		const r = dkLe - (l - 1) * hLen;
		let T = "";
		let block;

		for (let i = 1; i <= l; ++i) {
			block = this.calculateF(key, salt, iteration, i);
			T += block;
		}

		return T.substr(0, dkLe);
	}
}

class User {
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

class Specification {
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
class ScramHeader {}

class Scheme {
	constructor() {
		this.name = null;
		this.params = {};
	}

	param(name) {
		let value = null;
		const params = this.params;
		console.log("line 539 scheme params", params);
		Object.keys(params).forEach(function (key) {
			if (key.toLowerCase() === name.toLowerCase()) {
				value = params[key];
			}
		});

		return value;
	}

	getName() {
		console.log("Scheme");
		return this.name;
	}
}

class Parser {
	SP = " ".charCodeAt(0);
	HTAB = "\t".charCodeAt(0);
	COMMA = ",".charCodeAt(0);
	EQ = "=".charCodeAt(0);
	DQUOT = '"'.charCodeAt(0);
	EOF = -1;

	constructor(header) {
		console.log("Class Parser Constructor");
		this.header = header;
		this.position = -2;
		this.current = -1;
		this.peek = -1;
		this.reset(0);
	}

	consume() {
		this.current = this.peek;
		this.position++;
		if (this.position + 1 < this.header.length) {
			this.peek = this.header.charCodeAt(this.position + 1);
		} else {
			this.peek = -1;
		}
	}

	reset(position) {
		this.position = position - 2;
		this.consume();
		this.consume();
	}

	eof() {
		return this.current === -1;
	}

	isOws() {
		return (
			this.current === " ".charCodeAt(0) || this.current === "\t".charCodeAt(0)
		);
	}

	ows() {
		while (this.isOws()) {
			this.consume();
		}
	}

	commaOws() {
		if (this.current !== ",".charCodeAt(0)) {
			throw "Expected ',': " + this.header.substring(0, this.position);
		}

		this.consume();
		this.ows();
	}

	parseQuotedString() {
		const start = this.position;

		if (this.current !== '"'.charCodeAt(0)) {
			throw "Expected '\"' at pos " + this.position;
		}

		this.consume();

		while (true) {
			if (this.eof()) {
				throw "Unterminated quoted-string starting at " + this.position;
			}

			if (this.current === '"'.charCodeAt(0)) {
				this.consume();
				break;
			}

			if (this.current === -1 && this.peek === '"'.charCodeAt(0)) {
				this.consume();
				this.consume();
			} else {
				this.consume();
			}
		}

		const quoted = this.header.substring(start, this.position);

		if (
			quoted.length < 2 ||
			quoted[0] !== '"' ||
			quoted[quoted.length - 1] !== '"'
		) {
			throw "Not a quoted string: " + quoted;
		}

		return quoted.substring(1, quoted.length - 1).replace('\\"', '"');
	}

	parseToken(terms) {
		terms = [
			" ".charCodeAt(0),
			"\t".charCodeAt(0),
			"=".charCodeAt(0),
			",".charCodeAt(0),
		];
		console.log("Parse token line 657", terms);
		const start = this.position;

		while (true) {
			if (this.eof()) {
				if (terms.indexOf(-1) >= 0) {
					break;
				}

				throw "Unexpected <eof>: " + this.header;
			}

			if (terms.indexOf(this.current) >= 0) {
				break;
			}

			this.consume();
		}
		console.log(
			"Parse token line 689",
			this.header.substring(start, this.position)
		);
		return this.header.substring(start, this.position);
	}

	checkParseAuthParam(params) {
		if (this.eof()) {
			return false;
		}

		const start = this.position;
		const key = this.parseToken([
			" ".charCodeAt(0),
			"\t".charCodeAt(0),
			"=".charCodeAt(0),
			",".charCodeAt(0),
			-1,
		]).toLowerCase();

		this.ows();

		if (this.current !== -1) {
			this.reset(start);

			return false;
		}

		this.consume();
		this.ows();

		const value =
			this.current === '"'.charCodeAt(0)
				? this.parseQuotedString()
				: this.parseToken([
						" ".charCodeAt(0),
						"\t".charCodeAt(0),
						",".charCodeAt(0),
						-1,
				  ]);

		this.ows();

		params[key] = value;

		return true;
	}

	parseAuthParams() {
		const params = {};
		let start = this.position;

		while (true) {
			start = this.position;

			if (this.eof()) {
				break;
			}

			if (Object.keys(params).length > 0) {
				this.commaOws();
			}

			if (!this.checkParseAuthParam(params)) {
				console.log("!this.checkParseAuthParam(params)", params);
				this.reset(start);
				break;
			}

			this.ows();
		}

		return params;
	}

	nextScheme() {
		console.log("nextScheme line 736");

		console.log("line 759");
		if (this.eof()) {
			return null;
		}

		if (this.position > 0) {
			this.commaOws();
		}
		console.log("line 766");
		const scheme = new Scheme();

		scheme.name = this.parseToken([
			" ".charCodeAt(0),
			",".charCodeAt(0),
			-1,
		]).toLowerCase();
		console.log("Entro en nextScheme", this.parseAuthParams());
		if (this.current !== " ".charCodeAt(0)) return scheme;

		while (this.current === " ".charCodeAt(0)) this.consume();

		scheme.params = this.parseAuthParams();

		return scheme;
	}
}
class HaystackAuth {
	host;
	encryptor;

	constructor(host, encryptor) {
		this.host = host;
		this.encryptor = encryptor;
	}

	getStringToBase64UriUTF8(string) {
		return this.encryptor.getBase64QueryString(string);
	}

	getAuthToken(header) {
		const data = this.decodeData(header);

		return data.authToken;
	}

	async processSignIn(user) {
		console.log("Entre en processSignIn in auth service");
		try {
			const headerHello = `HELLO username=${this.getStringToBase64UriUTF8(
				user.getUsername()
			)}`;
			console.log("1 query");
			//primera Peticion
			const query_1 = await axios.get(`${this.host}/ui`, {
				headers: {
					mode: "cors",
					"Access-Control-Allow-Origin": "*",
					Authorization: headerHello,
				},
			});
			console.log("response query_1: ", query_1);
			throw new Error(
				"Failed message with code different to 401 in Hello Message"
			);
		} catch (error) {
			if (error.response && error.response.status === 401) {
				console.log("catch error query 1: ", error.response.status);
				console.log(
					"catch error error.response query 1: ",
					error.response.statusText
				);
				console.log("line 825");
				const scheme = this.parse3WAuth(
					error.response.headers["www-authenticate"]
				);
				console.log("line 829", scheme);
				const [header, headerBare] = this.getScramHeader(
					user,
					scheme,
					this.encryptor
				);

				try {
					//segunda peticion
					console.log("segunda peticion");
					console.log("header", header);

					await axios.get(`${this.host}/ui`, {
						headers: {
							mode: "cors",
							"Access-Control-Allow-Origin": "*",
							Authorization: header,
						},
					});

					throw new Error(
						"Failed message with code different to 401 in First Message"
					);
				} catch (error) {
					if (error.response && error.response.status === 401) {
						console.log("message response query  2");
						console.log(error.response.status);
						console.log(error.response.statusText);
						const messageScheme = this.parse3WAuth(
							error.response.headers["www-authenticate"]
						);
						console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
						console.log(
							"messageScheme ",
							error.response.headers["www-authenticate"]
								.split(" ")[1]
								.split("=")[1]
								.slice(0, -1)
						);
						dataQuery3 = error.response.headers["www-authenticate"]
							.split(" ")[1]
							.split("=")[1]
							.slice(0, -1);
						console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
						const lastHeader = this.getAuthHeader(
							user,
							messageScheme ?? null,
							this.decodeData,
							this.encryptor,
							headerBare
						);
						console.log("lastHeader ", lastHeader);
						try {
							console.log("3  query");
							// tercera peticion
							const response = await axios.get(`${this.host}/ui`, {
								headers: {
									mode: "cors",
									"Access-Control-Allow-Origin": "*",
									Authorization: lastHeader,
								},
							});

							if (response.status === 200) {
								const authToken = this.getAuthToken(
									response.headers["authentication-info"]
								);

								return { token: authToken };
							}
						} catch (error) {
							console.log("catch error query 3: ", error.response.status);
							console.log(
								"catch error error.response query 3: ",
								error.response.statusText
							);
							throw new Error("Failed last message: " + error.response.text);
						}
					}
				}
			}
		}
	}

	parse3WAuth(header) {
		console.log("entro parse3WAuth", header);
		const parser = new Parser(header);

		return parser.nextScheme();
	}

	decodeData(string) {
		const data = {};

		string.split(",").forEach(function (token) {
			const n = token.indexOf("=");
			if (n > 0) {
				data[token.substring(0, n)] = token.substring(n + 1);
			}
		});

		return data;
	}

	getHashSpecification(hashType, encryptor) {
		let specification;

		switch (hashType.toLowerCase()) {
			case "sha-1":
				specification = new Specification(encryptor.sha1, 160);
				break;
			case "sha-256":
				specification = new Specification(encryptor.sha256, 256);
				break;
			default:
				throw "Unsupported hashFunc: " + hashType;
		}

		return specification;
	}

	getScramHeader(user, scheme, encryptor, messageHeader = "n,,") {
		const messageNonce = encryptor.getNonce(24);
		const headerBare = "n=" + user.getUsername() + ",r=" + messageNonce;
		const headerMessage = messageHeader + headerBare;
		const headerData = encryptor.getBase64QueryString(headerMessage);
		const token = scheme?.param("handshakeToken");
		let header = scheme?.getName() + " data=" + headerData;
		console.log("messageNonce", messageNonce);
		console.log("headerBare", headerBare);

		console.log("getScramHeader 942");
		console.log("headerMessage ", headerMessage);
		console.log("headerData ", headerData);
		console.log("token ", token);
		console.log("header ", header);
		if (token != null) {
			header += ", handshakeToken=" + token;
		}

		return [(header += ", handshakeToken=YXRvcnJlcw"), headerBare];
	}

	getAuthHeader(
		user,
		schema,
		decodeHandler,
		encryptor,
		headerBare,
		messageHeader = "n,,"
	) {
		const hashType = "SHA-256";
		const hashSpecification = this.getHashSpecification(
			hashType ?? "",
			encryptor
		);
		const hash = hashSpecification.getHash();
		const keyBits = hashSpecification.getBits();
		// @ts-ignore
		const data = atob(dataQuery3);

		const dataDecoded = decodeHandler(data);
		console.log("dataDecoded ", dataDecoded);
		const channelBinding = "c=" + encryptor.getBase64String(messageHeader);
		const nonce = "r=" + dataDecoded.r;
		const clientNoProof = channelBinding + "," + nonce;
		const salt = atob(dataDecoded.s);
		const iterations = parseInt(dataDecoded.i);
		const saltedPassword = encryptor.getPbkdf2HmacSha256(
			user.getPassword(),
			salt,
			iterations,
			keyBits / 8
		);
		const clientKey = hash(encryptor, "Client Key", saltedPassword);
		const storedKey = hash(encryptor, clientKey);
		const authMsg = headerBare + "," + data + "," + clientNoProof;
		const clientSig = hash(encryptor, authMsg, storedKey);
		const proof = encryptor.getBase64String(
			encryptor.calculateXor(
				clientKey,
				clientSig,
				encryptor.convertStringToBigEndian,
				encryptor.convertBigEndianToString
			)
		);
		const headerFinalMessage = clientNoProof + ",p=" + proof;
		const headerFinalData = encryptor.getBase64QueryString(headerFinalMessage);
		const token = schema?.param("handshakeToken");
		let header = "" + schema?.name + " data=" + headerFinalData;

		header += ", handshakeToken=YXRvcnJlcw";

		return header;
	}
}
(async () => {
	const user = new User("atorres", "WW86S-CYZMD-3MNUT");
	const authenticator = new HaystackAuth(
		"https://optecanalytics.com",
		new Encryptor()
	);
	const response = await authenticator.processSignIn(user);
	console.log(response);
})();
