/**
 * SINGE - Validação de Utilizadores
 * Regras puras e testáveis conforme especificações RF02, RNF02 e RNF05.
 */

/**
 * [RNF02] Perfis disponíveis no SINGE definidos numa única constante
 */
export const PERFIS = [
  'Cidadão',
  'Operador',
  'Equipa de Resposta',
  'Gestor',
  'Administrador',
];

/**
 * [Assumida] Nome obrigatório, 3 a 80 caracteres após trim
 */
export function validarNome(nome) {
  const val = (nome ?? '').trim();
  if (!val) {
    return 'O nome completo é obrigatório.';
  }
  if (val.length < 3 || val.length > 80) {
    return 'O nome deve ter entre 3 e 80 caracteres.';
  }
  return null;
}

/**
 * [Assumida] Email válido e único sem distinguir maiúsculas
 */
export function validarEmail(email, utilizadores = [], emailAtual = null) {
  const val = (email ?? '').trim();
  if (!val) {
    return 'O email institucional é obrigatório.';
  }

  // Regex para formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(val)) {
    return 'Introduza um endereço de email válido.';
  }

  if (Array.isArray(utilizadores)) {
    const normalized = val.toLowerCase();
    const currentNormalized = (emailAtual ?? '').trim().toLowerCase();

    const exists = utilizadores.some((u) => {
      const uEmail = (u?.email ?? '').trim().toLowerCase();
      if (!uEmail) return false;
      if (currentNormalized && uEmail === currentNormalized) return false;
      return uEmail === normalized;
    });

    if (exists) {
      return 'Este email já se encontra registado no sistema.';
    }
  }

  return null;
}

/**
 * [RNF02] Perfil obrigatório pertencente à constante PERFIS
 */
export function validarPerfil(perfil) {
  if (!perfil) {
    return 'O perfil RBAC é obrigatório.';
  }
  if (!PERFIS.includes(perfil)) {
    return 'Perfil inválido. Selecione um perfil autorizado.';
  }
  return null;
}

/**
 * [Assumida] Palavra-passe com pelo menos 8 caracteres, letra e número
 */
export function validarPassword(password, isEditing = false) {
  // Ao editar utilizador existente, palavra-passe é opcional (mantém a atual se vazia)
  if (isEditing && (!password || password.length === 0)) {
    return null;
  }

  if (!password) {
    return 'A palavra-passe é obrigatória.';
  }

  if (password.length < 8) {
    return 'A palavra-passe deve ter pelo menos 8 caracteres.';
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return 'A palavra-passe deve conter pelo menos uma letra e um número.';
  }

  return null;
}

/**
 * Validação agregada de um utilizador
 * @returns {Record<string, string>} Mapa de { [campo]: mensagem }
 */
export function validarUtilizador(dados = {}, utilizadores = [], isEditing = false) {
  const errors = {};

  const nomeErr = validarNome(dados.nome);
  if (nomeErr) errors.nome = nomeErr;

  const emailErr = validarEmail(
    dados.email,
    utilizadores,
    dados.emailAtual || (isEditing ? dados.emailOriginal : null)
  );
  if (emailErr) errors.email = emailErr;

  const perfilErr = validarPerfil(dados.perfil);
  if (perfilErr) errors.perfil = perfilErr;

  const passErr = validarPassword(dados.password, isEditing);
  if (passErr) errors.password = passErr;

  return errors;
}

