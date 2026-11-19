import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GeographicComboboxes } from './GeographicComboboxes';
import { ocorrenciasService } from '../../services/ocorrenciasService';

describe('selecção geográfica dependente', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('carrega opções reais por nível e limpa distritos e descendentes ao trocar de província', async () => {
    const options = {
      provincias: [{ id: 1, nome: 'Sofala' }, { id: 2, nome: 'Gaza' }],
      distritos: [{ id: 10, nome: 'Beira' }],
      municipios: [], postos_administrativos: [], bairros: [], quarteiroes: [],
    };
    vi.spyOn(ocorrenciasService, 'opcoesGeograficas').mockImplementation(async type => options[type] || []);
    const Harness = () => {
      const [value, setValue] = useState({});
      return <GeographicComboboxes value={value} onChange={setValue} />;
    };
    render(<Harness />);

    await screen.findByRole('option', { name: 'Sofala' });
    fireEvent.change(screen.getByLabelText('Província'), { target: { value: '1' } });
    await screen.findByRole('option', { name: 'Beira' });
    fireEvent.change(screen.getByLabelText('Distrito'), { target: { value: '10' } });
    expect(screen.getByLabelText('Distrito').value).toBe('10');

    fireEvent.change(screen.getByLabelText('Província'), { target: { value: '2' } });
    await waitFor(() => expect(screen.getByLabelText('Distrito').value).toBe(''));
    expect(screen.getByLabelText('Município').value).toBe('');
  });
});
