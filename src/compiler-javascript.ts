
import { Expr, Expression, Visitor } from "./classes/expression";

export class Compiler_JS implements Visitor<string> {
	
	evaluate(node: Expression) {
		return node.accept(this)
	}
	
	visitModule(node: Expr.Module): string {
		
		let str = ""
		for (const e of node.stmts) {
			str += this.evaluate(e) + ';\n'
		}
		return str

	}
	visitBlock(node: Expr.Block): string {
		throw new Error("Method not implemented.");
	}
	visitLiteralInt(node: Expr.Literal_Int): string {
		return node.value.toString()
	}
	visitLiteralDouble(node: Expr.Literal_Double): string {
		return node.value.toString()
	}
	visitLiteralString(node: Expr.Literal_String): string {
		return node.value
	}
	visitLiteralBool(node: Expr.Literal_Bool): string {
		return node.value ? 'true' : 'false'
	}
	visitLiteralNull(node: Expr.Literal_Null): string {
		return 'null'
	}
	visitVariable(node: Expr.Variable): string {
		return node.name.value
	}
	visitAssign(node: Expr.Assign): string {
		const left = this.evaluate(node.assign)
		const right = this.evaluate(node.value)

		return `${left} = ${right}`
	}
	visitIf(node: Expr.If): string {
		throw new Error("Method not implemented.");
	}
	visitWhile(node: Expr.While): string {
		throw new Error("Method not implemented.");
	}
	visitBinary(node: Expr.Binary): string {
		const left = this.evaluate(node.left)
		const right = this.evaluate(node.right)

		return `${left} ${node.op.value} ${right}`
	}
	visitUnary(node: Expr.Unary): string {
		throw new Error("Method not implemented.");
	}
	visitLet(node: Expr.Let): string {
		
		let str = ""

		for (const d of node.declarations) {
			str += d.isConst ? 'const' : 'let'
			str += ` ${d.name.value} = ${this.evaluate(d.value)};`
			str += '\n'
		}

		return str

	}
	visitReturn(node: Expr.Return): string {
		throw new Error("Method not implemented.");
	}
	visitPrint(node: Expr.Print): string {
		throw new Error("Method not implemented.");
	}
	
}
