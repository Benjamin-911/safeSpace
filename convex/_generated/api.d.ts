/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiCounselor from "../aiCounselor.js";
import type * as ai_culturalAdapter from "../ai/culturalAdapter.js";
import type * as ai_intentClassifier from "../ai/intentClassifier.js";
import type * as ai_mainOrchestrator from "../ai/mainOrchestrator.js";
import type * as ai_responseGenerators from "../ai/responseGenerators.js";
import type * as messages from "../messages.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiCounselor: typeof aiCounselor;
  "ai/culturalAdapter": typeof ai_culturalAdapter;
  "ai/intentClassifier": typeof ai_intentClassifier;
  "ai/mainOrchestrator": typeof ai_mainOrchestrator;
  "ai/responseGenerators": typeof ai_responseGenerators;
  messages: typeof messages;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
