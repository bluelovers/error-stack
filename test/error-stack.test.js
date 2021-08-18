/* eslint-disable new-cap */
/* eslint-disable no-eval */
const log = require('util').debuglog('error-stack');
const parse = require('..').default

const mm = `a
- b`

const CASES = [
  [
    'Error',
    new Error('foo').stack,
    (t, {message, type}) => {
      expect(message).toBe('foo')
      expect(type).toBe('Error')
    }
  ],
  [
    'TypeError',
    new TypeError('foo').stack,
    (t, {message, type}) => {
      expect(message).toBe('foo')
      expect(type).toBe('TypeError')
    }
  ],
  [
    'Custom Error',
    () => {
      class xxx1Error extends TypeError {}
      return new xxx1Error('foo').stack
    },
    (t, {message, type}) => {
      expect(message).toBe('foo')
      expect(type).toBe('TypeError')
    }
  ],
  [
    'Eval',
    eval('new Error("foo")').stack,
    (t, {
      traces: [{
        callee,
        source,
        evalTrace
      }]
    }) => {
      expect(callee).toBe('eval')
      expect(source).toBe(__filename)
      expect(evalTrace.source).toBe('<anonymous>')
    }
  ],
  [
    'travis build #2',
    `Error: foo
    at extensions.(anonymous function) (a.js:13:11)`,
    (t, {
      traces: [
        {callee, source}
      ]
    }) => {
      expect(callee).toBe('extensions.(anonymous function)')
      expect(source).toBe('a.js')
    }
  ],
  [
    'message with multiple lines',
    new Error(mm).stack,
    (t, {message}) => {
      expect(message).toBe(mm)
    }
  ],
  [
    'no stack',
    'Error: foo',
    (t, {message}) => {
      expect(message).toBe('foo')
    }
  ]
]

const createTester = object => (t, parsed) => {
  expect(parsed).toEqual(object)
}

CASES.forEach(([title, stack, object, only], i) => {
  const tt = only
    ? test.only
    : test

  tt(`${title || i}`, t => {
    if (typeof stack === 'function') {
      stack = stack()
    }

    stack = stack.trim()
    const parsed = parse(stack)
    log('parsed: %j\n', parsed)

    const tester = typeof object === 'function'
      ? object
      : createTester(object)

    tester(t, parsed)

    expect(stack).toBe(parsed.format())
  })
})

test('invalid stack', () => {
  expect(() => parse()).toThrowError({
    instanceOf: TypeError
  })
})

test('filter and format', () => {
  const stack = `Error: foo
    at repl:1:11
    at Script.runInThisContext (vm.js:123:20)`

  expect(parse(stack).filter(({callee}) => !!callee).format()).toBe(`Error: foo
  at Script.runInThisContext (vm.js:123:20)`)
})
