import { R_CRLF as e, lineSplit as r, LF as a } from "crlf-normalize";

import { stringSplitWithLimit as t } from "string-split-keep2";

import n from "err-code";

import { inspect as s } from "util";

function trim(e) {
  return e.trim();
}

function isUnset(e) {
  return null == e;
}

function isNumOnly(e) {
  return ("number" == typeof e || "string" == typeof e) && /^\d+$/.test(e.toString());
}

const c = /^([a-z][a-z0-9_]*)(?:(?: \[(\w+)\])?:(?: ([\s\S]*))?)?$/i, i = new RegExp(c.source, c.flags + "m"), o = /^at\s+/, l = /^eval\s+at\s+/, u = /^([ \t]*)(.+)$/;

function breakBrackets(e, r, a) {
  if (!e.endsWith(a)) return [ e ];
  let t, n = e.length - 1, s = 1;
  for (;--n >= 0; ) {
    const c = e.charAt(n);
    if (c === a) s++; else if (c === r && 0 == --s) {
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
  const {indent: r, rawLine: a} = _detectIndent(e), [t, n] = a.replace(l, "").split(/,\s+/g).map(trim), {eval: s, callee: c, calleeNote: i, ...o} = parseTrace(t);
  return {
    evalCallee: c,
    evalCalleeNote: i,
    ...o,
    evalTrace: parseSource(n),
    indent: r
  };
}

function _detectIndent(e) {
  const [, r, a] = u.exec(e);
  return {
    indent: r,
    rawLine: a
  };
}

function parseTrace(e, r) {
  const {indent: a, rawLine: t} = _detectIndent(e), n = t.replace(o, "");
  let [s, c] = breakBrackets(n, "(", ")");
  c || ([s, c] = [ c, s ]);
  const i = {};
  if (s) {
    const [e, r] = breakBrackets(s, "[", "]");
    i.callee = e, i.calleeNote = r;
  } else i.callee = s;
  return "eval" === i.callee && (i.eval = !0), !0 !== r || t.startsWith("at") ? (Object.assign(i, r && isEvalSource(c) ? parseEvalSource(c) : parseSource(c)), 
  !0 !== r || validTrace(i) ? (i.indent = a, i) : {
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
  return l.test(e);
}

function validTrace(e) {
  var r;
  return !isRawLineTrace(e) && (e.eval || isNumOnly(e.line) || isUnset(e.callee) && (null === (r = e.source) || void 0 === r ? void 0 : r.length) > 0 && validPosition(e));
}

function parseBody(t, n) {
  var s;
  let c, i;
  if (!isUnset(n)) {
    let {type: a, message: s} = parseMessage(t, !0), o = formatMessage({
      type: a,
      message: "" === n ? s : n
    });
    if (0 === t.indexOf(o)) {
      let a = t.replace(o, ""), n = e.exec(a);
      0 === (null == n ? void 0 : n.index) && (c = r(n.input.replace(n[0], "")), i = o);
    }
  }
  if (null === (s = i) || void 0 === s || !s.length) {
    [i, ...c] = r(t);
    const e = c.findIndex((e => e.trimLeft().startsWith("at") && validTrace(parseTrace(trim(e), !0))));
    i = [ i, ...c.splice(0, e) ].join(a);
  }
  return {
    rawMessage: i,
    rawTrace: c
  };
}

function parseMessage(e, r) {
  try {
    const [, a, t, n] = e.match(r ? i : c);
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
    const {rawMessage: a, rawTrace: t} = parseBody(e, r), {type: n, code: s, message: c} = parseMessage(a);
    return {
      type: n,
      code: s,
      message: c,
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
