
import { Reporter } from "./classes/error";
import { Expr, Expression, Visitor } from "./classes/expression";

import { Symbol, Type, type_defaults } from "./classes/type";


export function resolve(node: Expression, name: string): Symbol | null {
	let checker: Expression | null = node
	while (checker) {
		let table = null
		if (checker instanceof Expr.Module) {
			table = checker.locals				
		}
		if (checker instanceof Expr.Block) {
			table = checker.locals				
		}
		if (table) {
			const symbol = table.get(name)
			if (symbol) return symbol
		}

		checker = checker.parent
	}
	return null
}

class ResolveVisitor implements Visitor<Type> {

	reporter: Reporter;
	constructor(reporter: Reporter) {
		this.reporter = reporter
	}

	evaluate(node: Expression) {
		return node.accept(this)
	}

	expect_stack: Type[] = []
	expect(type: Type) {
		this.expect_stack.push(type)
	}
	unexpect() {
		this.expect_stack.pop()
	}
	expected() {
		return this.expect_stack.at(-1)
	}

	visitModule(node: Expr.Module): Type {
		
		for (let e of node.stmts)
			this.evaluate(e)

		return type_defaults.null
		
	}
	visitBlock(node: Expr.Block): Type {
		let output = type_defaults.null
		for (let e of node.stmts)
			output = this.evaluate(e)

		return output
	}
	visitLiteralInt(node: Expr.Literal_Int): Type {
		const expected = this.expected()
		if (expected) {
			if (Type.compare(expected, type_defaults.i16)
				|| Type.compare(expected, type_defaults.i32)) {
				return expected
			}
		}
		return type_defaults.i32
	}
	visitLiteralFloat(node: Expr.Literal_Float): Type {
		return type_defaults.double
	}
	visitLiteralString(node: Expr.Literal_String): Type {
		return type_defaults.string
	}
	visitLiteralBool(node: Expr.Literal_Bool): Type {
		return type_defaults.bool
	}
	visitLiteralNull(node: Expr.Literal_Null): Type {
		return type_defaults.null
	}
	visitVariable(node: Expr.Variable): Type {
		const symbol = resolve(node, node.name.value)
		if (symbol) {
			return symbol.declaration.type
		}

		this.reporter.error(`type error: variable ${node.name.value} doesn't exist in this scope`, node.name.position)
		return type_defaults.error
	}
	visitAssign(node: Expr.Assign): Type {
		const left = this.evaluate(node.assign)
		const right = this.evaluate(node.value)
		if (!Type.compare(left, right)) {
			this.reporter.error(`type error: attempted to assign value of type <${right.toString()}> to variable of type <${left.toString()}>`, node.op.position)
			return type_defaults.error
		}
		return left
	}
	visitIf(node: Expr.If): Type {
		const cond = this.evaluate(node.condition)

		if (!Type.compare(cond, type_defaults.bool)) {
			this.reporter.error(`type error: if statement requires boolean as condition, got <${cond.toString()}> instead`, node.token.position)
		}

		console.log(this.expect_stack)

		const thenBranch = this.evaluate(node.thenBranch)

		this.expect(thenBranch)
		const elseBranch = this.evaluate(node.elseBranch)
		this.unexpect()

		const expected = this.expected()
		console.log(expected)
		if (expected != undefined && !Type.compare(thenBranch, elseBranch)) {
			this.reporter.error(`type error: if statement used as expression, but both branches (<${thenBranch.toString()}> and <${elseBranch.toString()}>) aren't the same type`, node.token.position)
			return type_defaults.error
		}

		return thenBranch
	}
	visitWhile(node: Expr.While): Type {
		throw new Error("Method not implemented.");
	}
	visitBinary(node: Expr.Binary): Type {

		const left = this.evaluate(node.left)
		this.expect(left)
		const right = this.evaluate(node.right)
		this.unexpect()

		// @todo: op level type checking ('-' incompatible with <string>)
		if (!Type.compare(left, right)) {
			this.reporter.error(`type error: type <${left.toString()}> incompatible with <${right.toString()}> with '${node.op.value}' operation`, node.op.position)
			return type_defaults.error
		}

		return left

	}
	visitUnary(node: Expr.Unary): Type {
		const right = this.evaluate(node.right)
		return right
	}
	visitLet(node: Expr.Let): Type {
		
		for (const d of node.declarations) {
			const isnull = Type.compare(d.type, type_defaults.null)

			this.expect(d.type)
			const type = this.evaluate(d.value)
			this.unexpect()

			if (isnull) {
				d.type = type
			}

			if (!Type.compare(d.type, type)) {
				this.reporter.error(`type error: type <${d.type.toString()}> expected, got <${type.toString()}> instead`, d.name.position) // @todo: fill
			}
		}

		return type_defaults.null

	}
	visitReturn(node: Expr.Return): Type {
		throw new Error("Method not implemented.");
	}
	visitPrint(node: Expr.Print): Type {
		throw new Error("Method not implemented.");
	}
	
}


export const check = (ast: Expression, reporter: Reporter): void => {

	const r = new ResolveVisitor(reporter)
	console.log(r.evaluate(ast))
	

}
