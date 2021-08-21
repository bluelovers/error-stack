'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crlfNormalize = require('crlf-normalize');
var ssplit = require('string-split-keep');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var ssplit__default = /*#__PURE__*/_interopDefaultLegacy(ssplit);

function trim(s) {
  return s.trim();
}

function isUnset(v) {
  return typeof v === 'undefined' || v === null;
}

function isNumOnly(v) {
  if (typeof v === 'number' || typeof v === 'string') {
    return /^\d+$/.test(v.toString());
  }

  return false;
}

const AT = 'at';
const CR = '\n';
const REGEX_MATCH_MESSAGE = /^([a-z][a-z0-9_]*):(?: ([\s\S]*))?$/i;
const REGEX_REMOVE_AT = /^at\s+/;
const REGEX_STARTS_WITH_EVAL_AT = /^eval\s+at\s+/;
function breakBrackets(str, first, last) {
  if (!str.endsWith(last)) {
    return [str];
  }

  let firstIndex;
  let cursor = str.length - 1;
  let count = 1;

  while (--cursor >= 0) {
    const char = str.charAt(cursor);

    if (char === last) {
      count++;
    } else if (char === first) {
      if (--count === 0) {
        firstIndex = cursor;
        break;
      }
    }
  }

  return [str.slice(0, firstIndex), str.slice(firstIndex + 1, -1)].map(trim);
}
function validPosition(source) {
  if (!isUnset(source)) {
    if (typeof source === 'object' && isUnset(source.line) && isUnset(source.col)) {
      return null;
    }

    return isNumOnly(source.line) && isNumOnly(source.col);
  }

  return false;
}
function parseSource(rawSource) {
  const [source, line, col] = ssplit__default['default'](rawSource, ':', -3);

  if (!(col !== null && col !== void 0 && col.length) || !(line !== null && line !== void 0 && line.length)) {
    return {
      source: rawSource
    };
  }

  return {
    source,
    line,
    col
  };
}
function parseEvalSource(rawEvalSource) {
  const [rawTrace, rawEvalTrace] = rawEvalSource.replace(REGEX_STARTS_WITH_EVAL_AT, '').split(/,\s+/g).map(trim);
  const {
    eval: ev,
    callee: evalCallee,
    calleeNote: evalCalleeNote,
    ...trace
  } = parseTrace(rawTrace);
  const evalTrace = parseSource(rawEvalTrace);
  return {
    evalCallee,
    evalCalleeNote,
    ...trace,
    evalTrace
  };
}
function parseTrace(trace, testEvalSource) {
  const t = trace.replace(REGEX_REMOVE_AT, '');
  let [rawCallee, rawSource] = breakBrackets(t, '(', ')');

  if (!rawSource) {
    [rawCallee, rawSource] = [rawSource, rawCallee];
  }

  const ret = {};

  if (rawCallee) {
    const [callee, calleeNote] = breakBrackets(rawCallee, '[', ']');
    ret.callee = callee;
    ret.calleeNote = calleeNote;
  } else {
    ret.callee = rawCallee;
  }

  if (ret.callee === 'eval') {
    ret.eval = true;
  }

  Object.assign(ret, testEvalSource && REGEX_STARTS_WITH_EVAL_AT.test(rawSource) ? parseEvalSource(rawSource) : parseSource(rawSource));
  return ret;
}
function validTrace(trace) {
  return trace.eval || typeof trace.line === 'number' || typeof trace.line === 'string' && /^\d+$/.test(trace.line);
}
function parseBody(rawStack) {
  const [rawMessage, ...rawTrace] = crlfNormalize.lineSplit(rawStack);
  const index = rawTrace.findIndex(line => line.trimLeft().startsWith(AT) && validTrace(parseTrace(trim(line), true)));
  const messageLines = [rawMessage, ...rawTrace.splice(0, index)];
  return {
    messageLines,
    rawTrace
  };
}
function parseMessage(body) {
  const [, type, message] = body.match(REGEX_MATCH_MESSAGE);
  return {
    type,
    message
  };
}
function parseStack(rawStack) {
  if (typeof rawStack !== 'string') {
    throw new TypeError('stack must be a string');
  }

  const {
    messageLines,
    rawTrace
  } = parseBody(rawStack);
  const {
    type,
    message
  } = parseMessage(messageLines.join(CR));
  const traces = rawTrace.map(t => parseTrace(trim(t), true));
  return {
    type,
    message,
    traces,
    rawStack
  };
}
function formatTrace({
  callee,
  calleeNote,
  source,
  line,
  col
}) {
  const sourceTrace = [source, line, col].filter(v => typeof v !== 'undefined').join(':');
  const note = calleeNote ? ` [${calleeNote}]` : '';
  return callee ? `${callee}${note} (${sourceTrace})` : sourceTrace;
}
function formatEvalTrace({
  callee,
  evalTrace,
  evalCallee,
  evalCalleeNote,
  ...trace
}) {
  return `${callee} (eval at ${formatTrace({ ...trace,
    callee: evalCallee !== null && evalCallee !== void 0 ? evalCallee : '<anonymous>',
    calleeNote: evalCalleeNote
  })}, ${formatTrace(evalTrace)})`;
}
function formatMessage({
  type,
  message
}) {
  return `${type}: ${message !== null && message !== void 0 ? message : ''}`;
}
function formatLineTrace(trace) {
  return `    at ${trace.eval ? formatEvalTrace(trace) : formatTrace(trace)}`;
}
class ErrorStack {
  constructor(stack) {
    Object.assign(this, parseStack(stack));
  }

  filter(filter) {
    this.traces = this.traces.filter(filter);
    return this;
  }

  format() {
    return stringifyErrorStack(this);
  }

}
function stringifyErrorStack(parsed) {
  const {
    type,
    message
  } = parsed;
  const messageLines = `${formatMessage({
    type,
    message
  })}`;
  const tracesLines = parsed.traces.map(formatLineTrace).join(CR);
  return tracesLines ? messageLines + CR + tracesLines : messageLines;
}
function parseErrorStack(stack) {
  return new ErrorStack(stack);
}

exports.ErrorStack = ErrorStack;
exports.breakBrackets = breakBrackets;
exports['default'] = parseErrorStack;
exports.formatEvalTrace = formatEvalTrace;
exports.formatLineTrace = formatLineTrace;
exports.formatMessage = formatMessage;
exports.formatTrace = formatTrace;
exports.parseBody = parseBody;
exports.parseErrorStack = parseErrorStack;
exports.parseEvalSource = parseEvalSource;
exports.parseMessage = parseMessage;
exports.parseSource = parseSource;
exports.parseStack = parseStack;
exports.parseTrace = parseTrace;
exports.stringifyErrorStack = stringifyErrorStack;
exports.validPosition = validPosition;
exports.validTrace = validTrace;
//# sourceMappingURL=error-stack2.cjs.development.js.map
