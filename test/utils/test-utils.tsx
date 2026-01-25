import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { StoreProvider } from '@/lib/store';

/**
 * Custom render function that wraps components with StoreProvider.
 * Use this for component tests that need access to the store.
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <StoreProvider>{children}</StoreProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with our custom version
export { customRender as render };
