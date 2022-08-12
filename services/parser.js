/*eslint-disable*/

import Scheme from "./scheme";

export default class Parser {
	SP = " ".charCodeAt(0);
	HTAB = "\t".charCodeAt(0);
	COMMA = ",".charCodeAt(0);
	EQ = "=".charCodeAt(0);
	DQUOT = '"'.charCodeAt(0);
	EOF = -1;

	constructor(header) {
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
		return this.current === Parser.EOF;
	}

	isOws() {
		return this.current === Parser.SP || this.current === Parser.HTAB;
	}

	ows() {
		while (this.isOws()) {
			this.consume();
		}
	}

	commaOws() {
		if (this.current !== Parser.COMMA) {
			throw "Expected ',': " + this.header.substring(0, this.position);
		}

		this.consume();
		this.ows();
	}

	parseQuotedString() {
		const start = this.position;

		if (this.current !== Parser.DQUOT) {
			throw "Expected '\"' at pos " + this.position;
		}

		this.consume();

		while (true) {
			if (this.eof()) {
				throw "Unterminated quoted-string starting at " + this.position;
			}

			if (this.current === Parser.DQUOT) {
				this.consume();
				break;
			}

			if (this.current === Parser.EOF && this.peek === Parser.DQUOT) {
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
		const start = this.position;

		while (true) {
			if (this.eof()) {
				if (terms.indexOf(Parser.EOF) >= 0) {
					break;
				}

				throw "Unexpected <eof>: " + this.header;
			}

			if (terms.indexOf(this.current) >= 0) {
				break;
			}

			this.consume();
		}

		return this.header.substring(start, this.position);
	}

	checkParseAuthParam(params) {
		if (this.eof()) {
			return false;
		}

		const start = this.position;
		const key = this.parseToken([
			Parser.SP,
			Parser.HTAB,
			Parser.EQ,
			Parser.COMMA,
			Parser.EOF,
		]).toLowerCase();

		this.ows();

		if (this.current !== Parser.EQ) {
			this.reset(start);

			return false;
		}

		this.consume();
		this.ows();

		const value =
			this.current === Parser.DQUOT
				? this.parseQuotedString()
				: this.parseToken([Parser.SP, Parser.HTAB, Parser.COMMA, Parser.EOF]);

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
				this.reset(start);
				break;
			}

			this.ows();
		}

		return params;
	}

	nextScheme() {
		if (this.eof()) {
			return null;
		}

		if (this.position > 0) {
			this.commaOws();
		}

		const scheme = new Scheme();

		scheme.name = this.parseToken([
			Parser.SP,
			Parser.COMMA,
			Parser.EOF,
		]).toLowerCase();

		if (this.current !== Parser.SP) return scheme;

		while (this.current === Parser.SP) this.consume();

		scheme.params = this.parseAuthParams();

		return scheme;
	}
}
