export * as a from "a";
export * as b from "./b";
export * as c from "./c";
export * as d from "./d";
export * as e from "./e.story";
export * as f from "../f";
export * as pac from "..";
export * as pak from "../";
export * as pax from "../index";

export { a as a1 } from "./a";
export * from "./b";

export type { A } from "./a";

export const foo = "foo";

const bar = "bar";

export { bar };
