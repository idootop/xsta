import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useXState, XMemo, XSta } from '../src/index.js';

describe('XMemo', () => {
  beforeEach(() => {
    XSta.clear();
  });

  it('should update memoized value when watched state changes', () => {
    function App() {
      const [, setCount] = useXState('counter', 0);
      return (
        <div>
          <XMemo watch={(s: number) => s} xKey="counter">
            {(count) => <div data-testid="count">{count}</div>}
          </XMemo>
          <button
            data-testid="btn"
            onClick={() => setCount((prev) => prev + 1)}
          >
            Increment
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('count').textContent).toBe('0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should only update when watched value changes', () => {
    let childRenderCount = 0;

    function App() {
      const [, setState] = useXState('state', { count: 0, text: 'hello' });
      return (
        <div>
          <XMemo
            watch={(s: { count: number; text: string }) => s.count}
            xKey="state"
          >
            {(count) => {
              childRenderCount++;
              return <div data-testid="count">{count}</div>;
            }}
          </XMemo>
          <button
            data-testid="update-text"
            onClick={() => setState((prev) => ({ ...prev, text: 'world' }))}
          >
            Update text
          </button>
          <button
            data-testid="update-count"
            onClick={() =>
              setState((prev) => ({ ...prev, count: prev.count + 1 }))
            }
          >
            Update count
          </button>
        </div>
      );
    }

    render(<App />);
    const initialRenderCount = childRenderCount;

    act(() => {
      screen.getByTestId('update-text').click();
    });

    // Should not re-render children because watched value didn't change
    expect(childRenderCount).toBe(initialRenderCount);
    expect(screen.getByTestId('count').textContent).toBe('0');

    act(() => {
      screen.getByTestId('update-count').click();
    });

    // Should re-render children because watched value changed
    expect(childRenderCount).toBeGreaterThan(initialRenderCount);
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should support computed string values', () => {
    function App() {
      const [, setUser] = useXState('user', {
        firstName: 'John',
        lastName: 'Doe',
      });

      return (
        <div>
          {XMemo({
            xKey: 'user',
            watch: (s: { firstName: string; lastName: string }) =>
              `${s.firstName} ${s.lastName}`,
            children: (fullName) => (
              <div data-testid="full-name">{fullName}</div>
            ),
          })}
          <button
            data-testid="btn"
            onClick={() => setUser((prev) => ({ ...prev, lastName: 'Smith' }))}
          >
            Change last name
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('full-name').textContent).toBe('John Doe');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('full-name').textContent).toBe('John Smith');
  });

  it('should support multiple XMemo with different watch functions', () => {
    function App() {
      const [, setState] = useXState('coords', { x: 10, y: 20 });

      return (
        <div>
          <XMemo watch={(s: { x: number; y: number }) => s.x} xKey="coords">
            {(x) => <div data-testid="x">X: {x}</div>}
          </XMemo>
          <XMemo watch={(s: { x: number; y: number }) => s.y} xKey="coords">
            {(y) => <div data-testid="y">Y: {y}</div>}
          </XMemo>
          <button
            data-testid="update-x"
            onClick={() => setState((prev) => ({ ...prev, x: prev.x + 5 }))}
          >
            Update X
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('x').textContent).toBe('X: 10');
    expect(screen.getByTestId('y').textContent).toBe('Y: 20');

    act(() => {
      screen.getByTestId('update-x').click();
    });

    expect(screen.getByTestId('x').textContent).toBe('X: 15');
    expect(screen.getByTestId('y').textContent).toBe('Y: 20');
  });

  it('should properly memoize and avoid unnecessary renders', () => {
    let memoizedChildRenderCount = 0;
    let parentRenderCount = 0;

    function App() {
      const [, setState] = useXState('data', {
        important: 1,
        unimportant: 'a',
      });
      parentRenderCount++;

      return (
        <div>
          <XMemo
            watch={(s: { important: number; unimportant: string }) =>
              s.important
            }
            xKey="data"
          >
            {(value) => {
              memoizedChildRenderCount++;
              return <div data-testid="value">{value}</div>;
            }}
          </XMemo>
          <button
            data-testid="update-unimportant"
            onClick={() => setState((prev) => ({ ...prev, unimportant: 'b' }))}
          >
            Update unimportant
          </button>
          <button
            data-testid="update-important"
            onClick={() =>
              setState((prev) => ({ ...prev, important: prev.important + 1 }))
            }
          >
            Update important
          </button>
        </div>
      );
    }

    render(<App />);
    const initialMemoRenderCount = memoizedChildRenderCount;
    const initialParentRenderCount = parentRenderCount;

    act(() => {
      screen.getByTestId('update-unimportant').click();
    });

    // Parent will re-render but memoized child should not
    expect(parentRenderCount).toBeGreaterThan(initialParentRenderCount);
    expect(memoizedChildRenderCount).toBe(initialMemoRenderCount);

    act(() => {
      screen.getByTestId('update-important').click();
    });

    // Both should re-render
    expect(memoizedChildRenderCount).toBeGreaterThan(initialMemoRenderCount);
  });

  it('should support transforming computed value', () => {
    function App() {
      const [, setCount] = useXState('counter', 0);
      return (
        <div>
          <XMemo
            transform={(state: number) => `Count: ${state}`}
            xKey="counter"
          >
            {(message) => <div data-testid="message">{message}</div>}
          </XMemo>
          <button
            data-testid="btn"
            onClick={() => setCount((prev) => prev + 1)}
          >
            Increment
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('message').textContent).toBe('Count: 0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('message').textContent).toBe('Count: 1');
  });
});
