
import { Token, TT, Expression, Expr } from "./type";
import { Reporter } from "./error";

export const parse = (tokens: Token[], reporter: Reporter) => {

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
			if (previous().type == TT.comma) return;

			switch (peek().type) {
				case TT.dollar:
				case TT.qmark:
				case TT.at:
					return;
			}

			advance();
		}
	}

	const R = {
		program() {
			const stmts: Expression[] = [];

			while (!atEnd()) {
				if (match(TT.comma)) {}
				else stmts.push(this.statement())
			}

			return new Expr.Block(stmts);
		},
		block(): Expression[] {
			const stmts: Expression[] = [];

			const rbrace = previous();

			while (!check(TT.rbrace) && !atEnd()) {
				if (match(TT.comma)) {}
				else stmts.push(this.statement())
			}

			consume(TT.rbrace, '??? wtf??', rbrace.position);

			return stmts;
		},
		statement(): Expression {
			try {
				if (match(TT.dollar))
					return this.letStmt();
				return this.expressionStatement();
			} catch (e) {
				console.error(e)
				if (!(e instanceof ParseError)) {
					throw new Error(e as string);
				}
				panic();
				return new Expr.Literal_Number(0);
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
				if (match('lparen')) {
					const args = [];
					if (!check('rparen')) {
						do {
							if (check('comma'))
								args.push(new Expr.NullLiteral());
							else
								args.push(this.expression());
						} while (match('comma'));
					}
					const paren = consume('rparen', `expected ')' after function call`);
					expr = new Expr.Call(expr, paren, args);
				} else if (match('lbracket')) {
					const key = this.expression()
					consume('rbracket', `Expected ']' after collection access`);
					expr = new Expr.DynamicGet(expr, key);
				} else if (match('period')) {
					const key = consume('identifier', `Expected identifier`)
					expr = new Expr.Get(expr, new Expr.StringLiteral(key.value));
				} else {
					break;
				}
			}

			return expr;
		},
		primary(): Expression {
			if (match(TT.qmark))
				return this.ifStmt();
			if (match(TT.at))
				return this.whileStmt();

			if (match(TT.print)) {
				return new Expr.Print(this.expression());
			}

			if (match(TT.identifier)) {
				return new Expr.Variable(previous());
			}
			if (match(TT.number))
				return new Expr.Literal_Number(Number.parseFloat(previous().value));

			if (match(TT.lbrace))
				return new Expr.Block(this.block());

			throw new ParseError(`Unexpected token: '${peek().type}' ???`, peek().position)
		},
		letStmt() {
			const declarations: Expr.LetDeclaration[] = [];
			do {
				const name = consume(TT.identifier, `Expected variable identifier`);
				let value = null;
				if (match(TT.equal)) {
					value = this.expression();
				}
				declarations.push(new Expr.LetDeclaration(name, value))
			} while (match(TT.comma));
			return new Expr.Let(declarations);
		},
		whileStmt() {
			const cond = this.expression();
			const loop = this.expressionStatement();
			return new Expr.WhileStmt(cond, loop);
		},
		ifStmt() {
			const cond = this.expression();
			const thenBranch = this.expressionStatement();
			let elseBranch = null;
			if (match(TT.semicolon))
				elseBranch = this.expressionStatement();
			return new Expr.If(cond, thenBranch, elseBranch);
		},
		returnStmt() {
			return new Expr.Return(match(TT.tilde) ? new Expr.Literal_Number(0) : this.expression());
		},
	}

	return R.program();

};

