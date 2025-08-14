export enum TokenType {
  IDENTIFIER,
  NUMBER,
  COMMAND,
  OPERATOR,
  RELATION,
  LEFT_BRACE,
  RIGHT_BRACE,
  LEFT_PAREN,
  RIGHT_PAREN,
  SEPARATOR,
  COMMENT,
  EOL,
  UNKNOWN,
}

export interface Token {
  type: TokenType;
  value: string;
}

enum LexerState {
  INITIAL,
  ESCAPE,
  COMMAND,
  COMMENT,
  COMMENT_EXIT,
  INT,
  FLOAT,
  SCIENTIFIC,
}

const isAlpha = (str: string): boolean => /^[a-zA-Z]+$/.test(str);
const isNumeric = (str: string): boolean => /^[0-9]+$/.test(str);
const isWhitespace = (str: string): boolean => /^[ \t\n]+$/.test(str);

const operators: Set<string> = new Set([
  "triangle",
  "angle",
  "overline",
  "odot",
  "cdot",
  "times",
  "div",
  "+",
  "-",
]);

const relations: Set<string> = new Set([
  "cong",
  "sim",
  "gt",
  "lt",
  "geq",
  "leq",
  "in",
  "notin",
  "subset",
  "subseteq",
  "supset",
  "supseteq",
  "=",
  ">",
  "<",
]);

const delimiters: Set<string> = new Set(["(", ")", "{", "}"]);

function getDelimiterTokenType(c: string): TokenType {
  let type: TokenType = TokenType.UNKNOWN;

  switch (c) {
    case "(":
      type = TokenType.LEFT_PAREN;
      break;
    case ")":
      type = TokenType.RIGHT_PAREN;
      break;
    case "{":
      type = TokenType.LEFT_BRACE;
      break;
    case "}":
      type = TokenType.RIGHT_BRACE;
      break;
    case ",":
      type = TokenType.SEPARATOR;
      break;
  }

  return type;
}

function generateToken(type: TokenType, value: string): Token {
  return {
    type,
    value,
  };
}

function handleSingleCharToken(
  tokens: Token[],
  state: LexerState,
  c: string
): LexerState {
  let newState: LexerState = LexerState.INITIAL;

  if (delimiters.has(c)) {
    tokens.push(generateToken(getDelimiterTokenType(c), c));
  } else if (operators.has(c)) {
    tokens.push(generateToken(TokenType.OPERATOR, c));
  } else if (relations.has(c)) {
    tokens.push(generateToken(TokenType.RELATION, c));
  } else if (state !== LexerState.COMMAND && isAlpha(c)) {
    tokens.push(generateToken(TokenType.IDENTIFIER, c));
  } else if (c === "\\") {
    newState = LexerState.ESCAPE;
  } else if (c === "%") {
    newState = LexerState.COMMENT;
  } else if (!isWhitespace(c)) {
    tokens.push(generateToken(TokenType.UNKNOWN, c));
  }

  return newState;
}

export function tokenizeLaTeX(text: string): Token[] {
  const tokens: Token[] = [];
  let state: LexerState = LexerState.INITIAL;
  let buffer: string = "";

  for (const c of text) {
    switch (state) {
      case LexerState.INITIAL:
        if (c === "%") {
          state = LexerState.COMMENT;
        } else if (c === "\\") {
          state = LexerState.ESCAPE;
        } else if (isNumeric(c)) {
          state = LexerState.INT;
          buffer += c;
        } else {
          state = handleSingleCharToken(tokens, state, c);
        }
        break;

      case LexerState.COMMENT:
        if (c == "\\") state = LexerState.COMMENT_EXIT;
        else buffer += c;
        break;

      case LexerState.COMMENT_EXIT:
        if (c === "\\") {
          tokens.push(generateToken(TokenType.COMMENT, buffer));
          tokens.push(generateToken(TokenType.EOL, "\\\\"));
          state = LexerState.INITIAL;
          buffer = "";
        } else {
          buffer += c;
          state = LexerState.COMMENT;
        }
        break;

      case LexerState.ESCAPE:
        if (isAlpha(c)) {
          buffer += c;
          state = LexerState.COMMAND;
        } else if (c === "\\") {
          tokens.push(generateToken(TokenType.EOL, "\\\\"));
          state = LexerState.INITIAL;
          buffer = "";
        } else {
          tokens.push(generateToken(TokenType.UNKNOWN, c));
          state = LexerState.INITIAL;
          buffer = "";
        }
        break;

      case LexerState.COMMAND:
        if (isAlpha(c)) {
          buffer += c;
        } else {
          if (operators.has(buffer)) {
            tokens.push(generateToken(TokenType.OPERATOR, buffer));
          } else if (relations.has(buffer)) {
            tokens.push(generateToken(TokenType.RELATION, buffer));
          } else {
            tokens.push(generateToken(TokenType.COMMAND, buffer));
          }

          state = handleSingleCharToken(tokens, state, c);
          buffer = "";
        }
        break;

      case LexerState.INT:
        if (isNumeric(c)) {
          buffer += c;
        } else if (c === ".") {
          buffer += c;
          state = LexerState.FLOAT;
        } else if (c === "e") {
          buffer += c;
          state = LexerState.SCIENTIFIC;
        } else {
          tokens.push(generateToken(TokenType.NUMBER, buffer));

          state = handleSingleCharToken(tokens, state, c);
          buffer = "";
        }
        break;

      case LexerState.FLOAT:
        if (isNumeric(c)) {
          buffer += c;
        } else if (c === "e") {
          buffer += c;
          state = LexerState.SCIENTIFIC;
        } else {
          tokens.push(generateToken(TokenType.NUMBER, buffer));

          state = handleSingleCharToken(tokens, state, c);
          buffer = "";
        }
        break;

      case LexerState.SCIENTIFIC:
        if (isNumeric(c)) {
          buffer += c;
        } else {
          tokens.push(generateToken(TokenType.NUMBER, buffer));

          state = handleSingleCharToken(tokens, state, c);
          buffer = "";
        }
        break;
    }
  }

  if (buffer.length > 0) {
    const numberStates: LexerState[] = [
      LexerState.INT,
      LexerState.FLOAT,
      LexerState.SCIENTIFIC,
    ];

    const commentStates: LexerState[] = [
      LexerState.COMMENT,
      LexerState.COMMENT_EXIT,
    ];

    if (state === LexerState.COMMAND) {
      if (operators.has(buffer)) {
        tokens.push(generateToken(TokenType.OPERATOR, buffer));
      } else if (relations.has(buffer)) {
        tokens.push(generateToken(TokenType.RELATION, buffer));
      } else {
        tokens.push(generateToken(TokenType.COMMAND, buffer));
      }
    } else if (numberStates.includes(state)) {
      tokens.push(generateToken(TokenType.NUMBER, buffer));
    } else if (commentStates.includes(state)) {
      tokens.push(generateToken(TokenType.COMMENT, buffer));
    }
  }

  return tokens;
}
