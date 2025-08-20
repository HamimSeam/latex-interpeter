import { Token } from "../lexer/types";

// -----------------
// AST Node Type
// -----------------
export type ASTNodeType =
  // Expressions
  | "NumberLiteral"
  | "Identifier"
  | "UnaryExpression"
  | "BinaryExpression"
  | "CallExpression"

  // Statements / constraints
  | "Statement"

  // Geometric constructions
  | "Construction"

  // Operators and relations (syntactic nodes)
  | "Operator"
  | "Relation"

  // Comments
  | "Comment";

// -----------------
// Base AST Node
// -----------------
interface BaseNode {
  type: ASTNodeType;
  token?: Token;
}

// -----------------
// Expressions
// -----------------
export interface NumberLiteral extends BaseNode {
  type: "NumberLiteral";
  token: Token; // NUMBER token
  value: number; // parsed numeric value
}

export interface Identifier extends BaseNode {
  type: "Identifier";
  token: Token; // IDENTIFIER token
  name: string; // the identifier string
}

export interface UnaryExpression extends BaseNode {
  type: "UnaryExpression";
  operator: Operator;
  operand: Expression;
}

export interface BinaryExpression extends BaseNode {
  type: "BinaryExpression";
  left: Expression;
  right: Expression;
  operator: Operator;
}

export interface CallExpression extends BaseNode {
  type: "CallExpression";
  callee: Identifier;
  args: Expression[];
}

// -----------------
// Operators & Relations
// -----------------
export type OperatorType = "Add" | "Subtract" | "Multiply" | "Divide"; // expand as needed

export interface Operator extends BaseNode {
  type: "Operator";
  token: Token; // OPERATOR token
  operatorType: OperatorType;
}

export type RelationType =
  | "Equals"
  | "Congruent"
  | "Parallel"
  | "Perpendicular"; // expand as needed

export interface Relation extends BaseNode {
  type: "Relation";
  token: Token; // RELATION token
  relationType: RelationType;
}

// -----------------
// Statements / Constructions
// -----------------
export interface Statement extends BaseNode {
  type: "Statement";
  relation: Relation;
  left: Expression;
  right: Expression;
}

export type ShapeType =
  | "Point"
  | "Segment"
  | "Line"
  | "Triangle"
  | "Polygon"
  | "Circle";

export interface Construction extends BaseNode {
  type: "Construction";
  shape: ShapeType;
  points: Identifier[];
}

// -----------------
// Comment
// -----------------
export interface Comment extends BaseNode {
  type: "Comment";
  token: Token; // COMMENT token
  text: string;
}

// -----------------
// AST Node Unions
// -----------------
export type Expression =
  | NumberLiteral
  | Identifier
  | UnaryExpression
  | BinaryExpression
  | CallExpression;

export type ASTNode =
  | Expression
  | Statement
  | Construction
  | Operator
  | Relation
  | Comment;

// -----------------
// Model
// -----------------
export interface Model {
  ast: ASTNode;
  scene: Scene;
}

export interface Scene {
  constructions: Construction[];
  statements: Statement[];
}
