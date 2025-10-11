import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { createXStore, useXComputed, useXState, XSta } from '../src/index.js';

describe('useXComputed', () => {
  beforeEach(() => {
    XSta.clear();
  });

  it('should compute derived value from state', () => {
    const store = createXStore({ count: 0 });

    function App() {
      const doubled = store.useXComputed(({ count }) => count * 2);

      return (
        <div>
          <div data-testid="doubled">{doubled}</div>
          <button
            data-testid="btn"
            onClick={() =>
              store.setState((prev) => ({ count: prev.count + 1 }))
            }
          >
            Increment
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('doubled').textContent).toBe('0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('doubled').textContent).toBe('2');
  });

  it('should only re-render when watched value changes', () => {
    let renderCount = 0;
    let computedRenderCount = 0;
    const store = createXStore({ count: 0, text: 'hello' });

    function App() {
      const count = store.useXComputed(({ count }) => {
        computedRenderCount++;
        return count;
      });

      renderCount++;

      return (
        <div>
          <div data-testid="count">{count}</div>
          <button
            data-testid="update-count"
            onClick={() =>
              store.setState((prev) => ({ ...prev, count: prev.count + 1 }))
            }
          >
            Update count
          </button>
          <button
            data-testid="update-text"
            onClick={() =>
              store.setState((prev) => ({ ...prev, text: 'world' }))
            }
          >
            Update text
          </button>
        </div>
      );
    }

    render(<App />);

    act(() => {
      screen.getByTestId('update-text').click();
    });

    // Should not re-render because watched value (count) didn't change
    expect(renderCount).toBe(1);
    expect(computedRenderCount).toBe(2);

    act(() => {
      screen.getByTestId('update-count').click();
    });

    // Should re-render because watched value (count) changed
    expect(renderCount).toBe(2);
    expect(computedRenderCount).toBe(3);
  });

  it('should support transforming computed value', () => {
    function App() {
      const [, setCount] = useXState('counter', 0);
      const message = useXComputed(
        'counter',
        (state: number) => state,
        (count) => `Count is ${count}`,
      );

      return (
        <div>
          <div data-testid="message">{message}</div>
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
    expect(screen.getByTestId('message').textContent).toBe('Count is 0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('message').textContent).toBe('Count is 1');
  });

  it('should work with array state', () => {
    function App() {
      const [, setItems] = useXState('items', [1, 2, 3]);
      const sum = useXComputed('items', (items: number[]) =>
        items.reduce((acc, item) => acc + item, 0),
      );

      return (
        <div>
          <div data-testid="sum">{sum}</div>
          <button
            data-testid="btn"
            onClick={() => setItems((prev) => [...prev, 4])}
          >
            Add item
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('sum').textContent).toBe('6'); // 1 + 2 + 3

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('sum').textContent).toBe('10'); // 1 + 2 + 3 + 4
  });

  it('should share computed value across components', () => {
    function Display1() {
      const doubled = useXComputed('counter', (state: number) => state * 2);
      return <div data-testid="display1">{doubled}</div>;
    }

    function Display2() {
      const doubled = useXComputed('counter', (state: number) => state * 2);
      return <div data-testid="display2">{doubled}</div>;
    }

    function Controller() {
      return (
        <button
          data-testid="btn"
          onClick={() => XSta.set('counter', (prev: number) => prev + 1)}
        >
          Increment
        </button>
      );
    }

    function App() {
      useXState('counter', 5);
      return (
        <>
          <Display1 />
          <Display2 />
          <Controller />
        </>
      );
    }

    render(<App />);
    expect(screen.getByTestId('display1').textContent).toBe('10');
    expect(screen.getByTestId('display2').textContent).toBe('10');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('display1').textContent).toBe('12');
    expect(screen.getByTestId('display2').textContent).toBe('12');
  });

  it('should handle complex object filtering', () => {
    interface Todo {
      id: number;
      text: string;
      completed: boolean;
    }

    function App() {
      const [, setTodos] = useXState<Todo[]>('todos', [
        { id: 1, text: 'Task 1', completed: false },
        { id: 2, text: 'Task 2', completed: true },
        { id: 3, text: 'Task 3', completed: false },
      ]);

      const activeTodos = useXComputed('todos', (todos: Todo[]) =>
        todos.filter((todo) => !todo.completed),
      );

      return (
        <div>
          <div data-testid="active-count">{activeTodos.length}</div>
          <button
            data-testid="btn"
            onClick={() =>
              setTodos((prev) =>
                prev.map((todo) =>
                  todo.id === 1 ? { ...todo, completed: true } : todo,
                ),
              )
            }
          >
            Complete first
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('active-count').textContent).toBe('2');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('active-count').textContent).toBe('1');
  });

  it('should not re-render when shallow equal values are returned', () => {
    let renderCount = 0;
    const store = createXStore('state', { x: 1, y: 2 });

    function App() {
      const x = useXComputed('state', (s: { x: number; y: number }) => {
        return { value: s.x };
      });

      renderCount++;

      return (
        <div>
          <div data-testid="x">{x.value}</div>
          <button
            data-testid="update-y"
            onClick={() =>
              store.setState((prev) => ({ ...prev, y: prev.y + 1 }))
            }
          >
            Update Y
          </button>
          <button
            data-testid="update-x"
            onClick={() =>
              store.setState((prev) => ({ ...prev, x: prev.x + 1 }))
            }
          >
            Update X
          </button>
        </div>
      );
    }

    render(<App />);
    const initialRenderCount = renderCount;

    act(() => {
      screen.getByTestId('update-y').click();
    });

    // Should not trigger re-render because x didn't change
    expect(renderCount).toBe(initialRenderCount);

    act(() => {
      screen.getByTestId('update-x').click();
    });

    // Should trigger re-render because x changed
    expect(renderCount).toBeGreaterThan(initialRenderCount);
    expect(screen.getByTestId('x').textContent).toBe('2');
  });

  it('should support update state the immer way', () => {
    let renderCounter = 0;
    let renderTest = 0;
    const store = createXStore({ count: 1, age: 1 });

    function Counter() {
      const count = store.useXComputed((s) => s.count);
      renderCounter++;
      return <div data-testid="count">{count}</div>;
    }

    function Test() {
      const [{ age }] = store.useXState();
      renderTest++;
      return <div data-testid="test">{age}</div>;
    }

    render(
      <>
        <Counter />
        <Test />
      </>,
    );

    expect(renderCounter).toBe(1);
    expect(renderTest).toBe(1);

    act(() => {
      store.setState({ count: 1 });
    });

    expect(renderCounter).toBe(1);
    expect(renderTest).toBe(1);

    act(() => {
      store.setState((draft) => {
        draft.count = 1;
      });
    });

    expect(renderCounter).toBe(1);
    expect(renderTest).toBe(2);
  });
});
