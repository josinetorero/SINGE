import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

function ThemeControls() {
  const { theme, toggleTheme, setAccountId } = useTheme();
  return <div>
    <span>{theme}</span>
    <button onClick={toggleTheme}>Alternar tema</button>
    <button onClick={() => setAccountId(1)}>Conta 1</button>
    <button onClick={() => setAccountId(2)}>Conta 2</button>
    <button onClick={() => setAccountId(null)}>Sair</button>
  </div>;
}

describe('preferência de tema por conta', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('mantém a escolha do login na primeira conta e não a transfere para outra conta', () => {
    render(<ThemeProvider><ThemeControls /></ThemeProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Alternar tema' }));
    expect(screen.getByText('dark')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Conta 1' }));
    expect(screen.getByText('dark')).toBeInTheDocument();
    expect(localStorage.getItem('singe_theme:user-1')).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    fireEvent.click(screen.getByRole('button', { name: 'Conta 2' }));
    expect(screen.getByText('light')).toBeInTheDocument();
    expect(localStorage.getItem('singe_theme:user-2')).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    fireEvent.click(screen.getByRole('button', { name: 'Conta 1' }));
    expect(screen.getByText('dark')).toBeInTheDocument();
  });
});
