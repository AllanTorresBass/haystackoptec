import axios from "axios";
import Parser from "./parser";
import Specification from "./specification";
import { decode } from "base-64";
import ScramHeader from "./scram.header";

export default class HaystackAuth {
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

			//primera Peticion
			await axios.get(`${this.host}/ui`, {
				headers: {
					mode: "cors",
					"Access-Control-Allow-Origin": "*",
					Authorization: headerHello,
				},
			});

			throw new Error(
				"Failed message with code different to 401 in Hello Message"
			);
		} catch (error) {
			if (error.response && error.response.status === 401) {
				const scheme = this.parse3WAuth(
					error.response.headers["www-authenticate"]
				);
				const [header, headerBare] = this.getScramHeader(
					user,
					scheme,
					this.encryptor
				);

				try {
					//segunda peticion
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
						const messageScheme = this.parse3WAuth(
							error.response.headers["www-authenticate"]
						);
						const lastHeader = this.getAuthHeader(
							user,
							messageScheme ?? null,
							this.decodeData,
							this.encryptor,
							headerBare
						);

						try {
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
							throw new Error("Failed last message: " + error.response.text);
						}
					}
				}
			}
		}
	}

	async processIIISignIn(user) {
		console.log("Entre en processSignIn in auth service");
		const headerHello = `HELLO username=${this.getStringToBase64UriUTF8(
			user.getUsername()
		)}`;
		console.log("header #1", headerHello);
		const scheme = this.parse3WAuth(
			"scram handshakeToken=YXRvcnJlcw, hash=SHA-256"
		);
		const [header, headerBare] = this.getScramHeader(
			user,
			scheme,
			this.encryptor
		);
		console.log("header #2", header);
		const messageScheme = this.parse3WAuth(
			"scram data=cj1BeThRS3BDMU9XN3F1Y3RIMUk4VDM4ZTNmZWVmZmEyZDcwOTMwZjdmMWQ0ODY1NGZkYjJlYWE1OSxzPWxrRHpNZ2x4WUcrRFFJNDRDTDluQmRHTUxyUXlDT25XL3JlT09rQzNKeGc9LGk9MTAwMDA, handshakeToken=YXRvcnJlcw, hash=SHA-256"
		);
		const lastHeader = this.getAuthHeader(
			user,
			messageScheme ?? null,
			this.decodeData,
			this.encryptor,
			headerBare
		);

		// const authToken = this.getAuthToken(
		// 	response.headers["authentication-info"]
		// );
		// return { token: authToken };

		return lastHeader;
	}

	async processSignOut() {
		try {
			await axios.get(`${this.host}/user/logout`);
		} catch (error) {
			throw new Error("Failed last message: " + error.response.text);
		}
	}

	parse3WAuth(header) {
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

		if (token != null) {
			header += ", handshakeToken=" + token;
		}

		return [header, headerBare];
	}

	getAuthHeader(
		user,
		schema,
		decodeHandler,
		encryptor,
		headerBare,
		messageHeader = "n,,"
	) {
		const hashType = schema?.params.hash;
		const hashSpecification = this.getHashSpecification(
			hashType ?? "",
			encryptor
		);
		const hash = hashSpecification.getHash();
		const keyBits = hashSpecification.getBits();
		// @ts-ignore
		const data = decode(schema.param("data"));
		const dataDecoded = decodeHandler(data);
		const channelBinding = "c=" + encryptor.getBase64String(messageHeader);
		const nonce = "r=" + dataDecoded.r;
		const clientNoProof = channelBinding + "," + nonce;
		const salt = decode(dataDecoded.s);
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

		if (token != null) {
			header += ", handshakeToken=" + token;
		}

		return header;
	}
}
