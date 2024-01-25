
import { Token } from './token';

import { Table } from './type';

import { Type } from './type';


export interface Visitor<V> {
	visitModule(node: Expr.Module): V;
	visitBlock(node: Expr.Block): V;

	visitLiteralInt(node: Expr.Literal_Int): V;
	visitLiteralFloat(node: Expr.Literal_Float): V;
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
	parent: Expression | null;
	accept<V>(visitor: Visitor<V>): V;
}

export namespace Expr {

	export class Module implements Expression {
		stmts: Expression[];
		locals: Table = new Map();
		constructor(stmts: Expression[]) {
			this.stmts = stmts;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitModule(this);
		}
	}

	export class Block implements Expression {
		stmts: Expression[];
		locals: Table = new Map();
		constructor(stmts: Expression[]) {
			this.stmts = stmts;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitBlock(this);
		}
	}

	export class Literal_Int implements Expression {
		value: number;
		constructor(value: number) {
			this.value = value;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralInt(this);
		}
	}
	export class Literal_Float implements Expression {
		value: number;
		constructor(value: number) {
			this.value = value;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralFloat(this);
		}
	}
	export class Literal_String implements Expression {
		value: string;
		constructor(value: string) {
			this.value = value;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralString(this);
		}
	}
	export class Literal_Bool implements Expression {
		value: boolean;
		constructor(value: boolean) {
			this.value = value;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralBool(this);
		}
	}
	export class Literal_Null implements Expression {
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLiteralNull(this);
		}
	}

	export class Variable implements Expression {
		name: Token;
		constructor(name: Token) {
			this.name = name;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitVariable(this);
		}
	}
	export class Assign implements Expression {
		assign: Expression;
		value: Expression;
		op: Token;
		constructor(assign: Expression, value: Expression, op: Token) {
			this.assign = assign;
			this.value = value;
			this.op = op;
		}
		parent: Expression | null = null;
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
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitIf(this);
		}
	}
	export class While implements Expression {
		condition: Expression;
		branch: Expression;
		token: Token;
		constructor(
			condition: Expression,
			branch: Expression,
			token: Token,
		) {
			this.condition = condition;
			this.branch = branch;
			this.token = token;
		}
		parent: Expression | null = null;
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
		parent: Expression | null = null;
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
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitBinary(this);
		}
	}

	export class Let implements Expression {
		declarations: Declaration[];
		constructor(decs: Declaration[]) {
			this.declarations = decs;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitLet(this);
		}
	}
	export class Declaration {
		name: Token;
		value: Expression;
		type: Type;
		isConst: boolean;
		constructor(name: Token, value: Expression, type: Type, isConst: boolean) {
			this.name = name;
			this.value = value;
			this.type = type;
			this.isConst = isConst;
		}
	}

	export class Return implements Expression {
		value: Expression;
		constructor (value: Expression) {
			this.value = value;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitReturn(this);
		}
	}

	export class Print implements Expression {
		value: Expression;
		constructor (value: Expression) {
			this.value = value;
		}
		parent: Expression | null = null;
		accept<V>(visitor: Visitor<V>): V {
			return visitor.visitPrint(this);
		}
	}

}

