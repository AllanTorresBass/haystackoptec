/*eslint-disable*/
import {
	AuthInterface,
	EncryptorInterface,
	SchemeInterface,
	SpecificationInterface,
	UserInterface,
} from "./services/interfaces";
import axios from "axios";
import Parser from "./services/parser";
import Specification from "./services/specification";
import { decode } from "base-64";
import ScramHeader from "./services/scram.header";

export default class HaystackAuth implements AuthInterface {
	host: string;
	encryptor: EncryptorInterface;

	public constructor(host: string, encryptor: EncryptorInterface) {
		this.host = host;
		this.encryptor = encryptor;
	}

	public getStringToBase64UriUTF8(string: string): string {
		return this.encryptor.getBase64QueryString(string);
	}

	public getAuthToken(header: string) {
		const data: ScramHeader = this.decodeData(header);

		// @ts-ignore
		return data.authToken;
	}

	public async processSignIn(user: UserInterface) {
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
		} catch (error: any) {
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
				} catch (error: any) {
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
						} catch (error: any) {
							throw new Error("Failed last message: " + error.response.text);
						}
					}
				}
			}
		}
	}

	public async processIIISignIn(user: UserInterface) {
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

	public async processSignOut(): Promise<void> {
		try {
			await axios.get(`${this.host}/user/logout`);
		} catch (error: any) {
			throw new Error("Failed last message: " + error.response.text);
		}
	}

	public parse3WAuth(header: string): SchemeInterface | null {
		const parser = new Parser(header);

		return parser.nextScheme();
	}

	public decodeData(string: string): object {
		const data: object = {};

		string.split(",").forEach(function (token) {
			const n = token.indexOf("=");
			if (n > 0) {
				// @ts-ignore
				data[token.substring(0, n)] = token.substring(n + 1);
			}
		});

		return data;
	}

	public getHashSpecification(
		hashType: string,
		encryptor: EncryptorInterface
	): SpecificationInterface {
		let specification: SpecificationInterface;

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

	public getScramHeader(
		user: UserInterface,
		scheme: SchemeInterface | null,
		encryptor: EncryptorInterface,
		messageHeader: string = "n,,"
	) {
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

	public getAuthHeader(
		user: UserInterface,
		schema: SchemeInterface | null,
		decodeHandler: Function,
		encryptor: EncryptorInterface,
		headerBare: string,
		messageHeader: string = "n,,"
	): string {
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
