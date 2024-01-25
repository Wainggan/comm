
import { Reporter } from "./classes/error";
import { Expr, Expression, Visitor } from "./classes/expression";

import { Table, Symbol } from "./classes/type";

import { resolve } from "./resolver";


class BindVisitor implements Visitor<void> {

	locals: Table[] = [];
	reporter: Reporter

	constructor(reporter: Reporter) {
		this.reporter = reporter
	}

	evaluate(node: Expression) {
		return node.accept(this);
	}

	parentify(node: Expression, children: Expression[]) {
		for (const c of children)
			c.parent = node
	}

	declare(name: string, node: Expr.Declaration) {
		if (this.locals.length == 0)
			this.reporter.error(`static error: unknown`, node.name.position)
		const local = this.locals.at(-1)!;
		if (local.has(name))
			this.reporter.error(`static error: variable ${name} already exists`, node.name.position)
		local.set(name, {
			declaration: node
		});
	}

	scope_push(local: Table) {
		this.locals.push(local);
	}
	scope_pop() {
		this.locals.pop();
	}

	visitModule(node: Expr.Module) {
		this.parentify(node, node.stmts)

		this.scope_push(node.locals);
		for (var i = 0; i < node.stmts.length; i++) {
			this.evaluate(node.stmts[i]);
		}
		this.scope_pop();
	}

	visitBlock(node: Expr.Block) {
		this.parentify(node, node.stmts)

		this.scope_push(node.locals);
		for (var i = 0; i < node.stmts.length; i++) {
			this.evaluate(node.stmts[i]);
		}
		this.scope_pop();
	}
	
	visitLiteralInt(node: Expr.Literal_Int) {}
	visitLiteralFloat(node: Expr.Literal_Float) {}
	visitLiteralString(node: Expr.Literal_String) {}
	visitLiteralBool(node: Expr.Literal_Bool) {}
	visitLiteralNull(node: Expr.Literal_Null) {}
	
	visitVariable(node: Expr.Variable) {
		if (!resolve(node, node.name.value)) {
			this.reporter.error(`static error: variable "${node.name.value}" used before declaration`, node.name.position)
		}
	}
	visitAssign(node: Expr.Assign) {
		this.parentify(node, [node.assign, node.value])

		this.evaluate(node.value)
	}
	
	visitIf(node: Expr.If) {
		this.parentify(node, [node.condition, node.thenBranch, node.elseBranch])

		this.evaluate(node.condition)
		this.evaluate(node.thenBranch)
		this.evaluate(node.elseBranch)
	}
	visitWhile(node: Expr.While) {
		throw new Error("Method not implemented.");
	}
	
	visitBinary(node: Expr.Binary) {
		this.parentify(node, [node.left, node.right])

		this.evaluate(node.left)
		this.evaluate(node.right)
	}
	visitUnary(node: Expr.Unary) {
		this.parentify(node, [node.right])

		this.evaluate(node.right)
	}
	
	visitLet(node: Expr.Let) {
		for (const d of node.declarations) {
			this.parentify(node, [d.value])

			this.evaluate(d.value)
			this.declare(d.name.value, d);
			
		}
	}
	visitReturn(node: Expr.Return) {
		throw new Error("Method not implemented.");
	}
	
	visitPrint(node: Expr.Print) {
		throw new Error("Method not implemented.");
	}

}


export const bind = (ast: Expression, reporter: Reporter): void => {

	new BindVisitor(reporter).evaluate(ast)
	
}

