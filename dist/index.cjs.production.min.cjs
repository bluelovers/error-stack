"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("crlf-normalize"), r = require("string-split-keep2"), t = require("err-code"), a = require("util"), s = require("string-detect-indent");

function trim(e) {
  return e.trim();
}

function isUnset(e) {
  return null == e;
}

function isNumOnly(e) {
  return ("number" == typeof e || "string" == typeof e) && /^\d+$/.test(e.toString());
}

const n = "at", i = /^([a-z][a-z0-9_]*)(?:(?: \[(\w+)\])?:(?: ([\s\S]*))?)?$/i, o = /*#__PURE__*/ new RegExp(i.source, i.flags + "m"), c = /^at\s+/, l = /^eval\s+at\s+/;

function breakBrackets(e, r, t) {
  if (!e.endsWith(t)) return [ e ];
  let a, s = e.length - 1, n = 1;
  for (;--s >= 0; ) {
    const i = e.charAt(s);
    if (i === t) n++; else if (i === r && 0 == --n) {
      a = s;
      break;
    }
  }
  return [ e.slice(0, a), e.slice(a + 1, -1) ].map(trim);
}

function validPosition(e) {
  return !isUnset(e) && ("object" == typeof e && isUnset(e.line) && isUnset(e.col) ? null : isNumOnly(e.line) && isNumOnly(e.col));
}

function parseSource(e) {
  const [t, a, s] = r.stringSplitWithLimit(e, ":", -3);
  return null != s && s.length && null != a && a.length ? {
    source: t,
    line: a,
    col: s
  } : {
    source: e
  };
}

function parseEvalSource(e) {
  const {indent: r, rawLine: t} = _detectIndent(e), [a, s] = t.replace(l, "").split(/,\s+/g).map(trim), {eval: n, callee: i, calleeNote: o, ...c} = parseTrace(a);
  return {
    evalCallee: i,
    evalCalleeNote: o,
    ...c,
    evalTrace: parseSource(s),
    indent: r
  };
}

function _detectIndent(e) {
  const {indent: r, body: t} = s.detectIndentLine(e);
  return {
    indent: r,
    rawLine: t
  };
}

function parseTrace(e, r) {
  const {indent: t, rawLine: a} = _detectIndent(e), s = a.replace(c, "");
  let [i, o] = breakBrackets(s, "(", ")");
  o || ([i, o] = [ o, i ]);
  const l = {};
  if (i) {
    const [e, r] = breakBrackets(i, "[", "]");
    l.callee = e, l.calleeNote = r;
  } else l.callee = i;
  return "eval" === l.callee && (l.eval = !0), !0 !== r || a.startsWith(n) ? (Object.assign(l, r && isEvalSource(o) ? parseEvalSource(o) : parseSource(o)), 
  !0 !== r || validTrace(l) ? (l.indent = t, l) : {
    raw: !0,
    indent: t,
    rawLine: a
  }) : {
    raw: !0,
    indent: t,
    rawLine: a
  };
}

function isEvalSource(e) {
  return l.test(e);
}

function validTrace(e) {
  var r;
  return !isRawLineTrace(e) && (e.eval || isNumOnly(e.line) || isUnset(e.callee) && (null === (r = e.source) || void 0 === r ? void 0 : r.length) > 0 && validPosition(e));
}

function parseBody(r, t) {
  var a;
  let s, i;
  if (!isUnset(t)) {
    let {type: a, message: n} = parseMessage(r, !0), o = formatMessage({
      type: a,
      message: "" === t ? n : t
    });
    if (0 === r.indexOf(o)) {
      let t = r.replace(o, ""), a = e.R_CRLF.exec(t);
      0 === (null == a ? void 0 : a.index) && (s = e.lineSplit(a.input.replace(a[0], "")), 
      i = o);
    }
  }
  if (null === (a = i) || void 0 === a || !a.length) {
    [i, ...s] = e.lineSplit(r);
    const t = s.findIndex((e => e.trimLeft().startsWith(n) && validTrace(parseTrace(trim(e), !0))));
    i = [ i, ...s.splice(0, t) ].join(e.LF);
  }
  return {
    rawMessage: i,
    rawTrace: s
  };
}

function parseMessage(e, r) {
  try {
    const [, t, a, s] = e.match(r ? o : i);
    return {
      type: t,
      code: a,
      message: s
    };
  } catch (r) {
    throw r.message = `Failed to parse error message.\nreason: ${r.message}\nbody=${a.inspect(e)}`, 
    t(r, {
      body: e
    }), r;
  }
}

function parseStack(e, r) {
  if ("string" != typeof e) throw t(new TypeError("stack must be a string"), {
    rawStack: e,
    detectMessage: r
  });
  try {
    const {rawMessage: t, rawTrace: a} = parseBody(e, r), {type: s, code: n, message: i} = parseMessage(t);
    return {
      type: s,
      code: n,
      message: i,
      traces: a.map((e => parseTrace(e, !0))),
      rawMessage: t,
      rawTrace: a,
      rawStack: e
    };
  } catch (a) {
    throw t(a, {
      rawStack: e,
      detectMessage: r
    }), a;
  }
}

function formatTrace({callee: e, calleeNote: r, source: t, line: a, col: s}) {
  const n = [ t, a, s ].filter((e => void 0 !== e)).join(":");
  return e ? `${e}${r ? ` [${r}]` : ""} (${n})` : n;
}

function formatEvalTrace({callee: e, evalTrace: r, evalCallee: t, evalCalleeNote: a, ...s}) {
  return `${e} (eval at ${formatTrace({
    ...s,
    callee: null != t ? t : "<anonymous>",
    calleeNote: a
  })}, ${formatTrace(r)})`;
}

function formatMessagePrefix({type: e, code: r}) {
  return null != r && r.length && (e += ` [${r}]`), `${e}`;
}

function formatMessage(e) {
  let r = formatMessagePrefix(e);
  var t;
  return void 0 !== e.message && (r += `: ${null !== (t = e.message) && void 0 !== t ? t : ""}`), 
  r;
}

function formatRawLineTrace(e) {
  var r;
  return `${null !== (r = e.indent) && void 0 !== r ? r : "    "}${e.rawLine}`;
}

function isRawLineTrace(e) {
  return !0 === e.raw;
}

function isEvalTrace(e) {
  return !0 === e.eval;
}

function formatTraceLine(e) {
  var r;
  return isRawLineTrace(e) ? formatRawLineTrace(e) : `${null !== (r = e.indent) && void 0 !== r ? r : "    "}at ${isEvalTrace(e) ? formatEvalTrace(e) : formatTrace(e)}`;
}

class ErrorStack {
  constructor(e, r) {
    Object.assign(this, parseStack(e, r));
  }
  filter(e) {
    return this.traces = this.traces.filter(e), this;
  }
  format() {
    return stringifyErrorStack(this);
  }
}

function stringifyErrorStack(r) {
  var t, a;
  const s = `${formatMessage(r)}`, n = (null !== (t = null === (a = r.traces) || void 0 === a ? void 0 : a.map(formatTraceLine)) && void 0 !== t ? t : r.rawTrace).join(e.LF);
  return n ? s + e.LF + n : s;
}

function parseErrorStack(e, r) {
  return new ErrorStack(e, r);
}

exports.ErrorStack = ErrorStack, exports._detectIndent = _detectIndent, exports.breakBrackets = breakBrackets, 
exports.default = parseErrorStack, exports.formatEvalTrace = formatEvalTrace, exports.formatMessage = formatMessage, 
exports.formatMessagePrefix = formatMessagePrefix, exports.formatRawLineTrace = formatRawLineTrace, 
exports.formatTrace = formatTrace, exports.formatTraceLine = formatTraceLine, exports.formatTraces = function formatTraces(e) {
  return null == e ? void 0 : e.map(formatTraceLine);
}, exports.isEvalSource = isEvalSource, exports.isEvalTrace = isEvalTrace, exports.isRawLineTrace = isRawLineTrace, 
exports.parseBody = parseBody, exports.parseErrorStack = parseErrorStack, exports.parseEvalSource = parseEvalSource, 
exports.parseMessage = parseMessage, exports.parseSource = parseSource, exports.parseStack = parseStack, 
exports.parseTrace = parseTrace, exports.stringifyErrorStack = stringifyErrorStack, 
exports.validPosition = validPosition, exports.validTrace = validTrace;
//# sourceMappingURL=index.cjs.production.min.cjs.map
