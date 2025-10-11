import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useXState, XSta } from '../src/index.js';

describe('useXState', () => {
  beforeEach(() => {
    XSta.clear();
  });

  it('should initialize state with initial value', () => {
    function Counter() {
      const [count] = useXState('counter', 0);
      return <div data-testid="count">{count}</div>;
    }

    render(<Counter />);
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('should initialize state with function', () => {
    function Counter() {
      const [count] = useXState('counter', () => 42);
      return <div data-testid="count">{count}</div>;
    }

    render(<Counter />);
    expect(screen.getByTestId('count').textContent).toBe('42');
  });

  it('should update state with new value', () => {
    function Counter() {
      const [count, setCount] = useXState('counter', 0);
      return (
        <div>
          <div data-testid="count">{count}</div>
          <button data-testid="btn" onClick={() => setCount(1)}>
            Set to 1
          </button>
        </div>
      );
    }

    render(<Counter />);
    expect(screen.getByTestId('count').textContent).toBe('0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should update state with function', () => {
    function Counter() {
      const [count, setCount] = useXState('counter', 0);
      return (
        <div>
          <div data-testid="count">{count}</div>
          <button
            data-testid="btn"
            onClick={() => setCount((prev) => prev + 1)}
          >
            Increment
          </button>
        </div>
      );
    }

    render(<Counter />);
    expect(screen.getByTestId('count').textContent).toBe('0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should share state across components', () => {
    function Counter1() {
      const [count] = useXState('shared-counter', 0);
      return <div data-testid="count1">{count}</div>;
    }

    function Counter2() {
      const [count, setCount] = useXState<number>('shared-counter');
      return (
        <div>
          <div data-testid="count2">{count}</div>
          <button
            data-testid="btn"
            onClick={() => setCount((prev) => prev + 1)}
          >
            Increment
          </button>
        </div>
      );
    }

    function App() {
      return (
        <>
          <Counter1 />
          <Counter2 />
        </>
      );
    }

    render(<App />);
    expect(screen.getByTestId('count1').textContent).toBe('0');
    expect(screen.getByTestId('count2').textContent).toBe('0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('count1').textContent).toBe('1');
    expect(screen.getByTestId('count2').textContent).toBe('1');
  });

  it('should support merge state', () => {
    function UserProfile() {
      const [user, setUser] = useXState('user', {
        name: 'Alice',
        age: 25,
        deep: {
          hello: 'world',
        },
      });
      return (
        <div>
          <div data-testid="user">{JSON.stringify(user)}</div>
          <button
            data-testid="btn"
            onClick={() =>
              setUser((draft) => {
                draft.age++;
                draft.deep.hello = 'world2';
              })
            }
          >
            Update age
          </button>
        </div>
      );
    }

    render(<UserProfile />);
    expect(screen.getByTestId('user').textContent).toBe(
      '{"name":"Alice","age":25,"deep":{"hello":"world"}}',
    );

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('user').textContent).toBe(
      '{"name":"Alice","age":26,"deep":{"hello":"world2"}}',
    );
  });

  it('should support silent option', () => {
    let renderCount = 0;

    function Counter() {
      const [count, setCount] = useXState('counter', 0);
      renderCount++;
      return (
        <div>
          <div data-testid="count">{count}</div>
          <button
            data-testid="btn"
            onClick={() => setCount(1, { silent: true })}
          >
            Silent update
          </button>
        </div>
      );
    }

    render(<Counter />);
    const initialRenderCount = renderCount;

    act(() => {
      screen.getByTestId('btn').click();
    });

    // Should not trigger re-render
    expect(renderCount).toBe(initialRenderCount);
    // But state should be updated
    expect(XSta.get('counter')).toBe(1);
  });

  it('should handle object state updates', () => {
    function UserForm() {
      const [user, setUser] = useXState('user', {
        name: 'Alice',
        age: 25,
        email: 'alice@example.com',
      });

      return (
        <div>
          <div data-testid="user">{JSON.stringify(user)}</div>
          <button
            data-testid="update-name"
            onClick={() => setUser((prev) => ({ ...prev, name: 'Bob' }))}
          >
            Update name
          </button>
          <button
            data-testid="update-age"
            onClick={() => setUser((prev) => ({ ...prev, age: prev.age + 1 }))}
          >
            Increment age
          </button>
        </div>
      );
    }

    render(<UserForm />);
    expect(screen.getByTestId('user').textContent).toBe(
      '{"name":"Alice","age":25,"email":"alice@example.com"}',
    );

    act(() => {
      screen.getByTestId('update-name').click();
    });

    expect(screen.getByTestId('user').textContent).toBe(
      '{"name":"Bob","age":25,"email":"alice@example.com"}',
    );

    act(() => {
      screen.getByTestId('update-age').click();
    });

    expect(screen.getByTestId('user').textContent).toBe(
      '{"name":"Bob","age":26,"email":"alice@example.com"}',
    );
  });

  it('should only initialize state once when multiple components mount', () => {
    function Counter1() {
      const [count] = useXState('counter', 10);
      return <div data-testid="count1">{count}</div>;
    }

    function Counter2() {
      const [count] = useXState('counter', 20);
      return <div data-testid="count2">{count}</div>;
    }

    function App() {
      return (
        <>
          <Counter1 />
          <Counter2 />
        </>
      );
    }

    render(<App />);
    // Should use the first initial value (10)
    expect(screen.getByTestId('count1').textContent).toBe('10');
    expect(screen.getByTestId('count2').textContent).toBe('10');
  });
});
