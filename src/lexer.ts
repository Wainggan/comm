
import { TT, Token } from "./type";

import { Reporter } from "./error"

export const lexer = (src: string, reporter: Reporter) => {
	let current = 0;
	let start = 0;
	let line = 1;

	const atEnd = () => current >= src.length;

	const peek = (n = 0) => atEnd() ? "" : src[current + n];
	const advance = () => {
		if (peek() == '\n') line++;
		current++;
		return src[current - 1];
	};

	const match = (expected: string) => {
		if (atEnd()) return false;
		if (src[current] != expected) return false;
		current++;
		return true;
	}

	const isNumber = (c: string): boolean => ('0' <= c && c <= '9');
	const isIdentifier =
		(c: string): boolean =>
			('a' <= c && c <= 'z') ||
			('A' <= c && c <= 'Z') ||
			c == '_';
	const isWhitespace = (c: string): boolean => /\s/.test(c);

	const tokens: Token[] = [];

	const add = (type: TT) =>
		tokens.push(new Token(type, src.slice(start, current), start, line));

	const number = () => {
		while (isNumber(peek()))
			advance();
		if (peek() == '.' && isNumber(peek(1))) {
			advance();
			while (isNumber(peek()))
				advance();
		}
		add(TT.number);
	};
	const string = (c = `'`) => {
		while (!match(c) && !atEnd())
			advance();
		if (atEnd()) reporter.error(`Unterminated string`, start);
		add(TT.string);
	}
	const identifier = () => {
		while (isIdentifier(peek()) || isNumber(peek()))
			advance();
		const identifiers = {
			'print': 'print'
		};
		const str: string = src.slice(start, current)
		if (str in identifiers)
			// ts doesn't know its own types
			add(TT[str as unknown as number] as unknown as TT);
		else
			add(TT.identifier);
	};
	const whitespace = () => {
		while (isWhitespace(peek())) {
			advance();
		}
	};

	while (!atEnd()) {
		start = current;
		const char = advance();
		switch (char) {
			case '+': add(TT.plus); break;
			case '-': add(TT.minus); break;
			case '/': {
				if (match('/'))
					while (peek() != '\n' && !atEnd()) advance();
				else if (match('*')) {
					let stack = 0;
					while (stack >= 0 && !atEnd()) {
						if (match('*') && match('/')) stack--;
						if (match('/') && match('*')) stack++;
						advance();
					}
				}
				else
					add(TT.eof);

				break;
			}
			case '$': add(TT.dollar); break;
			case '?': add(TT.qmark); break;
			case ':': add(TT.colon); break;
			case ';': add(TT.semicolon); break;
			default:
				if (isWhitespace(char)) {
					whitespace();
					break;
				}
				if (isNumber(char)) {
					number();
					break;
				}
				if (char == `'` || char == `"`) {
					string(char);
					break;
				}
				if (isIdentifier(char)) {
					identifier();
					break;
				}
				reporter.error(`Unexpected character: '${char}'`, start)
		}
	}

	add(TT.eof);

	return tokens;

};
