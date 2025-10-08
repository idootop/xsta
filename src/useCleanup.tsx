/** biome-ignore-all lint/correctness/useHookAtTopLevel: just do it */
import { useEffect, useRef } from 'react';

export function useCleanup(cleanup: () => void) {
  // @ts-expect-error
  if (process.env.NODE_ENV === 'production') {
    return useEffect(() => cleanup, []); // react strict mode only enable in development
  }
  const refs = useRef({ render: 0, mount: 0, strictMode: false });
  if (refs.current.mount < 1) {
    refs.current.render++;
    if (refs.current.render > 1) refs.current.strictMode = true;
  }
  useEffect(() => {
    refs.current.mount++;
    return () => {
      if (refs.current.strictMode && refs.current.mount !== 2) {
        return; // in react strict mode, we need to cleanup after the second mount
      }
      cleanup();
    };
  }, []);
}
