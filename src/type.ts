
export interface Expression {
	evaluate(visitor: Visitor): number;
}


export enum TT {
	number = 0,
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

	emark_equal,

	lparen,
	rparen,
	lbrace,
	rbrace,
	lbracket,
	rbracket,

	comma,
	dot,
	tilde,
	dollar,
	qmark,
	emark,
	colon,
	semicolon,
	at,
	return,

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
	visitBlock(node: Expr.Block): number;

	visitLiteralNumber(node: Expr.Literal_Number): number;
	visitLiteralString(node: Expr.Literal_String): number;

	visitVariable(node: Expr.Variable): number;
	visitAssign(node: Expr.Assign): number;

	visitIf(node: Expr.If): number;
	visitWhile(node: Expr.While): number;

	visitBinary(node: Expr.Binary): number;
	visitUnary(node: Expr.Unary): number;

	visitLet(node: Expr.Let): number;
	visitReturn(node: Expr.Return): number;

	visitPrint(node: Expr.Print): number;
}

export namespace Expr {

	export class Block implements Expression {
		stmts: Expression[];
		constructor(stmts: Expression[]) {
			this.stmts = stmts;
		}
		evaluate(visitor: Visitor): number {
			return visitor.visitBlock(this);
		}
	}

	export class Literal_Number implements Expression {
		value: number;
		constructor(value: number) {
			this.value = value;
		}
		evaluate(visitor: Visitor): number {
			return visitor.visitLiteralNumber(this);
		}
	}
	export class Literal_String implements Expression {
		value: string;
		constructor(value: string) {
			this.value = value;
		}
		evaluate(visitor: Visitor): number {
			return visitor.visitLiteralString(this);
		}
	}

	export class Variable implements Expression {
		name: Token;
		constructor(name: Token) {
			this.name = name;
		}
		evaluate(visitor: Visitor): number {
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
		evaluate(visitor: Visitor): number {
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
		evaluate(visitor: Visitor): number {
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
		evaluate(visitor: Visitor): number {
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
		evaluate(visitor: Visitor): number {
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
		evaluate(visitor: Visitor): number {
			return visitor.visitBinary(this);
		}
	}

	export class Let implements Expression {
		declarations: LetDeclaration[];
		constructor(decs: LetDeclaration[]) {
			this.declarations = decs;
		}
		evaluate(visitor: Visitor): number {
			return visitor.visitLet(this);
		}
	}
	export class LetDeclaration {
		name: Token;
		value: Expression | null;
		constructor(name: Token, value: Expression | null) {
			this.name = name;
			this.value = value;
		}
	}

	export class Return implements Expression {
		value: Expression;
		constructor (value: Expression) {
			this.value = value;
		}
		evaluate(visitor: Visitor): number {
			return visitor.visitReturn(this);
		}
	}

	export class Print implements Expression {
		value: Expression;
		constructor (value: Expression) {
			this.value = value;
		}
		evaluate(visitor: Visitor): number {
			return visitor.visitPrint(this);
		}
	}

}

