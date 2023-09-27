
export type Value = number | string;

export class Type {
	static signature: Symbol = Symbol();
	supports_add: boolean = false;
}



export enum TT {
	int = 0,
	double,
	string,
	true,
	false,
	null,

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


export interface Visitor<V> {
	visitBlock(node: Expr.Block): V;

	visitLiteralInt(node: Expr.Literal_Int): V;
	visitLiteralDouble(node: Expr.Literal_Double): V;
	visitLiteralString(node: Expr.Literal_String): V;
	visitLiteralBool(node: Expr.Literal_Bool): V;
	visitLiteralNull(node: Expr.Literal_Null): V;

	visitVariable(node: Expr.Variable): V;
	visitAssign(node: Expr.Assign): V;

	visitIf(node: Expr.If): V;
	visitWhile(node: Expr.While): V;

	visitBinary(node: Expr.Binary): V;
	visitUnary(node: Expr.Unary): V;

	visitLet(node: Expr.Let): V;
	visitReturn(node: Expr.Return): V;

	visitPrint(node: Expr.Print): V;
}

export interface Expression {
	accept<V>(visitor: Visitor<V>): V;
}

export namespace Expr {

	export class Block implements Expression {
		stmts: Expression[];
		constructor(stmts: Expression[]) {
			this.stmts = stmts;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitBlock(this);
		}
	}

	export class Literal_Int implements Expression {
		value: number;
		constructor(value: number) {
			this.value = value;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralInt(this);
		}
	}
	export class Literal_Double implements Expression {
		value: number;
		constructor(value: number) {
			this.value = value;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralDouble(this);
		}
	}
	export class Literal_String implements Expression {
		value: string;
		constructor(value: string) {
			this.value = value;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralString(this);
		}
	}
	export class Literal_Bool implements Expression {
		value: boolean;
		constructor(value: boolean) {
			this.value = value;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralBool(this);
		}
	}
	export class Literal_Null implements Expression {
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralNull(this);
		}
	}

	export class Variable implements Expression {
		name: Token;
		constructor(name: Token) {
			this.name = name;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitVariable(this);
		}
	}
	export class Assign implements Expression {
		name: Token;
		value: Expression;
		constructor(name: Token, value: Expression) {
			this.name = name;
			this.value = value;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitAssign(this);
		}
	}

	export class If implements Expression {
		condition: Expression;
		thenBranch: Expression;
		elseBranch: Expression;
		token: Token;
		constructor(
			condition: Expression,
			thenBranch: Expression,
			elseBranch: Expression,
			token: Token,
		) {
			this.condition = condition;
			this.thenBranch = thenBranch;
			this.elseBranch = elseBranch;
			this.token = token;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitIf(this);
		}
	}
	export class While implements Expression {
		condition: Expression;
		branch: Expression;
		constructor(
			condition: Expression,
			branch: Expression
		) {
			this.condition = condition;
			this.branch = branch;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitWhile(this);
		}
	}

	export class Unary implements Expression {
		op: Token;
		right: Expression;
		constructor(op: Token, right: Expression) {
			this.op = op;
			this.right = right;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitUnary(this);
		}
	}
	export class Binary implements Expression {
		left: Expression;
		op: Token;
		right: Expression;
		constructor(left: Expression, op: Token, right: Expression) {
			this.left = left;
			this.op = op;
			this.right = right;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitBinary(this);
		}
	}

	export class Let implements Expression {
		declarations: LetDeclaration[];
		constructor(decs: LetDeclaration[]) {
			this.declarations = decs;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLet(this);
		}
	}
	export class LetDeclaration {
		name: Token;
		value: Expression;
		isConst: boolean;
		constructor(name: Token, value: Expression, isConst: boolean) {
			this.name = name;
			this.value = value;
			this.isConst = isConst;
		}
	}

	export class Return implements Expression {
		value: Expression;
		constructor (value: Expression) {
			this.value = value;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitReturn(this);
		}
	}

	export class Print implements Expression {
		value: Expression;
		constructor (value: Expression) {
			this.value = value;
		}
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitPrint(this);
		}
	}

}

