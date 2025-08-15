import { TokenType, Token, LexerState } from "./types";
import { OPERATORS, RELATIONS, DELIMITERS } from "./constants";
import {
  isAlpha,
  isNumeric,
  isWhitespace,
  getDelimiterTokenType,
  generateToken,
} from "./utils";

/**
 * Adds both the current character and the buffer as separate tokens,
 * when the current character is a single token.
 *
 * @param {Token[]} tokens - The current list of tokens from the lexer
 * @param {LexerState} state - The current state of the lexer
 * @param {string} c - The current character being processed by the lexer
 * @returns {LexerState} The next state for the lexer
 */
function handleSingleCharToken(
  tokens: Token[],
  state: LexerState,
  c: string
): LexerState {
  let newState: LexerState = LexerState.INITIAL;

  if (DELIMITERS.has(c)) {
    tokens.push(generateToken(getDelimiterTokenType(c), c));
  } else if (OPERATORS.has(c)) {
    tokens.push(generateToken(TokenType.OPERATOR, c));
  } else if (RELATIONS.has(c)) {
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

/**
 * Generates a list of tokens corresponding to a given LaTeX input.
 *
 * @param {string} text - The LaTeX to be processed by the lexer
 * @returns {Token[]} The list of tokens derived by the text input
 */
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
          if (OPERATORS.has(buffer)) {
            tokens.push(generateToken(TokenType.OPERATOR, buffer));
          } else if (RELATIONS.has(buffer)) {
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
      if (OPERATORS.has(buffer)) {
        tokens.push(generateToken(TokenType.OPERATOR, buffer));
      } else if (RELATIONS.has(buffer)) {
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
