
interface Visitor {
	visitLiteralNumber(): number;
	visitBinary(): number;
}

interface Expression {
	evaluate(visitor: Visitor): any;
}


enum TT {
	number = 0,
	string,
	identifier,
	plus,
	minus,

	print,

	eof,
}

class Token {
	type: TT;
	value: string;
	position: number;
	line: number;
	constructor (type: TT, value: string, position: number, line: number) {
		this.type = type;
		this.value = value;
		this.position = position;
		this.line = line;
	}
	toString(): string {
		return `(${this.type} => ${this.value})`;
	}
}


namespace Expr {

	class Literal_Number implements Expression {
		value: number;
		constructor (value: number) {
			this.value = value;
		}
		evaluate(visitor: Visitor) {
			return visitor.visitLiteralNumber();
		}
	}
	
	class Binary implements Expression {
		left: Expression;
		op: Token;
		right: Expression;
		constructor (left: Expression, op: Token, right: Expression) {
			this.left = left;
			this.op = op;
			this.right = right;
		}
		evaluate(visitor: Visitor) {
			return visitor.visitBinary();
		}
	}

}


export {
	Expr,
	TT,
	Token,
	Visitor,
	Expression
}
