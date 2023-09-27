
import { Token, TT, Expression, Expr } from "./type";
import { Reporter } from "./error";

export const parse = (tokens: Token[], reporter: Reporter): Expression => {

	class ParseError extends Error {
		constructor(message: string, position: number) {
			super(message)
			reporter.error(message, position);
		}
	}

	let current = 0;

	const peek = () => tokens[current];
	const previous = () => tokens[current - 1];
	const atEnd = () => peek().type == TT.eof;
	const check = (type: TT): boolean => atEnd() ? false : peek().type == type;
	const advance = () => {
		if (!atEnd()) current++;
		return previous();
	};
	const match = (...types: TT[]) => {
		for (let type of types)
			if (check(type)) {
				advance();
				return true;
			}
		return false;
	};
	const consume = (type: TT, message: string, pos = peek().position) => {
		if (check(type)) return advance();
		throw new ParseError(message, pos);
	}

	const panic = () => {
		advance();

		while (!atEnd()) {
			if (previous().type == TT.semicolon) return;

			switch (peek().type) {
				case TT.if:
				case TT.while:
				case TT.for:
				case TT.break:
				case TT.return:
				case TT.continue:
				case TT.let:
				case TT.mut:
					return;
			}

			advance();
		}
	}

	const T = {
		atom() {

		}
	}

	const R = {
		program() {
			const stmts: Expression[] = [];

			while (!atEnd()) {
				if (match(TT.semicolon)) { }
				else stmts.push(this.statement())
			}

			return new Expr.Block(stmts);
		},
		block(): Expression[] {
			const stmts: Expression[] = [];

			const rbrace = previous();

			while (!check(TT.rbrace) && !atEnd()) {
				if (match(TT.semicolon)) { }
				else stmts.push(this.statement())
			}

			consume(TT.rbrace, '??? wtf??', rbrace.position);

			return stmts;
		},
		statement(): Expression {
			try {
				if (match(TT.let))
					return this.letStmt(true);
				else if (match(TT.mut))
					return this.letStmt(false);
				return this.expressionStatement();
			} catch (e) {
				console.error(e)
				if (!(e instanceof ParseError)) {
					throw new Error(e as string);
				}
				panic();
				return new Expr.Literal_Null();
			}
		},
		expressionStatement(): Expression {
			if (match(TT.return))
				return this.returnStmt();
			// if (match('break'))
			// 	return new Expr.BreakStmt();
			return this.expression();
		},
		expression(): Expression {
			return this.conditional();
		},
		conditional(): Expression {
			if (match(TT.if))
				return this.ifStmt();
			if (match(TT.while))
				return this.whileStmt();
			return this.assignment();
		},
		assignment(): Expression {
			let expr = this.equality();

			if (match(TT.equal)) {
				const equals = previous(); // for error
				let value = this.assignment();

				if (expr instanceof Expr.Variable) {
					return new Expr.Assign(expr.name, value);
				}
				// if (expr instanceof Expr.DynamicGet) {
				// 	return new Expr.DynamicSet(expr.callee, expr.target, value);
				// }

				throw new ParseError(`something something`, peek().position) // here
			}

			return expr;
		},
		equality(): Expression {
			let expr = this.comparison();

			while (match(TT.equal_equal, TT.emark_equal)) {
				const op = previous();
				const right = this.comparison();
				expr = new Expr.Binary(expr, op, right);
			}

			return expr;
		},
		comparison(): Expression {
			let expr = this.term();

			while (match(TT.lesser, TT.lesser_equal, TT.greater_equal, TT.greater)) {
				const op = previous();
				const right = this.term();
				expr = new Expr.Binary(expr, op, right);
			}

			return expr;
		},
		term(): Expression {
			let expr = this.factor();

			while (match(TT.plus, TT.minus)) {
				const op = previous();
				const right = this.factor();
				expr = new Expr.Binary(expr, op, right);
			}

			return expr;
		},
		factor(): Expression {
			let expr = this.unary();

			while (match(TT.star, TT.slash)) {
				const op = previous();
				const right = this.unary();
				expr = new Expr.Binary(expr, op, right);
			}

			return expr;
		},
		unary(): Expression {
			if (match(TT.minus, TT.emark)) {
				const op = previous();
				const right = this.unary();
				return new Expr.Unary(op, right);
			}

			return this.primary();
		},
		call() {
			let expr = this.primary();

			while (true) {
				if (match(TT.lparen)) {
					const args = [];
					if (!check(TT.rparen)) {
						do {
							if (check(TT.comma))
								args.push(new Expr.Literal_Null());
							else
								args.push(this.expression());
						} while (match(TT.comma));
					}
					const paren = consume(TT.rparen, `expected ')' after function call`);
					expr = new Expr.Call(expr, paren, args);
				} else if (match(TT.lbracket)) {
					const key = this.expression()
					consume(TT.rbracket, `Expected ']' after collection access`);
					expr = new Expr.DynamicGet(expr, key);
				} else if (match(TT.dot)) {
					const key = consume(TT.identifier, `Expected identifier`)
					expr = new Expr.Get(expr, new Expr.Variable(key));
				} else {
					break;
				}
			}

			return expr;
		},
		primary(): Expression {
			if (match(TT.print)) {
				return new Expr.Print(this.expression());
			}

			if (match(TT.identifier)) {
				return new Expr.Variable(previous());
			}
			if (match(TT.int))
				return new Expr.Literal_Int(Number.parseInt(previous().value));
			if (match(TT.double))
				return new Expr.Literal_Double(Number.parseFloat(previous().value));
			if (match(TT.string))
				return new Expr.Literal_String(previous().value);

			if (match(TT.true, TT.false))
				return new Expr.Literal_Bool(previous().type == TT.true)
			
			if (match(TT.null))
				return new Expr.Literal_Null();

			if (match(TT.lparen)) {
				const expr = this.expression();
				consume(TT.rparen, `error!! parse: expected ')'`, peek().position);
				return expr;
			}
			if (match(TT.lbrace))
				return new Expr.Block(this.block());

			throw new ParseError(`Unexpected token: '${peek().type}' ???`, peek().position)
		},
		letStmt(isConst: boolean) {
			const declarations: Expr.LetDeclaration[] = [];
			do {
				const name = consume(TT.identifier, `Expected variable identifier`);
				let value = null;
				if (match(TT.equal)) {
					value = this.expression();
				}
				declarations.push(new Expr.LetDeclaration(name, value ?? new Expr.Literal_Null(), isConst))
			} while (match(TT.comma));
			return new Expr.Let(declarations);
		},
		whileStmt() {
			const token = previous();
			const cond = this.expression();
			const loop = this.expressionStatement();
			return new Expr.While(cond, loop, token);
		},
		ifStmt() {
			const token = previous();
			const cond = this.expression();
			const thenBranch = this.expressionStatement();
			let elseBranch = null;
			if (match(TT.else))
				elseBranch = this.expressionStatement();
			return new Expr.If(cond, thenBranch, elseBranch ?? new Expr.Literal_Null(), token);
		},
		returnStmt() {
			return new Expr.Return(match(TT.tilde) ? new Expr.Literal_Null() : this.expression());
		},
	}

	return R.program();

};

