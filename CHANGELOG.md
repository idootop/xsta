## 3.0.0

- **Breaking**: Complete rewrite of XSta v3 with simplified API and improved architecture.
- **Added**: `createXStore` - New store creation API for managing state.
- **Added**: `useXState` - Enhanced state hook with improved setState functionality.
- **Added**: `useXRoot` - New hook for managing the lifecycle of state.
- **Added**: `useXComputed` - New hook for computed values based on store state.
- **Added**: `XMemo` - Component wrapper for memoized rendering with value transformation support.
- **Added**: `XWatch` - Component wrapper for watching state changes with value transformation support.
- **Added**: `useCleanup` - Fix for React StrictMode compatibility issues.
- **Added**: Comprehensive test suite with Vitest configuration covering all state management features.
- **Improved**: Library remains ultra-lightweight at less than 200 lines of code.
- **Changed**: Removed example folder from repository to reduce bundle size.
- **Changed**: Migrated from Prettier to Biome for code formatting.
- **Changed**: Updated documentation structure with separate English and Chinese docs.
- **Changed**: Updated license attribution and package description for better clarity.

## 2.2.0

- **Fixed**: Disallow static ReactNode, enforce builder-only children for XConsumer.

## 2.0.0

- **Added**: XStaManager - provides a unified interface for basic state management operations.
- **Changed**: Notification sent to components to rebuild when their associated state is deleted, improving reactivity.

## 1.0.2

- **Added**: Support for implicit state updates with automatic component re-rendering.

## 1.0.1

- **Improved**: Example code demonstrating how to access and update global state from external functions.

## 1.0.0

- Initial release of the state management library.
