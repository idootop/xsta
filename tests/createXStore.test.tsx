import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { createXStore, XSta } from '../src/index.js';

describe('createXStore', () => {
  beforeEach(() => {
    XSta.clear();
  });

  it('should create store with initial state', () => {
    const store = createXStore({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('should get state via getState', () => {
    const store = createXStore({ name: 'Alice', age: 25 });
    const state = store.getState();
    expect(state.name).toBe('Alice');
    expect(state.age).toBe(25);
  });

  it('should set state via setState', () => {
    const store = createXStore({ count: 0 });
    store.setState({ count: 5 });
    expect(store.getState()).toEqual({ count: 5 });
  });

  it('should update state with function', () => {
    const store = createXStore({ count: 0 });
    store.setState((prev) => ({ count: prev.count + 1 }));
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should support merge option in setState', () => {
    const store = createXStore({ name: 'Alice', age: 25 });
    store.mergeState({ age: 26 });
    expect(store.getState()).toEqual({ name: 'Alice', age: 26 });
  });

  it('should support silent option in setState', () => {
    let renderCount = 0;
    const store = createXStore({ count: 0 });

    function Counter() {
      const [{ count }] = store.useXState();
      renderCount++;
      return <div data-testid="count">{count}</div>;
    }

    render(<Counter />);
    const initialRenderCount = renderCount;

    act(() => {
      store.setState({ count: 1 }, { silent: true });
    });

    // Should not trigger re-render
    expect(renderCount).toBe(initialRenderCount);
    // But state should be updated
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should work with useXState hook', () => {
    const store = createXStore({ count: 0 });

    function Counter() {
      const [{ count }, setCount] = store.useXState();
      return (
        <div>
          <div data-testid="count">{count}</div>
          <button
            data-testid="btn"
            onClick={() => setCount((prev) => ({ count: prev.count + 1 }))}
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

  it('should work with useXComputed hook', () => {
    const store = createXStore({ count: 0 });

    function App() {
      const doubled = store.useXComputed((s) => s.count * 2);

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

  it('should work with useXComputed with transform', () => {
    const store = createXStore({ count: 5 });

    function App() {
      const message = store.useXComputed(
        (s) => s.count,
        (count) => `Count: ${count}`,
      );

      return (
        <div>
          <div data-testid="message">{message}</div>
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
    expect(screen.getByTestId('message').textContent).toBe('Count: 5');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('message').textContent).toBe('Count: 6');
  });

  it('should work with XWatch component', () => {
    const store = createXStore({ count: 0 });

    function App() {
      return (
        <div>
          <store.XWatch watch={(s) => s.count}>
            {(count) => <div data-testid="count">{count}</div>}
          </store.XWatch>
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
    expect(screen.getByTestId('count').textContent).toBe('0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('should work with XMemo component', () => {
    const store = createXStore({ count: 0 });

    function App() {
      return (
        <div>
          <store.XMemo watch={(s) => s.count * 2}>
            {(doubled) => <div data-testid="doubled">{doubled}</div>}
          </store.XMemo>
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

  it('should share state across multiple components', () => {
    const store = createXStore({ count: 0 });

    function Display1() {
      const [{ count }] = store.useXState();
      return <div data-testid="display1">{count}</div>;
    }

    function Display2() {
      const doubled = store.useXComputed((s) => s.count * 2);
      return <div data-testid="display2">{doubled}</div>;
    }

    function Controller() {
      return (
        <button
          data-testid="btn"
          onClick={() => store.setState((prev) => ({ count: prev.count + 1 }))}
        >
          Increment
        </button>
      );
    }

    function App() {
      return (
        <>
          <Display1 />
          <Display2 />
          <Controller />
        </>
      );
    }

    render(<App />);
    expect(screen.getByTestId('display1').textContent).toBe('0');
    expect(screen.getByTestId('display2').textContent).toBe('0');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('display1').textContent).toBe('1');
    expect(screen.getByTestId('display2').textContent).toBe('2');
  });

  it('should support complex state objects', () => {
    const store = createXStore({
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      settings: {
        theme: 'dark',
        notifications: true,
      },
      addId: () => {
        store.mergeState((prev) => ({
          id: prev.id + 1,
        }));
      },
    });

    function App() {
      const [user, setUser] = store.useXState();

      return (
        <div>
          <div data-testid="id">{user.id}</div>
          <div data-testid="name">{user.name}</div>
          <div data-testid="theme">{user.settings.theme}</div>
          <button
            data-testid="update-id"
            onClick={() => store.getState().addId()}
          >
            Update id
          </button>
          <button
            data-testid="update-name"
            onClick={() => setUser((prev) => ({ ...prev, name: 'Bob' }))}
          >
            Update name
          </button>
          <button
            data-testid="update-theme"
            onClick={() =>
              setUser((prev) => ({
                ...prev,
                settings: { ...prev.settings, theme: 'light' },
              }))
            }
          >
            Update theme
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('id').textContent).toBe('1');
    expect(screen.getByTestId('name').textContent).toBe('Alice');
    expect(screen.getByTestId('theme').textContent).toBe('dark');

    act(() => {
      screen.getByTestId('update-id').click();
    });

    expect(screen.getByTestId('id').textContent).toBe('2');

    act(() => {
      screen.getByTestId('update-name').click();
    });

    expect(screen.getByTestId('name').textContent).toBe('Bob');

    act(() => {
      screen.getByTestId('update-theme').click();
    });

    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should support array state', () => {
    const store = createXStore<number[]>([1, 2, 3]);

    function App() {
      const [items, setItems] = store.useXState();

      return (
        <div>
          <div data-testid="items">{items.join(',')}</div>
          <button
            data-testid="add"
            onClick={() => setItems((prev) => [...prev, prev.length + 1])}
          >
            Add item
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('items').textContent).toBe('1,2,3');

    act(() => {
      screen.getByTestId('add').click();
    });

    expect(screen.getByTestId('items').textContent).toBe('1,2,3,4');
  });

  it('should create multiple independent stores', () => {
    const store1 = createXStore({ value: 1 });
    const store2 = createXStore({ value: 2 });

    expect(store1.getState()).toEqual({ value: 1 });
    expect(store2.getState()).toEqual({ value: 2 });

    store1.setState({ value: 10 });
    expect(store1.getState()).toEqual({ value: 10 });
    expect(store2.getState()).toEqual({ value: 2 }); // Should not change
  });

  it('should support primitive state values', () => {
    const store = createXStore(42);

    function App() {
      const [count, setCount] = store.useXState();

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

    render(<App />);
    expect(screen.getByTestId('count').textContent).toBe('42');

    act(() => {
      screen.getByTestId('btn').click();
    });

    expect(screen.getByTestId('count').textContent).toBe('43');
  });

  it('should work with external state updates', () => {
    const store = createXStore({ count: 0 });

    function Counter() {
      const [{ count }] = store.useXState();
      return <div data-testid="count">{count}</div>;
    }

    render(<Counter />);
    expect(screen.getByTestId('count').textContent).toBe('0');

    act(() => {
      store.setState({ count: 5 });
    });

    expect(screen.getByTestId('count').textContent).toBe('5');
  });

  it('should not re-render when using silent option', () => {
    let renderCount = 0;
    const store = createXStore({ count: 0 });

    function Counter() {
      const [{ count }] = store.useXState();
      renderCount++;
      return <div data-testid="count">{count}</div>;
    }

    render(<Counter />);
    const initialRenderCount = renderCount;

    act(() => {
      store.setState({ count: 100 }, { silent: true });
    });

    expect(renderCount).toBe(initialRenderCount);
    expect(store.getState().count).toBe(100);
  });
});
