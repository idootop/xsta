import { beforeEach, describe, expect, it } from 'vitest';

import { XSta } from '../src/index.js';

describe('XSta', () => {
  beforeEach(() => {
    XSta.clear();
  });

  it('should set and get state', () => {
    XSta.set('counter', 0);
    expect(XSta.get('counter')).toEqual(0);
  });

  it('should check if key exists', () => {
    XSta.set('test', { value: 1 });
    expect(XSta.has('test')).toBe(true);
    expect(XSta.has('nonexistent')).toBe(false);
  });

  it('should delete state by key', () => {
    XSta.set('temp', { data: 'test' });
    expect(XSta.has('temp')).toBe(true);
    XSta.delete('temp');
    expect(XSta.has('temp')).toBe(false);
  });

  it('should list all keys', () => {
    XSta.set('key1', { value: 1 });
    XSta.set('key2', { value: 2 });
    XSta.set('key3', { value: 3 });
    expect(XSta.keys()).toEqual(['key1', 'key2', 'key3']);
  });

  it('should clear all states', () => {
    XSta.set('key1', { value: 1 });
    XSta.set('key2', { value: 2 });
    expect(XSta.keys().length).toBe(2);
    XSta.clear();
    expect(XSta.keys().length).toBe(0);
  });

  it('should throw error when getting nonexistent key', () => {
    expect(() => XSta.get('nonexistent')).toThrow(
      'XSta.get: nonexistent not found',
    );
  });

  it('should update state with function', () => {
    XSta.set('counter', { count: 0 });
    XSta.set('counter', (prev: { count: number }) => ({
      count: prev.count + 1,
    }));
    expect(XSta.get('counter')).toEqual({ count: 1 });
  });

  it('should merge state', () => {
    XSta.set('user', { name: 'Alice', age: 25 });
    XSta.set('user', { age: 26 });
    expect(XSta.get('user')).toEqual({ name: 'Alice', age: 26 });
  });

  it('should update state the immer way', () => {
    XSta.set('user', { name: 'Alice', age: 25 });
    XSta.set('user', (prev: any) => {
      prev.age++;
      prev.name = 'Bob';
    });
    expect(XSta.get('user')).toEqual({ name: 'Bob', age: 26 });
  });

  it('should notify subscribers on state change', () => {
    let callCount = 0;
    XSta.set('counter', { count: 0 });

    const unsubscribe = XSta.subscribe('counter', () => {
      callCount++;
    });

    XSta.set('counter', { count: 1 });
    expect(callCount).toBe(1);

    XSta.set('counter', { count: 2 });
    expect(callCount).toBe(2);

    unsubscribe();
  });

  it('should not notify subscribers when silent option is true', () => {
    let callCount = 0;
    XSta.set('counter', { count: 0 });

    XSta.subscribe('counter', () => {
      callCount++;
    });

    XSta.set('counter', { count: 1 }, { silent: true });
    expect(callCount).toBe(0);
  });

  it('should unsubscribe correctly', () => {
    let callCount = 0;
    XSta.set('counter', { count: 0 });

    const unsubscribe = XSta.subscribe('counter', () => {
      callCount++;
    });

    XSta.set('counter', { count: 1 });
    expect(callCount).toBe(1);

    unsubscribe();
    XSta.set('counter', { count: 2 });
    expect(callCount).toBe(1); // Should not increment
  });

  it('should support multiple subscribers', () => {
    let callCount1 = 0;
    let callCount2 = 0;
    XSta.set('counter', { count: 0 });

    const unsubscribe1 = XSta.subscribe('counter', () => {
      callCount1++;
    });
    const unsubscribe2 = XSta.subscribe('counter', () => {
      callCount2++;
    });

    XSta.set('counter', { count: 1 });
    expect(callCount1).toBe(1);
    expect(callCount2).toBe(1);

    unsubscribe1();
    XSta.set('counter', { count: 2 });
    expect(callCount1).toBe(1); // Should not increment
    expect(callCount2).toBe(2); // Should increment

    unsubscribe2();
  });
});
