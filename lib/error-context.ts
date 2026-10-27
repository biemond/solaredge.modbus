import { inspect } from 'util';

// EventEmitter does not await async listeners. Preserve rejection behavior, but
// give the SDK a real Error instead of an object that becomes "[object Object]".
export default function withErrorContext(context: string, task: () => Promise<void>): () => Promise<void> {
  return async () => {
    try {
      await task();
    } catch (reason) {
      const details = inspect(reason, {
        depth: 4, maxArrayLength: 16, maxStringLength: 2000, customInspect: false, getters: false,
      });
      const error = new Error(`${context}: ${reason instanceof Error ? reason.message : details}`);
      Object.defineProperty(error, 'cause', { value: reason });
      if (reason instanceof Error && reason.stack) error.stack += `\nCaused by: ${reason.stack}`;
      throw error;
    }
  };
}
