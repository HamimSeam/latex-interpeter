import { TokenType, Token } from "../lexer/types";
import {
  ASTNodeType,
  Expression,
  Operator,
  Relation,
  Statement,
} from "./types.js";

class TokenStream {
  tokens: Token[];
  current: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }
  peek(): Token {
    return this.tokens[this.current] ?? { type: TokenType.UNKNOWN, value: "" };
  }
  consume(): Token {
    if (this.current >= this.tokens.length) {
      throw new Error("Unexpected end of input");
    }
    return (
      this.tokens[this.current++] ?? { type: TokenType.UNKNOWN, value: "" }
    );
  }
  atEnd(): boolean {
    return this.current >= this.tokens.length;
  }
}

export function parseLaTeX(tokens: Token[]) {
  const stream = new TokenStream(tokens);

  while (!stream.atEnd()) {
    const token = stream.peek();
    if (token?.type !== "COMMENT") {
      stream.consume();
    } else {
      parseStatements(stream);
    }
  }
}

function parseStatements(stream: TokenStream): Statement[] {
  const statements: Statement[] = [];
  let lhs: Expression = parseExpression(stream);

  while (!stream.atEnd()) {
    const token = stream.consume();
    if (token?.type === TokenType.EOL) {
      break;
    }

    const relation = parseRelation(stream);
    const rhs = parseExpression(stream);

    statements.push({
      type: "Statement",
      relation,
      left: lhs,
      right: rhs,
    });

    lhs = rhs;
  }

  return statements;
}

function parseExpression(stream: TokenStream): Expression {
  
}

function parseRelation(stream: TokenStream): Relation {
  const token = stream.consume();
  return {
    type: "Relation",
    token,
  };
}
