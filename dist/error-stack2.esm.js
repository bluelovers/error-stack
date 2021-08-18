import { lineSplit } from 'crlf-normalize';
import ssplit from 'string-split-keep';

function trim(s) {
  return s.trim();
}

const AT = 'at';
const CR = '\n';
const REGEX_MATCH_MESSAGE = /^([a-z][a-z0-9_]*):\s+([\s\S]+)$/i;
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
  var _source$line, _source$col;

  return ((_source$line = source.line) === null || _source$line === void 0 ? void 0 : _source$line.toString().match(/^\d+$/)) && ((_source$col = source.col) === null || _source$col === void 0 ? void 0 : _source$col.toString().match(/^\d+$/));
}
function parseSource(rawSource) {
  const [source, line, col] = ssplit(rawSource, ':', -3);

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
function parseStack(stack) {
  const [rawMessage, ...rawTrace] = lineSplit(stack);
  const index = rawTrace.findIndex(line => line.trimLeft().startsWith(AT) && validTrace(parseTrace(trim(line), true)));
  const messageLines = [rawMessage, ...rawTrace.splice(0, index)];
  const [, type, message] = messageLines.join(CR).match(REGEX_MATCH_MESSAGE);
  const traces = rawTrace.map(t => parseTrace(trim(t), true));
  return {
    type,
    message,
    traces
  };
}
function formatTrace({
  callee,
  calleeNote,
  source,
  line,
  col
}) {
  const sourceTrace = [source, line, col].filter(Boolean).join(':');
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
  return `${type}: ${message}`;
}
function formatLineTrace(trace) {
  return `    at ${trace.eval ? formatEvalTrace(trace) : formatTrace(trace)}`;
}
class ErrorStack {
  constructor(stack) {
    if (typeof stack !== 'string') {
      throw new TypeError('stack must be a string');
    }

    Object.assign(this, parseStack(stack));
  }

  filter(filter) {
    this.traces = this.traces.filter(filter);
    return this;
  }

  format() {
    const {
      type,
      message
    } = this;
    const messageLines = `${formatMessage({
      type,
      message
    })}`;
    const tracesLines = this.traces.map(formatLineTrace).join(CR);
    return tracesLines ? messageLines + CR + tracesLines : messageLines;
  }

}
function parseErrorStack(stack) {
  return new ErrorStack(stack);
}

export { ErrorStack, breakBrackets, parseErrorStack as default, formatEvalTrace, formatLineTrace, formatMessage, formatTrace, parseErrorStack, parseEvalSource, parseSource, parseStack, parseTrace, validPosition, validTrace };
//# sourceMappingURL=error-stack2.esm.js.map
