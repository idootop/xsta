import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useXState, XSta, XWatch } from '../src/index.js';

describe('XWatch', () => {
  beforeEach(() => {
    XSta.clear();
  });

  it('should render children with watched value', () => {
    XSta.set('counter', 0);

    function App() {
      return (
        <XWatch watch={(s: number) => s} xKey="counter">
          {(count) => <div data-testid="count">{count}</div>}
        </XWatch>
      );
    }

    render(<App />);
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('should re-render when watched value changes', () => {
    XSta.set('counter', 0);
    function App() {
      return (
        <div>
          <XWatch watch={(s: number) => s} xKey="counter">
            {(count) => <div data-testid="count">{count}</div>}
          </XWatch>
          <button
            data-testid="btn"
            onClick={() => XSta.set('counter', (prev: number) => prev + 1)}
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

  it('should only re-render when watched value changes', () => {
    let renderCount = 0;
    function App() {
      const [, setState] = useXState('user', { name: 'Alice', age: 25 });
      return (
        <div>
          <XWatch
            watch={(s: { name: string; age: number }) => s.name}
            xKey="user"
          >
            {(name) => {
              renderCount++;
              return <div data-testid="name">{name}</div>;
            }}
          </XWatch>
          <button
            data-testid="update-name"
            onClick={() => setState((prev) => ({ ...prev, name: 'Bob' }))}
          >
            Update name
          </button>
          <button
            data-testid="update-age"
            onClick={() => setState((prev) => ({ ...prev, age: 26 }))}
          >
            Update age
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('name').textContent).toBe('Alice');
    expect(renderCount).toBe(1);

    act(() => {
      screen.getByTestId('update-name').click();
    });

    expect(screen.getByTestId('name').textContent).toBe('Bob');
    expect(renderCount).toBe(2);

    act(() => {
      screen.getByTestId('update-age').click();
    });

    expect(screen.getByTestId('name').textContent).toBe('Bob');
    expect(renderCount).toBe(3);
  });

  it('should support computed values in watch function', () => {
    function App() {
      const [, setItems] = useXState('items', [1, 2, 3]);
      return (
        <div>
          <XWatch watch={(s: number[]) => s.length} xKey="items">
            {(length) => <div data-testid="length">{length}</div>}
          </XWatch>
          <button
            data-testid="add"
            onClick={() => setItems((prev) => [...prev, 4])}
          >
            Add item
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('length').textContent).toBe('3');

    act(() => {
      screen.getByTestId('add').click();
    });

    expect(screen.getByTestId('length').textContent).toBe('4');
  });

  it('should work with multiple XWatch components watching same state', () => {
    function App() {
      const [, setState] = useXState('data', { x: 1, y: 2 });
      return (
        <div>
          <XWatch watch={(s: { x: number; y: number }) => s.x} xKey="data">
            {(x) => <div data-testid="x">{x}</div>}
          </XWatch>
          <XWatch watch={(s: { x: number; y: number }) => s.y} xKey="data">
            {(y) => <div data-testid="y">{y}</div>}
          </XWatch>
          <button
            data-testid="update-x"
            onClick={() => setState((prev) => ({ ...prev, x: prev.x + 1 }))}
          >
            Update X
          </button>
          <button
            data-testid="update-y"
            onClick={() => setState((prev) => ({ ...prev, y: prev.y + 1 }))}
          >
            Update Y
          </button>
        </div>
      );
    }

    render(<App />);
    expect(screen.getByTestId('x').textContent).toBe('1');
    expect(screen.getByTestId('y').textContent).toBe('2');

    act(() => {
      screen.getByTestId('update-x').click();
    });

    expect(screen.getByTestId('x').textContent).toBe('2');
    expect(screen.getByTestId('y').textContent).toBe('2');

    act(() => {
      screen.getByTestId('update-y').click();
    });

    expect(screen.getByTestId('x').textContent).toBe('2');
    expect(screen.getByTestId('y').textContent).toBe('3');
  });
});
