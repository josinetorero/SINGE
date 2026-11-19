import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistarOcorrencia } from './RegistarOcorrencia';
import { operadorService } from '../../services/operadorService';
import { evidenciasService } from '../../services/evidenciasService';
import { ApiError, ValidationError } from '../../services/api';

vi.mock('../../services/operadorService', () => ({
  operadorService: { registarOcorrencia: vi.fn() },
}));
vi.mock('../../services/evidenciasService', () => ({
  evidenciasService: { anexar: vi.fn() },
}));

// ---------- Helpers ----------
const TYPES = [{ id: 5, nome: 'Inundação', ativo: true }];

function renderForm(overrides = {}) {
  const onCreated = vi.fn();
  const setPage = vi.fn();
  render(
    <RegistarOcorrencia
      types={TYPES}
      onCreated={onCreated}
      setPage={setPage}
      {...overrides}
    />
  );
  return { onCreated, setPage };
}

function fillField(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillRequiredFields() {
  fillField('Tipo de ocorrência', '5');
  fillField('Título', 'Cheia');
  fillField('Descrição detalhada', 'Subida rápida do rio.');
  fillField('Localização', 'Beira');
  fillField('Origem da informação', 'telefone');
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Registar ocorrência' }));
}

// ---------- Testes ----------
describe('RegistarOcorrencia (Operador)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  describe('submissão válida', () => {
    it('envia os campos aceites pela API e não escolhe o autor do registo', async () => {
      operadorService.registarOcorrencia.mockResolvedValue({ id: 44, titulo: 'Cheia' });

      const { onCreated, setPage } = renderForm();
      fillRequiredFields();
      submit();

      await waitFor(() => expect(operadorService.registarOcorrencia).toHaveBeenCalledOnce());

      const payload = operadorService.registarOcorrencia.mock.calls[0][0];

      expect(payload).toEqual(
        expect.objectContaining({
          tipo_ocorrencia_id: 5,
          titulo: 'Cheia',
          localizacao: 'Beira',
          origem: 'telefone',
        })
      );
      // O autor é decidido pela sessão no backend — nunca pelo cliente
      expect(payload).not.toHaveProperty('utilizador_id');
      expect(onCreated).toHaveBeenCalledWith({ id: 44, titulo: 'Cheia' }, false);
      expect(setPage).toHaveBeenCalledWith('ocorrencias');
    });

    it('anexa a evidência e não sinaliza falha quando o upload corre bem', async () => {
      operadorService.registarOcorrencia.mockResolvedValue({ id: 44 });
      evidenciasService.anexar.mockResolvedValue({ id: 1 });

      const { onCreated } = renderForm();
      fillRequiredFields();

      const file = new File(['fake'], 'foto.jpg', { type: 'image/jpeg' });
      fireEvent.change(screen.getByLabelText(/Evidência/i), {
        target: { files: [file] },
      });
      submit();

      await waitFor(() => expect(evidenciasService.anexar).toHaveBeenCalledOnce());
      expect(evidenciasService.anexar).toHaveBeenCalledWith(44, file);
      expect(onCreated).toHaveBeenCalledWith({ id: 44 }, false);
    });
  });

  describe('falhas recuperáveis', () => {
    it('sinaliza evidência falhada mas continua a criar a ocorrência', async () => {
      operadorService.registarOcorrencia.mockResolvedValue({ id: 44 });
      evidenciasService.anexar.mockRejectedValue(new Error('upload falhou'));

      const { onCreated } = renderForm();
      fillRequiredFields();

      fireEvent.change(screen.getByLabelText(/Evidência/i), {
        target: { files: [new File(['x'], 'foto.jpg', { type: 'image/jpeg' })] },
      });
      submit();

      await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
      expect(onCreated).toHaveBeenCalledWith({ id: 44 }, true);
    });

    it('mostra erros de validação devolvidos pelo backend', async () => {
      operadorService.registarOcorrencia.mockRejectedValue(
        new ValidationError('Dados inválidos', { titulo: 'Título inválido' })
      );

      renderForm();
      fillRequiredFields();
      submit();

      expect(await screen.findByText('Título inválido')).toBeInTheDocument();
    });

    it('mostra mensagem específica quando o utilizador não tem autorização (403)', async () => {
      operadorService.registarOcorrencia.mockRejectedValue(new ApiError('Forbidden', 403));

      renderForm();
      fillRequiredFields();
      submit();

      expect(
        await screen.findByRole('alert')
      ).toHaveTextContent(/não tem autorização para registar ocorrências institucionais/i);
    });
  });

  describe('estado do formulário', () => {
    it('desactiva o submit enquanto types está vazio', () => {
      renderForm({ types: [] });
      expect(screen.getByRole('button', { name: 'Registar ocorrência' })).toBeDisabled();
    });

    it('limpa o formulário após um registo bem-sucedido', async () => {
      operadorService.registarOcorrencia.mockResolvedValue({ id: 44 });
      renderForm();
      fillRequiredFields();
      submit();

      await waitFor(() => expect(operadorService.registarOcorrencia).toHaveBeenCalled());

      // Após sucesso, o título deve estar vazio novamente
      expect(screen.getByLabelText('Título')).toHaveValue('');
    });
  });
});