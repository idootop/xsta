import { act, configure, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useXRoot, useXState, XSta } from '../src/index.js';

describe('useXRoot', () => {
  beforeEach(() => {
    XSta.clear();
    configure({ reactStrictMode: true });
  });

  it('should initialize state on mount', () => {
    function App() {
      useXRoot('test', { value: 42 });
      return <div data-testid="mounted">Mounted</div>;
    }

    render(<App />);
    expect(XSta.has('test')).toBe(true);
    expect(XSta.get('test')).toEqual({ value: 42 });
  });

  it('should delete state on unmount', () => {
    function Child() {
      useXRoot('temp', { data: 'test' });
      return <div>Child</div>;
    }

    function App() {
      const [show, setShow] = useState(true);
      return (
        <div>
          {show && <Child />}
          <button data-testid="toggle" onClick={() => setShow(false)}>
            Toggle
          </button>
        </div>
      );
    }

    render(<App />);
    expect(XSta.has('temp')).toBe(true);

    act(() => {
      screen.getByTestId('toggle').click();
    });

    expect(XSta.has('temp')).toBe(false);
  });

  it('should not reinitialize if state already exists', () => {
    XSta.set('existing', { count: 100 });

    function App() {
      useXRoot('existing', { count: 0 });
      const [state] = useXState('existing');
      return <div data-testid="count">{state.count}</div>;
    }

    render(<App />);
    // Should keep the existing value
    expect(screen.getByTestId('count').textContent).toBe('100');
  });

  it('should work with function initializer', () => {
    function App() {
      useXRoot('test', () => ({ computed: 1 + 1 }));
      const [state] = useXState('test');
      return <div data-testid="value">{state.computed}</div>;
    }

    render(<App />);
    expect(screen.getByTestId('value').textContent).toBe('2');
  });

  it('should allow multiple components to share state', () => {
    function Component1() {
      const [state, setState] = useXState('shared');
      return (
        <div>
          <div data-testid="value1">{state.value}</div>
          <button
            data-testid="btn1"
            onClick={() => setState((prev: any) => ({ value: prev.value + 1 }))}
          >
            Increment
          </button>
        </div>
      );
    }

    function Component2() {
      const [state] = useXState('shared');
      return <div data-testid="value2">{state.value}</div>;
    }

    function Root() {
      useXRoot('shared', { value: 0 });
      return (
        <>
          <Component1 />
          <Component2 />
        </>
      );
    }

    render(<Root />);
    expect(screen.getByTestId('value1').textContent).toBe('0');
    expect(screen.getByTestId('value2').textContent).toBe('0');

    act(() => {
      screen.getByTestId('btn1').click();
    });

    expect(screen.getByTestId('value1').textContent).toBe('1');
    expect(screen.getByTestId('value2').textContent).toBe('1');
  });

  it('should handle multiple root instances with different keys', () => {
    function Root1() {
      useXRoot('root1', { id: 1 });
      return <div>Root 1</div>;
    }

    function Root2() {
      useXRoot('root2', { id: 2 });
      return <div>Root 2</div>;
    }

    function App() {
      const [show, setShow] = useState({ r1: true, r2: true });
      return (
        <div>
          {show.r1 && <Root1 />}
          {show.r2 && <Root2 />}
          <button
            data-testid="unmount-r1"
            onClick={() => setShow({ ...show, r1: false })}
          >
            Unmount Root 1
          </button>
          <button
            data-testid="unmount-r2"
            onClick={() => setShow({ ...show, r2: false })}
          >
            Unmount Root 2
          </button>
        </div>
      );
    }

    render(<App />);
    expect(XSta.has('root1')).toBe(true);
    expect(XSta.has('root2')).toBe(true);

    act(() => {
      screen.getByTestId('unmount-r1').click();
    });

    expect(XSta.has('root1')).toBe(false);
    expect(XSta.has('root2')).toBe(true);

    act(() => {
      screen.getByTestId('unmount-r2').click();
    });

    expect(XSta.has('root2')).toBe(false);
  });

  it('should support primitive values', () => {
    function App() {
      useXRoot('counter', 42);
      const [count] = useXState('counter');
      return <div data-testid="count">{count}</div>;
    }

    render(<App />);
    expect(screen.getByTestId('count').textContent).toBe('42');
  });

  it('should support array state', () => {
    function App() {
      useXRoot('items', [1, 2, 3]);
      const [items] = useXState<number[]>('items');
      return <div data-testid="items">{items.join(',')}</div>;
    }

    render(<App />);
    expect(screen.getByTestId('items').textContent).toBe('1,2,3');
  });
});
