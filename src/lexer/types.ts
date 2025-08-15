export enum TokenType {
  // Lexical categories
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  COMMAND = "COMMAND",
  OPERATOR = "OPERATOR",
  RELATION = "RELATION",

  // Structural tokens
  LEFT_BRACE = "LEFT_BRACE",
  RIGHT_BRACE = "RIGHT_BRACE",
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  SEPARATOR = "SEPARATOR",

  // Special tokens
  COMMENT = "COMMENT",
  EOL = "END_OF_LINE",
  UNKNOWN = "UNKNOWN",
}

export interface Token {
  type: TokenType;
  value: string;
}

export enum LexerState {
  INITIAL,
  ESCAPE,
  COMMAND,
  COMMENT,
  COMMENT_EXIT,
  INT,
  FLOAT,
  SCIENTIFIC,
}
