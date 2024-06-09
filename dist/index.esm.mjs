import { R_CRLF as e, lineSplit as r, LF as a } from "crlf-normalize";

import { stringSplitWithLimit as t } from "string-split-keep2";

import n from "err-code";

import { inspect as s } from "util";

import { detectIndentLine as i } from "string-detect-indent";

function trim(e) {
  return e.trim();
}

function isUnset(e) {
  return null == e;
}

function isNumOnly(e) {
  return ("number" == typeof e || "string" == typeof e) && /^\d+$/.test(e.toString());
}

const c = "at", o = /^([a-z][a-z0-9_]*)(?:(?: \[(\w+)\])?:(?: ([\s\S]*))?)?$/i, l = /*#__PURE__*/ new RegExp(o.source, o.flags + "m"), u = /^at\s+/, f = /^eval\s+at\s+/;

function breakBrackets(e, r, a) {
  if (!e.endsWith(a)) return [ e ];
  let t, n = e.length - 1, s = 1;
  for (;--n >= 0; ) {
    const i = e.charAt(n);
    if (i === a) s++; else if (i === r && 0 == --s) {
      t = n;
      break;
    }
  }
  return [ e.slice(0, t), e.slice(t + 1, -1) ].map(trim);
}

function validPosition(e) {
  return !isUnset(e) && ("object" == typeof e && isUnset(e.line) && isUnset(e.col) ? null : isNumOnly(e.line) && isNumOnly(e.col));
}

function parseSource(e) {
  const [r, a, n] = t(e, ":", -3);
  return null != n && n.length && null != a && a.length ? {
    source: r,
    line: a,
    col: n
  } : {
    source: e
  };
}

function parseEvalSource(e) {
  const {indent: r, rawLine: a} = _detectIndent(e), [t, n] = a.replace(f, "").split(/,\s+/g).map(trim), {eval: s, callee: i, calleeNote: c, ...o} = parseTrace(t);
  return {
    evalCallee: i,
    evalCalleeNote: c,
    ...o,
    evalTrace: parseSource(n),
    indent: r
  };
}

function _detectIndent(e) {
  const {indent: r, body: a} = i(e);
  return {
    indent: r,
    rawLine: a
  };
}

function parseTrace(e, r) {
  const {indent: a, rawLine: t} = _detectIndent(e), n = t.replace(u, "");
  let [s, i] = breakBrackets(n, "(", ")");
  i || ([s, i] = [ i, s ]);
  const o = {};
  if (s) {
    const [e, r] = breakBrackets(s, "[", "]");
    o.callee = e, o.calleeNote = r;
  } else o.callee = s;
  return "eval" === o.callee && (o.eval = !0), !0 !== r || t.startsWith(c) ? (Object.assign(o, r && isEvalSource(i) ? parseEvalSource(i) : parseSource(i)), 
  !0 !== r || validTrace(o) ? (o.indent = a, o) : {
    raw: !0,
    indent: a,
    rawLine: t
  }) : {
    raw: !0,
    indent: a,
    rawLine: t
  };
}

function isEvalSource(e) {
  return f.test(e);
}

function validTrace(e) {
  var r;
  return !isRawLineTrace(e) && (e.eval || isNumOnly(e.line) || isUnset(e.callee) && (null === (r = e.source) || void 0 === r ? void 0 : r.length) > 0 && validPosition(e));
}

function parseBody(t, n) {
  var s;
  let i, o;
  if (!isUnset(n)) {
    let {type: a, message: s} = parseMessage(t, !0), c = formatMessage({
      type: a,
      message: "" === n ? s : n
    });
    if (0 === t.indexOf(c)) {
      let a = t.replace(c, ""), n = e.exec(a);
      0 === (null == n ? void 0 : n.index) && (i = r(n.input.replace(n[0], "")), o = c);
    }
  }
  if (null === (s = o) || void 0 === s || !s.length) {
    [o, ...i] = r(t);
    const e = i.findIndex((e => e.trimLeft().startsWith(c) && validTrace(parseTrace(trim(e), !0))));
    o = [ o, ...i.splice(0, e) ].join(a);
  }
  return {
    rawMessage: o,
    rawTrace: i
  };
}

function parseMessage(e, r) {
  try {
    const [, a, t, n] = e.match(r ? l : o);
    return {
      type: a,
      code: t,
      message: n
    };
  } catch (r) {
    throw r.message = `Failed to parse error message.\nreason: ${r.message}\nbody=${s(e)}`, 
    n(r, {
      body: e
    }), r;
  }
}

function parseStack(e, r) {
  if ("string" != typeof e) throw n(new TypeError("stack must be a string"), {
    rawStack: e,
    detectMessage: r
  });
  try {
    const {rawMessage: a, rawTrace: t} = parseBody(e, r), {type: n, code: s, message: i} = parseMessage(a);
    return {
      type: n,
      code: s,
      message: i,
      traces: t.map((e => parseTrace(e, !0))),
      rawMessage: a,
      rawTrace: t,
      rawStack: e
    };
  } catch (a) {
    throw n(a, {
      rawStack: e,
      detectMessage: r
    }), a;
  }
}

function formatTrace({callee: e, calleeNote: r, source: a, line: t, col: n}) {
  const s = [ a, t, n ].filter((e => void 0 !== e)).join(":");
  return e ? `${e}${r ? ` [${r}]` : ""} (${s})` : s;
}

function formatEvalTrace({callee: e, evalTrace: r, evalCallee: a, evalCalleeNote: t, ...n}) {
  return `${e} (eval at ${formatTrace({
    ...n,
    callee: null != a ? a : "<anonymous>",
    calleeNote: t
  })}, ${formatTrace(r)})`;
}

function formatMessagePrefix({type: e, code: r}) {
  return null != r && r.length && (e += ` [${r}]`), `${e}`;
}

function formatMessage(e) {
  let r = formatMessagePrefix(e);
  var a;
  return void 0 !== e.message && (r += `: ${null !== (a = e.message) && void 0 !== a ? a : ""}`), 
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

function formatTraces(e) {
  return null == e ? void 0 : e.map(formatTraceLine);
}

function stringifyErrorStack(e) {
  var r, t;
  const n = `${formatMessage(e)}`, s = (null !== (r = null === (t = e.traces) || void 0 === t ? void 0 : t.map(formatTraceLine)) && void 0 !== r ? r : e.rawTrace).join(a);
  return s ? n + a + s : n;
}

function parseErrorStack(e, r) {
  return new ErrorStack(e, r);
}

export { ErrorStack, _detectIndent, breakBrackets, parseErrorStack as default, formatEvalTrace, formatMessage, formatMessagePrefix, formatRawLineTrace, formatTrace, formatTraceLine, formatTraces, isEvalSource, isEvalTrace, isRawLineTrace, parseBody, parseErrorStack, parseEvalSource, parseMessage, parseSource, parseStack, parseTrace, stringifyErrorStack, validPosition, validTrace };
//# sourceMappingURL=index.esm.mjs.map
