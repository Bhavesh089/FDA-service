"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/handler.ts
var handler_exports = {};
__export(handler_exports, {
  queryHandler: () => queryHandler
});
module.exports = __toCommonJS(handler_exports);
var queryHandler = async (event, context, callback) => {
  const data = {
    message: "Query successful",
    items: ["item1", "item2", "item3"]
  };
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  queryHandler
});
//# sourceMappingURL=handler.js.map
