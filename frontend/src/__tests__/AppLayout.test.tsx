import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

import AppLayout from '@/components/layout/AppLayout';

describe('AppLayout', () => {
  it('renders brand and nav links', () => {
    render(<AppLayout><div>child</div></AppLayout>);
    expect(screen.getByText('Cardigo')).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Boards')).toBeTruthy();
    expect(screen.getByText('child')).toBeTruthy();
  });
});