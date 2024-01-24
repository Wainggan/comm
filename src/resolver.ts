
import { Reporter } from "./classes/error";
import { Expr, Expression, Visitor } from "./classes/expression";

import { Symbol, Type, type_defaults } from "./classes/type";


class ResolveVisitor implements Visitor<Type> {

	reporter: Reporter;
	constructor(reporter: Reporter) {
		this.reporter = reporter
	}

	evaluate(node: Expression) {
		return node.accept(this)
	}

	resolve(node: Expression, name: string): Symbol | null {
		let checker: Expression | null = node
		while (checker) {
			let table = null
			if (checker instanceof Expr.Module) {
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

	visitModule(node: Expr.Module): Type {
		
		for (let e of node.stmts)
			this.evaluate(e)

		return type_defaults.null
		
	}
	visitBlock(node: Expr.Block): Type {
		throw new Error("Method not implemented.");
	}
	visitLiteralInt(node: Expr.Literal_Int): Type {
		return type_defaults.int
	}
	visitLiteralDouble(node: Expr.Literal_Double): Type {
		throw new Error("Method not implemented.");
	}
	visitLiteralString(node: Expr.Literal_String): Type {
		return type_defaults.string
	}
	visitLiteralBool(node: Expr.Literal_Bool): Type {
		throw new Error("Method not implemented.");
	}
	visitLiteralNull(node: Expr.Literal_Null): Type {
		throw new Error("Method not implemented.");
	}
	visitVariable(node: Expr.Variable): Type {
		const symbol = this.resolve(node, node.name.value)
		if (symbol) {
			return this.evaluate(symbol.declaration.value)
		}

		this.reporter.error(`type error: variable ${node.name.value} doesn't exist in this scope`, node.name.position)
		return type_defaults.error
	}
	visitAssign(node: Expr.Assign): Type {
		throw new Error("Method not implemented.");
	}
	visitIf(node: Expr.If): Type {
		throw new Error("Method not implemented.");
	}
	visitWhile(node: Expr.While): Type {
		throw new Error("Method not implemented.");
	}
	visitBinary(node: Expr.Binary): Type {
		throw new Error("Method not implemented.");
	}
	visitUnary(node: Expr.Unary): Type {
		throw new Error("Method not implemented.");
	}
	visitLet(node: Expr.Let): Type {
		
		for (const d of node.declarations) {
			const type = this.evaluate(d.value)
			if (Type.compare(d.type, type_defaults.null)) continue
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


export const resolve = (ast: Expression, reporter: Reporter): void => {

	const r = new ResolveVisitor(reporter)
	console.log(r.evaluate(ast))
	

}
