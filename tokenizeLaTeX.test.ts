// tokenizeLaTeX.test.ts
import { tokenizeLaTeX, TokenType } from "./lexer"; // adjust path

describe("tokenizeLaTeX", () => {
  it("recognizes commands", () => {
    expect(tokenizeLaTeX("\\triangle")).toEqual([
      { type: TokenType.COMMAND, value: "triangle" }
    ]);
  });
});
