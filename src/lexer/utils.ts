import { TokenType, Token } from "./types";

export const isAlpha = (str: string): boolean => /^[a-zA-Z]+$/.test(str);
export const isNumeric = (str: string): boolean => /^[0-9]+$/.test(str);
export const isWhitespace = (str: string): boolean => /^[ \t\n]+$/.test(str);

export function getDelimiterTokenType(c: string): TokenType {
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

export function generateToken(type: TokenType, value: string): Token {
  return {
    type,
    value,
  };
}
