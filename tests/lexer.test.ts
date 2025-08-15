// tokenizeLaTeX.test.ts
import { tokenizeLaTeX } from "../src/lexer"; // adjust path
import { TokenType } from "../src/lexer/types";

describe("tokenizeLaTeX", () => {
  it("recognizes operators", () => {
    expect(tokenizeLaTeX("\\triangle")).toEqual([
      { type: TokenType.OPERATOR, value: "triangle" },
    ]);
  });

  it("recognizes relations", () => {
    expect(tokenizeLaTeX("\\cong")).toEqual([
      { type: TokenType.RELATION, value: "cong" },
    ]);
  });

  it("recognizes commands", () => {
    expect(tokenizeLaTeX("\\begin")).toEqual([
      { type: TokenType.COMMAND, value: "begin" },
    ]);
  });

  it("recognizes single character operators", () => {
    expect(tokenizeLaTeX("+")).toEqual([
      { type: TokenType.OPERATOR, value: "+" },
    ]);
  });

  it("recognizes single character relations", () => {
    expect(tokenizeLaTeX("=")).toEqual([
      { type: TokenType.RELATION, value: "=" },
    ]);
  });

  it("disregards whitespace", () => {
    expect(tokenizeLaTeX("\\triangle   \\triangle")).toEqual([
      { type: TokenType.OPERATOR, value: "triangle" },
      { type: TokenType.OPERATOR, value: "triangle" },
    ]);
  });

  it("recognizes newlines", () => {
    expect(tokenizeLaTeX("\\\\")).toEqual([
      { type: TokenType.EOL, value: "\\\\" },
    ]);
  });

  it("disregards false escapes", () => {
    expect(tokenizeLaTeX("\\&")).toEqual([
      { type: TokenType.UNKNOWN, value: "&" },
    ]);
  });

  it("recognizes end of commands", () => {
    expect(tokenizeLaTeX("\\begin\\\\")).toEqual([
      { type: TokenType.COMMAND, value: "begin" },
      { type: TokenType.EOL, value: "\\\\" },
    ]);
  });

  it("recognizes identifiers", () => {
    expect(tokenizeLaTeX("abc")).toEqual([
      { type: TokenType.IDENTIFIER, value: "a" },
      { type: TokenType.IDENTIFIER, value: "b" },
      { type: TokenType.IDENTIFIER, value: "c" },
    ]);
  });

  // FIXME(?): currently disregards unknown values
  it("marks unknown characters as unknown", () => {
    expect(tokenizeLaTeX("&")).toEqual([
      { type: TokenType.UNKNOWN, value: "&" },
    ]);
  });

  it("recognizes braces and other delimeter", () => {
    expect(tokenizeLaTeX("(\\frac{a}{b})")).toEqual([
      { type: TokenType.LEFT_PAREN, value: "(" },
      { type: TokenType.COMMAND, value: "frac" },
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.IDENTIFIER, value: "a" },
      { type: TokenType.RIGHT_BRACE, value: "}" },
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.IDENTIFIER, value: "b" },
      { type: TokenType.RIGHT_BRACE, value: "}" },
      { type: TokenType.RIGHT_PAREN, value: ")" },
    ]);
  });

  it("recognizes comments", () => {
    expect(tokenizeLaTeX("%This is a comment")).toEqual([
      { type: TokenType.COMMENT, value: "This is a comment" },
    ]);
  });

  it("recognizes end of comments", () => {
    expect(tokenizeLaTeX("%This is a comment until here\\\\")).toEqual([
      { type: TokenType.COMMENT, value: "This is a comment until here" },
      { type: TokenType.EOL, value: "\\\\" },
    ]);
  });

  it("disregards unfinished comment exits", () => {
    expect(tokenizeLaTeX("%This is a comment\\")).toEqual([
      { type: TokenType.COMMENT, value: "This is a comment" },
    ]);
  });

  it("recognizes end of comments with continuation", () => {
    expect(tokenizeLaTeX("%This is a comment until here\\\\A")).toEqual([
      { type: TokenType.COMMENT, value: "This is a comment until here" },
      { type: TokenType.EOL, value: "\\\\" },
      { type: TokenType.IDENTIFIER, value: "A" },
    ]);
  });

  it("recognizes inline comments", () => {
    expect(tokenizeLaTeX("\\triangle%This is a comment")).toEqual([
      { type: TokenType.OPERATOR, value: "triangle" },
      { type: TokenType.COMMENT, value: "This is a comment" },
    ]);
  });

  it("recognizes integers", () => {
    expect(tokenizeLaTeX("1234567890")).toEqual([
      { type: TokenType.NUMBER, value: "1234567890" },
    ]);
  });

  it("recognizes floats", () => {
    expect(tokenizeLaTeX("12345.67890")).toEqual([
      { type: TokenType.NUMBER, value: "12345.67890" },
    ]);
  });

  it("recognizes scientific notation", () => {
    expect(tokenizeLaTeX("12345e67890")).toEqual([
      { type: TokenType.NUMBER, value: "12345e67890" },
    ]);
  });

  it("disregards numbers with multiple decimals", () => {
    expect(tokenizeLaTeX("12345.678.90")).toEqual([
      { type: TokenType.NUMBER, value: "12345.678" },
      { type: TokenType.UNKNOWN, value: "." },
      { type: TokenType.NUMBER, value: "90" },
    ]);
  });

  it("recognizes second instances of 'e' as identifiers", () => {
    expect(tokenizeLaTeX("12345e678e90")).toEqual([
      { type: TokenType.NUMBER, value: "12345e678" },
      { type: TokenType.IDENTIFIER, value: "e" },
      { type: TokenType.NUMBER, value: "90" },
    ]);
  });

  it("recognizes floats in scientific notation", () => {
    expect(tokenizeLaTeX("12345.678e90")).toEqual([
      { type: TokenType.NUMBER, value: "12345.678e90" },
    ]);
  });
});
