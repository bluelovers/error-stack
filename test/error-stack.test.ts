/* eslint-disable new-cap */
/* eslint-disable no-eval */
import { debuglog } from 'util';
import parse from '../src/index';
import { IParsedWithoutTrace } from '../src/types';

const log = debuglog('error-stack');
const mm = `a
- b`

const CASES: [title: string, stack: string | (() => string), object: (argv: any) => any, only?: boolean][] = [
  [
    'Error',
    new Error('foo').stack,
    ({message, type}: IParsedWithoutTrace) => {
      expect(message).toBe('foo')
      expect(type).toBe('Error')
    }
  ],
  [
    'TypeError',
    new TypeError('foo').stack,
    ({message, type}: IParsedWithoutTrace) => {
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
    ({message, type}: IParsedWithoutTrace) => {
      expect(message).toBe('foo')
      expect(type).toBe('TypeError')
    }
  ],
  [
    'Eval',
    eval('new Error("foo:eval")').stack,
    ({
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
    ({
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
    ({message}: IParsedWithoutTrace) => {
      expect(message).toBe(mm)
    }
  ],
  [
    'no stack',
    'Error: foo',
    ({message}: IParsedWithoutTrace) => {
      expect(message).toBe('foo')
    }
  ]
]

const createTester = (object: any) => (parsed: any) => {
  expect(parsed).toEqual(object)
}

CASES.forEach(([title, stack, object, only], i) => {
  const tt = only
    ? test.only
    : test

  tt(`${title || i}`, () => {
    if (typeof stack === 'function') {
      stack = stack()
    }

    log('stack: %s\n', stack)
    stack = stack.trim()
    const parsed = parse(stack)
    log('parsed: %j\n', parsed)

    const tester = typeof object === 'function'
      ? object
      : createTester(object)

    tester(parsed)

    expect(parsed.format()).toBe(stack)
  })
})

test('invalid stack', () => {
  // @ts-ignore
  expect(() => parse()).toThrow(TypeError)
})

test('filter and format', () => {
  const stack = `Error: foo
    at repl:1:11
    at Script.runInThisContext (vm.js:123:20)`

  expect(parse(stack).filter(({callee}) => !!callee).format()).toBe(`Error: foo
    at Script.runInThisContext (vm.js:123:20)`)
})
