import { R_CRLF, lineSplit } from 'crlf-normalize';
import { stringSplitWithLimit } from 'string-split-keep2';
import errcode from 'err-code';
import { inspect } from 'util';

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
const REGEX_MATCH_MESSAGE = /^([a-z][a-z0-9_]*)(?: \[(\w+)\])?:(?: ([\s\S]*))?$/i;
const REGEX_REMOVE_AT = /^at\s+/;
const REGEX_STARTS_WITH_EVAL_AT = /^eval\s+at\s+/;
const REGEX_MATCH_INDENT = /^([ \t]*)(.+)$/;
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
  const [source, line, col] = stringSplitWithLimit(rawSource, ':', -3);

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
  const {
    indent,
    rawLine
  } = _detectIndent(rawEvalSource);

  const [rawTrace, rawEvalTrace] = rawLine.replace(REGEX_STARTS_WITH_EVAL_AT, '').split(/,\s+/g).map(trim);
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
    evalTrace,
    indent
  };
}
function _detectIndent(trace) {
  const [, indent, rawLine] = REGEX_MATCH_INDENT.exec(trace);
  return {
    indent,
    rawLine
  };
}
function parseTrace(trace, testEvalSource) {
  const {
    indent,
    rawLine
  } = _detectIndent(trace);

  const t = rawLine.replace(REGEX_REMOVE_AT, '');
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

  if (testEvalSource === true) {
    if (!rawLine.startsWith(AT)) {
      return {
        raw: true,
        indent,
        rawLine
      };
    }
  }

  Object.assign(ret, testEvalSource && isEvalSource(rawSource) ? parseEvalSource(rawSource) : parseSource(rawSource));

  if (testEvalSource === true) {
    if (!validTrace(ret)) {
      return {
        raw: true,
        indent,
        rawLine
      };
    }
  }

  ret.indent = indent;
  return ret;
}
function isEvalSource(rawSource) {
  return REGEX_STARTS_WITH_EVAL_AT.test(rawSource);
}
function validTrace(trace) {
  var _trace$source;

  if (isRawLineTrace(trace)) {
    return false;
  }

  return trace.eval || isNumOnly(trace.line) || isUnset(trace.callee) && ((_trace$source = trace.source) === null || _trace$source === void 0 ? void 0 : _trace$source.length) > 0 && validPosition(trace);
}
function parseBody(rawStack, detectMessage) {
  var _rawMessage;

  let rawTrace;
  let rawMessage;

  if (!isUnset(detectMessage)) {
    let {
      type
    } = parseMessage(rawStack);
    let mf = formatMessage({
      type,
      message: detectMessage
    });
    let i = rawStack.indexOf(mf);

    if (i === 0) {
      let s = rawStack.replace(mf, '');
      let m = R_CRLF.exec(s);

      if ((m === null || m === void 0 ? void 0 : m.index) === 0) {
        rawTrace = lineSplit(m.input.replace(m[0], ''));
        rawMessage = mf;
      }
    }
  }

  if (!((_rawMessage = rawMessage) !== null && _rawMessage !== void 0 && _rawMessage.length)) {
    [rawMessage, ...rawTrace] = lineSplit(rawStack);
    const index = rawTrace.findIndex(line => line.trimLeft().startsWith(AT) && validTrace(parseTrace(trim(line), true)));
    rawMessage = [rawMessage, ...rawTrace.splice(0, index)].join(CR);
  }

  return {
    rawMessage,
    rawTrace
  };
}
function parseMessage(body) {
  try {
    const [, type, code, message] = body.match(REGEX_MATCH_MESSAGE);
    return {
      type,
      code,
      message
    };
  } catch (e) {
    e.message = `Failed to parse error message.\nreason: ${e.message}\nbody=${inspect(body)}`;
    errcode(e, {
      body
    });
    throw e;
  }
}
function parseStack(rawStack, detectMessage) {
  if (typeof rawStack !== 'string') {
    throw new TypeError('stack must be a string');
  }

  try {
    const {
      rawMessage,
      rawTrace
    } = parseBody(rawStack, detectMessage);
    const {
      type,
      code,
      message
    } = parseMessage(rawMessage);
    const traces = rawTrace.map(t => parseTrace(t, true));
    return {
      type,
      code,
      message,
      traces,
      rawMessage,
      rawTrace,
      rawStack
    };
  } catch (e) {
    errcode(e, {
      rawStack,
      detectMessage
    });
    throw e;
  }
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
function formatMessagePrefix({
  type,
  code
}) {
  if (code !== null && code !== void 0 && code.length) {
    type += ` [${code}]`;
  }

  return `${type}`;
}
function formatMessage(parsed) {
  var _parsed$message;

  return `${formatMessagePrefix(parsed)}: ${(_parsed$message = parsed.message) !== null && _parsed$message !== void 0 ? _parsed$message : ''}`;
}
function formatRawLineTrace(trace) {
  var _trace$indent;

  return `${(_trace$indent = trace.indent) !== null && _trace$indent !== void 0 ? _trace$indent : '    '}${trace.rawLine}`;
}
function isRawLineTrace(trace) {
  return trace.raw === true;
}
function isEvalTrace(trace) {
  return trace.eval === true;
}
function formatTraceLine(trace) {
  var _trace$indent2;

  if (isRawLineTrace(trace)) {
    return formatRawLineTrace(trace);
  }

  return `${(_trace$indent2 = trace.indent) !== null && _trace$indent2 !== void 0 ? _trace$indent2 : '    '}at ${isEvalTrace(trace) ? formatEvalTrace(trace) : formatTrace(trace)}`;
}
class ErrorStack {
  constructor(stack, detectMessage) {
    Object.assign(this, parseStack(stack, detectMessage));
  }

  filter(filter) {
    this.traces = this.traces.filter(filter);
    return this;
  }

  format() {
    return stringifyErrorStack(this);
  }

}
function formatTraces(traces) {
  return traces === null || traces === void 0 ? void 0 : traces.map(formatTraceLine);
}
function stringifyErrorStack(parsed) {
  var _parsed$traces$map, _parsed$traces;

  const messageLines = `${formatMessage(parsed)}`;
  const tracesLines = ((_parsed$traces$map = (_parsed$traces = parsed.traces) === null || _parsed$traces === void 0 ? void 0 : _parsed$traces.map(formatTraceLine)) !== null && _parsed$traces$map !== void 0 ? _parsed$traces$map : parsed.rawTrace).join(CR);
  return tracesLines ? messageLines + CR + tracesLines : messageLines;
}
function parseErrorStack(stack, detectMessage) {
  return new ErrorStack(stack, detectMessage);
}

export { ErrorStack, _detectIndent, breakBrackets, parseErrorStack as default, formatEvalTrace, formatMessage, formatMessagePrefix, formatRawLineTrace, formatTrace, formatTraceLine, formatTraces, isEvalSource, isEvalTrace, isRawLineTrace, parseBody, parseErrorStack, parseEvalSource, parseMessage, parseSource, parseStack, parseTrace, stringifyErrorStack, validPosition, validTrace };
//# sourceMappingURL=index.esm.mjs.map
