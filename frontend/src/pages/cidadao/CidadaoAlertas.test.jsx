import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CidadaoAlertas } from './CidadaoAlertas';
import { CidadaoInformacoes } from './CidadaoInformacoes';

/* ─── Factory de fixtures ─────────────────────────────────── */
const buildAlert = (overrides = {}) => ({
  id: 1,
  titulo: 'Aviso de inundação',
  tipo_perigo: 'Inundação',
  severidade: 'alta',
  estado: 'publicado',
  activo: true,
  fonte: 'Autoridade competente',
  area_geografica: 'Sofala',
  descricao: 'Elevação do nível do rio.',
  recomendacoes: 'Evite a margem.',
  data_publicacao: '2025-01-15T10:00:00Z',
  localizacao: { provincia: 'Sofala', distrito: 'Beira' },
  ...overrides,
});

const buildProps = () => ({
  setPage: vi.fn(),
  setSelectedAlerta: vi.fn(),
  onRefresh: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
});

/* ══════════════════════════════════════════════════════════ */
/*                       CidadaoAlertas                       */
/* ══════════════════════════════════════════════════════════ */
describe('CidadaoAlertas', () => {

  describe('renderização de conteúdo', () => {
    it('apresenta título, descrição, recomendações e fonte do alerta', () => {
      render(<CidadaoAlertas alertas={[buildAlert()]} {...buildProps()} />);

      expect(screen.getByText('Aviso de inundação')).toBeInTheDocument();
      expect(screen.getByText(/Elevação do nível do rio/)).toBeInTheDocument();
      expect(screen.getByText(/Evite a margem/)).toBeInTheDocument();
      expect(screen.getByText(/Autoridade competente/)).toBeInTheDocument();
    });

    it('apresenta múltiplos alertas distintos na lista', () => {
      render(
        <CidadaoAlertas
          alertas={[
            buildAlert({ id: 1 }),
            buildAlert({ id: 2, titulo: 'Aviso de ciclone', tipo_perigo: 'Ciclone' }),
          ]}
          {...buildProps()}
        />
      );

      expect(screen.getByText('Aviso de inundação')).toBeInTheDocument();
      expect(screen.getByText('Aviso de ciclone')).toBeInTheDocument();
    });

    it('sinaliza alertas expirados sem os classificar como activos', () => {
      render(
        <CidadaoAlertas
          alertas={[
            buildAlert({ id: 1 }),
            buildAlert({ id: 2, activo: false }),
          ]}
          {...buildProps()}
        />
      );

      expect(screen.getAllByText('Aviso de inundação')).toHaveLength(2);
      expect(screen.getByText('Fora do período de validade')).toBeInTheDocument();
    });

    it('sinaliza alertas encerrados', () => {
      render(
        <CidadaoAlertas
          alertas={[buildAlert({ estado: 'encerrado' })]}
          {...buildProps()}
        />
      );

      expect(screen.getByText('Encerrado')).toBeInTheDocument();
    });
  });

  describe('estados de UI', () => {
    it('mostra estado de loading acessível', () => {
      render(<CidadaoAlertas alertas={[]} loading {...buildProps()} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('mostra mensagem de erro com role="alert" e permite tentar novamente', () => {
      const props = buildProps();
      render(<CidadaoAlertas alertas={[]} error="Falha de rede" {...props} />);

      expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede');

      fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));
      expect(props.onRefresh).toHaveBeenCalledTimes(1);
    });

    it('mostra empty state quando não há alertas', () => {
      render(<CidadaoAlertas alertas={[]} {...buildProps()} />);
      expect(screen.getByText(/Não há alertas publicados/i)).toBeInTheDocument();
    });
  });

  describe('interacção', () => {
    it('envia o alerta seleccionado e navega para o detalhe', () => {
      const alert1 = buildAlert({ id: 1 });
      const alert2 = buildAlert({ id: 2, titulo: 'Outro alerta' });
      const props = buildProps();

      render(<CidadaoAlertas alertas={[alert1, alert2]} {...props} />);

      fireEvent.click(screen.getAllByRole('button', { name: /ver detalhe/i })[0]);

      expect(props.setSelectedAlerta).toHaveBeenCalledWith(alert1);
      expect(props.setSelectedAlerta).toHaveBeenCalledTimes(1);
      expect(props.setPage).toHaveBeenCalledWith('detalhe-alerta');
      expect(props.setPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('filtros', () => {
    it('filtra por tipo de perigo', () => {
      render(
        <CidadaoAlertas
          alertas={[
            buildAlert({ id: 1, tipo_perigo: 'Inundação' }),
            buildAlert({ id: 2, tipo_perigo: 'Ciclone', titulo: 'Aviso de ciclone' }),
          ]}
          {...buildProps()}
        />
      );

      const [, typeSelect] = screen.getAllByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'Ciclone' } });

      expect(screen.queryByText('Aviso de inundação')).not.toBeInTheDocument();
      expect(screen.getByText('Aviso de ciclone')).toBeInTheDocument();
    });

    it('filtra por severidade', () => {
      render(
        <CidadaoAlertas
          alertas={[
            buildAlert({ id: 1, severidade: 'alta' }),
            buildAlert({ id: 2, severidade: 'baixa', titulo: 'Aviso menor' }),
          ]}
          {...buildProps()}
        />
      );

      const [, severitySelect] = screen.getAllByRole('combobox');
      fireEvent.change(severitySelect, { target: { value: 'baixa' } });

      expect(screen.queryByText('Aviso de inundação')).not.toBeInTheDocument();
      expect(screen.getByText('Aviso menor')).toBeInTheDocument();
    });

    it('permite limpar os filtros aplicados', () => {
      render(
        <CidadaoAlertas
          alertas={[
            buildAlert({ id: 1, severidade: 'alta' }),
            buildAlert({ id: 2, severidade: 'baixa', titulo: 'Aviso menor' }),
          ]}
          {...buildProps()}
        />
      );

      const [, severitySelect] = screen.getAllByRole('combobox');
      fireEvent.change(severitySelect, { target: { value: 'baixa' } });
      expect(screen.queryByText('Aviso de inundação')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /limpar/i }));

      expect(screen.getByText('Aviso de inundação')).toBeInTheDocument();
      expect(screen.getByText('Aviso menor')).toBeInTheDocument();
    });
  });
});

/* ══════════════════════════════════════════════════════════ */
/*                    CidadaoInformacoes                      */
/* ══════════════════════════════════════════════════════════ */
describe('CidadaoInformacoes', () => {
  it('só apresenta recomendações provenientes de alertas actualmente válidos', () => {
    render(
      <CidadaoInformacoes
        alertas={[
          buildAlert({ id: 1 }),
          buildAlert({ id: 2, titulo: 'Alerta expirado', activo: false }),
        ]}
      />
    );

    expect(screen.getByText('Aviso de inundação')).toBeInTheDocument();
    expect(screen.queryByText('Alerta expirado')).not.toBeInTheDocument();
  });
});