import { Expr, Expression, Visitor } from "./classes/expression";

import { Table } from "./classes/type";


class BindVisitor implements Visitor<boolean> {

	locals: Table[] = [];

	evaluate(node: Expression) {
		return node.accept(this);
	}

	parentify(node: Expression, children: Expression[]) {
		for (const c of children)
			c.parent = node
	}

	declare(name: string, node: Expr.Declaration) {
		if (this.locals.length == 0)
			throw new Error('e');
		const local = this.locals.at(-1)!;
		if (local.has(name))
			throw new Error(`${name} already exists`)
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

	visitModule(node: Expr.Module): boolean {
		this.parentify(node, node.stmts)

		this.scope_push(node.locals);
		for (var i = 0; i < node.stmts.length; i++) {
			this.evaluate(node.stmts[i]);
		}
		console.log(this.locals)
		this.scope_pop();
		
		return true;
	}

	visitBlock(node: Expr.Block): boolean {
		throw new Error("Method not implemented.");
	}
	
	visitLiteralInt(node: Expr.Literal_Int): boolean {
		return true;
	}
	visitLiteralDouble(node: Expr.Literal_Double): boolean {
		return true
	}
	visitLiteralString(node: Expr.Literal_String): boolean {
		return true
	}
	visitLiteralBool(node: Expr.Literal_Bool): boolean {
		return true
	}
	visitLiteralNull(node: Expr.Literal_Null): boolean {
		return true
	}
	
	visitVariable(node: Expr.Variable): boolean {
		return true;
	}
	visitAssign(node: Expr.Assign): boolean {
		throw new Error("Method not implemented.");
	}
	
	visitIf(node: Expr.If): boolean {
		throw new Error("Method not implemented.");
	}
	visitWhile(node: Expr.While): boolean {
		throw new Error("Method not implemented.");
	}
	
	visitBinary(node: Expr.Binary): boolean {
		throw new Error("Method not implemented.");
	}
	visitUnary(node: Expr.Unary): boolean {
		throw new Error("Method not implemented.");
	}
	
	visitLet(node: Expr.Let): boolean {
		for (const d of node.declarations) {
			this.parentify(node, [d.value])

			this.evaluate(d.value)
			this.declare(d.name.value, d);
			
		}
		return true;
	}
	visitReturn(node: Expr.Return): boolean {
		throw new Error("Method not implemented.");
	}
	
	visitPrint(node: Expr.Print): boolean {
		throw new Error("Method not implemented.");
	}

}


export const bind = (ast: Expression): void => {

	const r = new BindVisitor()
	console.log(r.evaluate(ast))
	
}

