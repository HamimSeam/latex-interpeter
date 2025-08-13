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
  EOS,
}

export interface Token {
  type: TokenType;
  value: string;
}

enum LexerState {
  INITIAL,
  ESCAPE,
  COMMAND,
}

const isAlpha = (str: string): boolean => /^[a-zA-Z]+$/.test(str);
const isWhitespace = (str: string): boolean => /^[ \t\n]+$/.test(str);

export function tokenizeLaTeX(text: string) {
  const tokens: Token[] = [];
  let state = LexerState.INITIAL;
  let buffer = "";

  for (const c of text) {
    switch (state) {
      case LexerState.INITIAL:
        if (c === "\\") state = LexerState.ESCAPE;
        break;

      case LexerState.ESCAPE:
        if (c === "\\") {
          tokens.push({
            type: TokenType.EOS,
            value: "\\\\",
          });
        } else if (isAlpha(c)) {
          state = LexerState.COMMAND;
          buffer = c;
        }
        break;

      case LexerState.COMMAND:
        if (isAlpha(c)) buffer += c;
        else if (isWhitespace(c)) {
          state = LexerState.INITIAL;
          tokens.push({
            type: TokenType.COMMAND,
            value: buffer,
          });
        }
        break;
    }
  }

  return tokens;
}
