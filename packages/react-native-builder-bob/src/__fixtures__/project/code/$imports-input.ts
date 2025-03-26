import "./a";
import a from "a";
import b from "./b";
import c from "./c";
import d from "./d";
import e from "./e.story";
import f from "../f";
import pac from "..";
import pak from "../";
import pax from "../index";

import { a as a1 } from "./a";
import * as b1 from "./b";
import something, { c as c1 } from "./c";

import type { A } from "./a";

import "./NativeMyLib";
import "../NativeMyLib";
import "./NativeMyLib.ts";
import "../NativeMyLib.ts";
import "./NativeMyLib.tsx";
import "../NativeMyLib.tsx";
import "./NativeMyLib.js";
import "../NativeMyLib.js";
import "./NativeMyLib.jsx";
import "../NativeMyLib.jsx";

import "./MyNativeComponent";
import "../MyNativeComponent";
import "./MyNativeComponent.ts";
import "../MyNativeComponent.ts";
import "./MyNativeComponent.tsx";
import "../MyNativeComponent.tsx";
import "./MyNativeComponent.js";
import "../MyNativeComponent.js";
import "./MyNativeComponent.jsx";
import "../MyNativeComponent.jsx";
