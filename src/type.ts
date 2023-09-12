
export type Value = number | string;

export class Type {
	static signature: Symbol = Symbol();
	supports_add: boolean = false;
}

export interface Expression {
	accept(visitor: Visitor): Value;
}

export enum TT {
	int = 0,
	double,
	string,

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
		return `(${this.type} => ${this.value})`;
	}
}


export interface Visitor {
	visitBlock(node: Expr.Block): Value;

	visitLiteralInt(node: Expr.Literal_Int): Value;
	visitLiteralDouble(node: Expr.Literal_Double): Value;
	visitLiteralString(node: Expr.Literal_String): Value;
	visitLiteralNull(node: Expr.Literal_Null): Value;

	visitVariable(node: Expr.Variable): Value;
	visitAssign(node: Expr.Assign): Value;

	visitIf(node: Expr.If): Value;
	visitWhile(node: Expr.While): Value;

	visitBinary(node: Expr.Binary): Value;
	visitUnary(node: Expr.Unary): Value;

	visitLet(node: Expr.Let): Value;
	visitReturn(node: Expr.Return): Value;

	visitPrint(node: Expr.Print): Value;
}

export namespace Expr {

	export class Block implements Expression {
		stmts: Expression[];
		constructor(stmts: Expression[]) {
			this.stmts = stmts;
		}
		accept(visitor: Visitor): Value {
			return visitor.visitBlock(this);
		}
	}

	export class Literal_Int implements Expression {
		value: Value;
		constructor(value: Value) {
			this.value = value;
		}
		accept(visitor: Visitor): Value {
			return visitor.visitLiteralInt(this);
		}
	}
	export class Literal_Double implements Expression {
		value: Value;
		constructor(value: Value) {
			this.value = value;
		}
		accept(visitor: Visitor): Value {
			return visitor.visitLiteralDouble(this);
		}
	}
	export class Literal_String implements Expression {
		value: Value;
		constructor(value: Value) {
			this.value = value;
		}
		accept(visitor: Visitor): Value {
			return visitor.visitLiteralString(this);
		}
	}
	export class Literal_Null implements Expression {
		accept(visitor: Visitor): Value {
			return visitor.visitLiteralNull(this);
		}
	}

	export class Variable implements Expression {
		name: Token;
		constructor(name: Token) {
			this.name = name;
		}
		accept(visitor: Visitor): Value {
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
		accept(visitor: Visitor): Value {
			return visitor.visitAssign(this);
		}
	}

	export class If implements Expression {
		condition: Expression;
		thenBranch: Expression;
		elseBranch: Expression | null;
		constructor(
			condition: Expression,
			thenBranch: Expression,
			elseBranch: Expression | null
		) {
			this.condition = condition;
			this.thenBranch = thenBranch;
			this.elseBranch = elseBranch;
		}
		accept(visitor: Visitor): Value {
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
		accept(visitor: Visitor): Value {
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
		accept(visitor: Visitor): Value {
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
		accept(visitor: Visitor): Value {
			return visitor.visitBinary(this);
		}
	}

	export class Let implements Expression {
		declarations: LetDeclaration[];
		constructor(decs: LetDeclaration[]) {
			this.declarations = decs;
		}
		accept(visitor: Visitor): Value {
			return visitor.visitLet(this);
		}
	}
	export class LetDeclaration {
		name: Token;
		value: Expression | null;
		isConst: boolean;
		constructor(name: Token, value: Expression | null, isConst: boolean) {
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
		accept(visitor: Visitor): Value {
			return visitor.visitReturn(this);
		}
	}

	export class Print implements Expression {
		value: Expression;
		constructor (value: Expression) {
			this.value = value;
		}
		accept(visitor: Visitor): Value {
			return visitor.visitPrint(this);
		}
	}

}

