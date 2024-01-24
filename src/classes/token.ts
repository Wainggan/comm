

export enum TT {
	int = 0,
	float,
	string,
	true,
	false,
	null,

	t_int,
	t_float,
	t_i8,
	t_i16,
	t_i32,
	t_i64,
	t_f32,
	t_f64,
	t_bool,
	t_string,
	t_null,
	t_void,

	identifier,

	plus,
	minus,
	star,
	slash,

	lesser,
	lesser_equal,
	greater,
	greater_equal,
	equal,
	equal_equal,

	emark,
	emark_equal,
	qmark,

	comma,
	dot,
	tilde,
	colon,
	semicolon,

	lparen,
	rparen,
	lbrace,
	rbrace,
	lbracket,
	rbracket,

	let,
	mut,
	if,
	else,
	while,
	for,
	return,
	break,
	continue,
	exit,
	
	print,

	eof,
}

export class Token {
	type: TT;
	value: string;
	position: number;
	line: number;
	constructor(type: TT, value: string, position: number, line: number) {
		this.type = type;
		this.value = value;
		this.position = position;
		this.line = line;
	}
	toString(): string {
		return `(${TT[this.type]} : '${this.value}')`;
	}
}

