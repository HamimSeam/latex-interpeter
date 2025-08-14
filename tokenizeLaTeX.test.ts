// tokenizeLaTeX.test.ts
import { tokenizeLaTeX, TokenType } from "./lexer"; // adjust path

describe("tokenizeLaTeX", () => {
  it("recognizes commands", () => {
    expect(tokenizeLaTeX("\\triangle")).toEqual([
      { type: TokenType.COMMAND, value: "triangle" },
    ]);
  });

  it("recognizes newlines", () => {
    expect(tokenizeLaTeX("\\\\")).toEqual([
      { type: TokenType.EOL, value: "\\\\" },
    ]);
  });

  it("recognizes comments", () => {
    expect(tokenizeLaTeX("%This is a comment")).toEqual([
      { type: TokenType.COMMENT, value: "This is a comment" },
    ]);
  });

  it("recognizes end of comments", () => {
    expect(tokenizeLaTeX("%This is a comment until here\\\\A")).toEqual([
      { type: TokenType.COMMENT, value: "This is a comment until here" },
      { type: TokenType.IDENTIFIER, value: "A" },
    ]);
  });

  it("recognizes end of comments with continuation", () => {
    expect(tokenizeLaTeX("%This is a comment until here\\\\A")).toEqual([
      { type: TokenType.COMMENT, value: "This is a comment until here" },
      { type: TokenType.IDENTIFIER, value: "A" },
    ]);
  });

  it("recognizes inline comments", () => {
    expect(tokenizeLaTeX("\\triangle %This is a comment")).toEqual([
      { type: TokenType.COMMAND, value: "triangle" },
      { type: TokenType.COMMENT, value: "This is a comment" },
    ]);
  });
});
