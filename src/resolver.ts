
import { Peek } from "bun";
import { Reporter } from "./error";
import { Expr, Expression, Visitor, Value } from "./type";
import exp from "constants";


enum Atoms {
	none,
	int,
	float,
	bool,
	string,
	null,
}


class Type implements Type {
	types: Atoms[];
	constructor(...types: Atoms[]) {
		this.types = types;
	}

	prune() {

		for (let i = 0; i < this.types.length; i++) {
			const t1 = this.types[i];

			for (let j = i; j < this.types.length; j++) {
				if (i == j) continue;

				const t2 = this.types[j];

				if (t1 == t2) {
					this.types.splice(j, 1);
					j--;
				}

			}
		}

	}

	equal(other: Type): boolean {
		this.prune();
		other.prune();
		
		if (this.types.length != other.types.length) return false;

		for (let i = 0; i < this.types.length; i++) {
			if (this.types[i] != other.types[i]) return false;
		}

		return true;
	}

}

const TypeDefs = {
	int: new Type(Atoms.int),
	float: new Type(Atoms.float),
	bool: new Type(Atoms.bool),
	string: new Type(Atoms.string),
	null: new Type(Atoms.null),
} as const;


type Result = Type;

class Environment {
	encloses: Environment | null;
	vars: Map<string, Type>;
	constructor(encloses: Environment | null) {
		this.encloses = encloses;
		this.vars = new Map<string, Type>();
	}
	has(name: string): boolean {
		if (this.vars.has(name)) return true;
		if (this.encloses != null) return this.encloses.has(name);
		return false;
	}
	add(name: string, type: Type) {
		this.vars.set(name, type);
	}
	get(name: string): Type {
		if (this.vars.has(name)) return this.vars.get(name)!;
		if (this.encloses != null) return this.encloses.get(name);
		throw new Error(`Oops`);
	}
}

class ResolveVisitor implements Visitor<Result> {
	reporter: Reporter;
	expected: Type[] = [];
	environment: Environment;

	constructor(reporter: Reporter) {
		this.reporter = reporter;
		this.environment = new Environment(null);
	}

	push() {
		this.environment = new Environment(this.environment);
	}
	pop() {
		this.environment = this.environment.encloses!;
	}

	expected_push(type: Type) {
		this.expected.push(type);
	}
	expected_pop(): Type {
		return this.expected.pop()!;
	}
	expected_get(): Type {
		return this.expected[this.expected.length - 1];
	}

	evaluate(node: Expression) {
		return node.accept(this);
	}
	
	visitBlock(node: Expr.Block): Result {

		let type = new Type(Atoms.null);

		this.push()
		
		for (var i = 0; i < node.stmts.length; i++) {
			type = this.evaluate(node.stmts[i]);
		}

		console.log(this.environment.vars)

		this.pop()

		return type;

	}
	visitLiteralInt(node: Expr.Literal_Int): Result {
		return TypeDefs.int;
	}
	visitLiteralDouble(node: Expr.Literal_Double): Result {
		return TypeDefs.float;
	}
	visitLiteralString(node: Expr.Literal_String): Result {
		return TypeDefs.string;
	}
	visitLiteralBool(node: Expr.Literal_Bool): Result {
		return TypeDefs.bool;
	}
	visitLiteralNull(node: Expr.Literal_Null): Result {
		return TypeDefs.null;
	}
	visitVariable(node: Expr.Variable): Result {
		if (!this.environment.has(node.name.value)) {
			this.reporter.error(`error!! resolve: variable '${node.name.value}' does not exist`, node.name.position);
			return TypeDefs.null;
		}
		return this.environment.get(node.name.value);
	}
	visitAssign(node: Expr.Assign): Result {
		throw new Error("Method not implemented.");
	}
	visitIf(node: Expr.If): Result {
		const condition = this.evaluate(node.condition);

		if (!condition.equal(TypeDefs.bool)) {
			this.reporter.error("error!! resolve: condition must be bool", node.token.position);
		}

		const thenBranch = this.evaluate(node.thenBranch);
		const elseBranch = this.evaluate(node.elseBranch);

		const type = new Type(...thenBranch.types, ...elseBranch.types)
		type.prune();

		return type;
	}
	visitWhile(node: Expr.While): Result {
		const condition = this.evaluate(node.condition);

		if (!condition.equal(TypeDefs.bool)) {
			this.reporter.error("error!! resolve: condition must be bool", node.token.position);
		}

		const branch = this.evaluate(node.branch);

		return branch;
	}
	visitBinary(node: Expr.Binary): Result {
		const left = this.evaluate(node.left);
		const right = this.evaluate(node.right);

		if (!left.equal(right)) {
			this.reporter.error("error!! resolve: incompatible types in binary operation", node.op.position);
		}

		return left;
	}
	visitUnary(node: Expr.Unary): Result {
		throw new Error("Method not implemented.");
	}
	visitLet(node: Expr.Let): Result {
		for (let i = 0; i < node.declarations.length; i++) {
			const dec = node.declarations[i];
			const value = this.evaluate(dec.value);
			this.environment.add(dec.name.value, value);
		}
		return TypeDefs.null;
	}
	visitReturn(node: Expr.Return): Result {
		throw new Error("Method not implemented.");
	}
	visitPrint(node: Expr.Print): Result {
		throw new Error("Method not implemented.");
	}
	
}


export const resolve = (ast: Expression, reporter: Reporter): void => {

	const r = new ResolveVisitor(reporter)
	console.log(r.evaluate(ast).types)
	

}
