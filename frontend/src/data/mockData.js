/**
 * SINGE — Dados de Demonstração oficiais baseados no Protótipo Visual
 */

export const OCORRENCIAS = [
  { ref:'OC-2025-0142', tipo:'Ciclone', titulo:'Ciclone tropical Filipe', descricao:'Ventos fortes e chuvas intensas afectam a região costeira. População em risco elevado.', provincia:'Sofala', distrito:'Beira', localidade:'Macurungo', lat:-19.84, lng:34.84, data:'2025-01-15 08:30', estado:'Em análise', prioridade:'Crítico', fonte:'INE — Delegação Sofala', afectados:1240, risco:'Muito elevado', responsavel:'Ana Sitoe' },
  { ref:'OC-2025-0141', tipo:'Cheia', titulo:'Cheia do rio Búzi', descricao:'Subida do nível do rio Búzi afecta comunidades ribeirinhas.', provincia:'Sofala', distrito:'Búzi', localidade:'Centro', lat:-19.96, lng:34.40, data:'2025-01-15 06:15', estado:'Validada', prioridade:'Alto', fonte:'DPCC Sofala', afectados:480, risco:'Elevado', responsavel:'Ana Sitoe' },
  { ref:'OC-2025-0140', tipo:'Surto de doença', titulo:'Surto de cólera', descricao:'Casos suspeitos de cólera em bairros periféricos.', provincia:'Cabo Delgado', distrito:'Pemba', localidade:'Cariacó', lat:-12.97, lng:40.53, data:'2025-01-14 18:45', estado:'Em resposta', prioridade:'Alto', fonte:'DPS Cabo Delgado', afectados:87, risco:'Elevado', responsavel:'Sara Mabote' },
  { ref:'OC-2025-0139', tipo:'Incêndio', titulo:'Incêndio florestal', descricao:'Incêndio em área florestal próxima de comunidades agrícolas.', provincia:'Manica', distrito:'Sussundenga', localidade:'Rotanda', lat:-19.30, lng:33.20, data:'2025-01-14 14:20', estado:'Em análise', prioridade:'Médio', fonte:'Bombeiros Voluntários', afectados:0, risco:'Moderado', responsavel:'Ana Sitoe' },
  { ref:'OC-2025-0138', tipo:'Deslizamento', titulo:'Deslizamento de terra', descricao:'Deslizamento bloqueia estrada de acesso.', provincia:'Zambézia', distrito:'Alto Molócuè', localidade:'Nauela', lat:-15.60, lng:37.50, data:'2025-01-13 11:10', estado:'Validada', prioridade:'Médio', fonte:'ANEP', afectados:35, risco:'Moderado', responsavel:'Sara Mabote' },
  { ref:'OC-2025-0137', tipo:'Acidente', titulo:'Acidente rodoviário', descricao:'Colisão entre autocarro e camião, várias vítimas.', provincia:'Maputo', distrito:'Marracuene', localidade:'Bobole', lat:-25.72, lng:32.75, data:'2025-01-13 07:55', estado:'Resolvida', prioridade:'Baixo', fonte:'PRM', afectados:22, risco:'Baixo', responsavel:'Ana Sitoe' },
  { ref:'OC-2025-0136', tipo:'Seca', titulo:'Seca prolongada', descricao:'Escassez de água e pastagens afecta comunidades.', provincia:'Gaza', distrito:'Chicualacuala', localidade:'Centro', lat:-22.08, lng:31.68, data:'2025-01-12 16:30', estado:'Em resposta', prioridade:'Alto', fonte:'DPCC Gaza', afectados:2100, risco:'Elevado', responsavel:'Sara Mabote' },
  { ref:'OC-2025-0135', tipo:'Cheia', titulo:'Inundação urbana', descricao:'Inundação em bairro residencial após chuvas intensas.', provincia:'Nampula', distrito:'Nampula', localidade:'Muhala', lat:-15.12, lng:39.26, data:'2025-01-12 09:20', estado:'Nova', prioridade:null, fonte:'Cidadão', afectados:150, risco:'A avaliar', responsavel:'Ana Sitoe' },
];

export const EQUIPAS = [
  { id:'EQ-001', nome:'Equipa Alfa — Busca e Salvamento', tipo:'Busca e Salvamento', responsavel:'Cmt. Alberto Nhaca', estado:'Em missão', missao:'MS-2025-0031', localizacao:'Beira, Sofala', membros:12 },
  { id:'EQ-002', nome:'Equipa Bravo — Saúde Pública', tipo:'Saúde', responsavel:'Dra. Fátima Mussa', estado:'Disponível', missao:null, localizacao:'Pemba, Cabo Delgado', membros:8 },
  { id:'EQ-003', nome:'Equipa Charlie — Logística', tipo:'Logística', responsavel:'Eng. Rui Macuácua', estado:'Em missão', missao:'MS-2025-0032', localizacao:'Xai-Xai, Gaza', membros:15 },
  { id:'EQ-004', nome:'Equipa Delta — Protecção Civil', tipo:'Protecção Civil', responsavel:'Insp. Sara Mabote', estado:'Indisponível', missao:null, localizacao:'Maputo', membros:10 },
  { id:'EQ-005', nome:'Equipa Echo — Avaliação', tipo:'Avaliação de Danos', responsavel:'Téc. Paulo Cossa', estado:'Disponível', missao:null, localizacao:'Nampula', membros:6 },
];

export const MISSOES = [
  { ref:'MS-2025-0031', ocorrenciaRef:'OC-2025-0142', prioridade:'Crítico', equipa:'EQ-001', dataInicio:'2025-01-15 10:00', estado:'Em curso', objetivos:'Evacuação de comunidades costeiras e distribuição de ajuda humanitária.', instrucoes:'Coordenar com DPCC local. Prioridade a famílias com crianças e idosos.', progresso:[{data:'15/01 10:00', txt:'Missão iniciada'},{data:'15/01 12:30', txt:'Equipa chegou ao local'}] },
  { ref:'MS-2025-0032', ocorrenciaRef:'OC-2025-0136', prioridade:'Alto', equipa:'EQ-003', dataInicio:'2025-01-13 08:00', estado:'Em curso', objetivos:'Distribuição de água e alimentos na província de Gaza.', instrucoes:'Coordenar com autoridades locais. Registar famílias beneficiárias.', progresso:[{data:'13/01 08:00', txt:'Missão atribuída'}] },
  { ref:'MS-2025-0030', ocorrenciaRef:'OC-2025-0140', prioridade:'Alto', equipa:'EQ-002', dataInicio:'2025-01-15 14:00', estado:'Atribuída', objetivos:'Avaliação epidemiológica e apoio sanitário.', instrucoes:'Recolher amostras e reportar casos suspeitos diariamente.', progresso:[] },
  { ref:'MS-2025-0029', ocorrenciaRef:'OC-2025-0137', prioridade:'Baixo', equipa:'EQ-004', dataInicio:'2025-01-13 09:00', estado:'Concluída', objetivos:'Assistência às vítimas do acidente.', instrucoes:'—', progresso:[{data:'13/01 15:00', txt:'Missão concluída'}] },
];

export const UTILIZADORES = [
  { id:'US-001', nome:'Ana Sitoe',       email:'ana.sitoe@singe.gov.mz',       perfil:'Operador',      estado:'Activo',   registo:'2024-03-12' },
  { id:'US-002', nome:'Carlos Mabunda',  email:'carlos.mabunda@singe.gov.mz',  perfil:'Coordenador',   estado:'Activo',   registo:'2024-01-08' },
  { id:'US-003', nome:'João Nhampossa',  email:'joao.nhampossa@singe.gov.mz',  perfil:'Agente',        estado:'Activo',   registo:'2024-05-22' },
  { id:'US-004', nome:'Fátima Mussa',    email:'fatima.mussa@singe.gov.mz',    perfil:'Coordenador',   estado:'Activo',   registo:'2023-11-15' },
  { id:'US-005', nome:'Rui Macuácua',    email:'rui.macuacua@singe.gov.mz',    perfil:'Agente',        estado:'Inactivo', registo:'2023-09-04' },
  { id:'US-006', nome:'Sara Mabote',     email:'sara.mabote@singe.gov.mz',     perfil:'Operador',      estado:'Activo',   registo:'2024-02-19' },
  { id:'US-007', nome:'Alberto Nhaca',   email:'alberto.nhaca@singe.gov.mz',   perfil:'Agente',        estado:'Activo',   registo:'2024-06-30' },
  { id:'US-008', nome:'Pedro Chirindza', email:'pedro.chirindza@singe.gov.mz', perfil:'Administrador', estado:'Activo',   registo:'2023-08-01' },
];

export const HISTORICO = [
  { data:'15/01/2025 09:10', user:'Sistema',         acao:'Avaliação de prioridade', entidade:'OC-2025-0142', desc:'Prioridade calculada: Crítico', reg:'OC-2025-0142' },
  { data:'15/01/2025 08:45', user:'Ana Sitoe',       acao:'Validação',               entidade:'OC-2025-0141', desc:'Ocorrência validada',           reg:'OC-2025-0141' },
  { data:'15/01/2025 08:30', user:'Ana Sitoe',       acao:'Registo',                 entidade:'OC-2025-0142', desc:'Nova ocorrência registada',     reg:'OC-2025-0142' },
  { data:'15/01/2025 07:15', user:'Carlos Mabunda',  acao:'Atribuição',              entidade:'MS-2025-0031', desc:'Missão atribuída à Equipa Alfa', reg:'MS-2025-0031' },
  { data:'14/01/2025 18:45', user:'João Nhampossa',  acao:'Actualização',            entidade:'MS-2025-0032', desc:'Progresso reportado',           reg:'MS-2025-0032' },
  { data:'14/01/2025 16:20', user:'Sistema',         acao:'Notificação',             entidade:'MS-2025-0030', desc:'Alerta crítico enviado',        reg:'MS-2025-0030' },
  { data:'14/01/2025 14:10', user:'Pedro Chirindza', acao:'Criação',                 entidade:'US-008',       desc:'Novo utilizador administrador', reg:'US-008' },
];

export const CIDADAO_OCORRENCIAS = [
  { ref:'CID-2025-0038', tipo:'Cheia', titulo:'Água a subir na rua principal', descricao:'Água a subir rapidamente na Rua da Resistência, junto à escola primária. Famílias em risco.', provincia:'Sofala', distrito:'Beira', localidade:'Macurungo', lat:-19.84, lng:34.84, data:'2025-01-15 07:45', estado:'Em análise', prioridade:'Alto', afectados:0, risco:'Elevado', ultimaActualizacao:'15/01/2025 09:30', evidencias:2 },
  { ref:'CID-2025-0035', tipo:'Incêndio', titulo:'Fumo intenso junto ao mercado', descricao:'Fumo intenso avistado nas traseiras do Mercado Central. Bombeiros ainda não chegaram.', provincia:'Sofala', distrito:'Beira', localidade:'Centro', lat:-19.83, lng:34.85, data:'2025-01-10 16:20', estado:'Resolvida', prioridade:'Baixo', afectados:0, risco:'Controlado', ultimaActualizacao:'11/01/2025 08:00', evidencias:1 },
  { ref:'CID-2025-0030', tipo:'Acidente', titulo:'Acidente na EN6', descricao:'Colisão entre duas viaturas ligeiras. Não há feridos graves visíveis.', provincia:'Sofala', distrito:'Beira', localidade:'Estrada Nacional 6', lat:-19.86, lng:34.87, data:'2025-01-05 11:10', estado:'Encerrada', prioridade:'Médio', afectados:0, risco:'Resolvido', ultimaActualizacao:'06/01/2025 14:20', evidencias:0 },
];

export const ALERTAS = [
  { id:'AL-001', titulo:'Alerta vermelho — Ciclone tropical Filipe', tipo:'Ciclone', regiao:'Sofala e Inhambane', nivel:'Crítico', data:'2025-01-15 08:00', validade:'Até 17/01/2025', descricao:'O ciclone tropical Filipe aproxima-se da costa moçambicana com ventos fortes e chuvas intensas. População deve procurar abrigo seguro.', recomendacoes:'Procure abrigo em local sólido. Evite zonas costeiras e ribeirinhas. Mantenha-se atento às actualizações oficiais.', entidade:'INAM — Instituto Nacional de Meteorologia', fonte:'Boletim meteorológico oficial', ativo:true },
  { id:'AL-002', titulo:'Alerta laranja — Chuvas fortes previstas', tipo:'Cheias', regiao:'Sofala e Zambézia', nivel:'Elevado', data:'2025-01-15 06:00', validade:'Até 18/01/2025', descricao:'Previsão de chuvas fortes nas próximas 72 horas. Risco de cheias em zonas ribeirinhas.', recomendacoes:'Evite zonas ribeirinhas. Prepare kit de emergência. Mantenha documentos em local seguro.', entidade:'INAM — Instituto Nacional de Meteorologia', fonte:'Boletim meteorológico', ativo:true },
  { id:'AL-003', titulo:'Aviso de surto de cólera', tipo:'Risco sanitário', regiao:'Cabo Delgado', nivel:'Elevado', data:'2025-01-14 18:00', validade:'Até 30/01/2025', descricao:'Casos suspeitos de cólera registados em bairros periféricos de Pemba.', recomendacoes:'Lave as mãos frequentemente. Consuma água tratada ou fervida. Procure unidade de saúde se tiver sintomas.', entidade:'MISAU — Ministério da Saúde', fonte:'Comunicado oficial', ativo:true },
  { id:'AL-004', titulo:'Informação preventiva — Época chuvosa', tipo:'Informativo', regiao:'Todo o país', nivel:'Informativo', data:'2025-01-10 09:00', validade:'Durante a época chuvosa', descricao:'Recomendações gerais para a época chuvosa 2024/2025.', recomendacoes:'Mantenha-se informado. Prepare a família. Conheça os pontos de abrigo próximos.', entidade:'INGD — Instituto Nacional de Gestão e Redução do Risco de Desastres', fonte:'Comunicado', ativo:true },
  { id:'AL-005', titulo:'Alerta amarelo — Ventos fortes em Maputo', tipo:'Tempestade', regiao:'Maputo', nivel:'Médio', data:'2025-01-08 14:00', validade:'Expirado em 10/01/2025', descricao:'Ventos fortes previstos para a cidade de Maputo.', recomendacoes:'Evite circular em zonas com árvores. Fixe objectos soltos.', entidade:'INAM', fonte:'Boletim meteorológico', ativo:false },
];

export const INFO_SEGURANCA = [
  { id:'IS-001', categoria:'Ciclones', icon:'Wind', titulo:'Preparação para ciclones',
    resumo:'Saiba como preparar-se antes, durante e depois de um ciclone.',
    conteudo:'Antes: Reforce portas e janelas, guarde documentos em saco impermeável, prepare kit de emergência, identifique abrigo próximo. Durante: Permaneça em local sólido, afaste-se de janelas, não saia até as autoridades confirmarem o fim do alerta. Depois: Verifique danos, evite linhas eléctricas caídas, ajude vizinhos vulneráveis, reporte situações de risco.' },
  { id:'IS-002', categoria:'Cheias', icon:'Waves', titulo:'Preparação para cheias e inundações',
    resumo:'Recomendações antes e durante situações de cheia.',
    conteudo:'Antes: Conheça zonas de risco, eleve móveis e objectos de valor, prepare kit de emergência. Durante: Evite atravessar água em movimento (pode chegar a 30 cm e ser suficiente para derrubar um adulto), procure pontos altos, afaste-se de zonas ribeirinhas. Depois: Não regresse a casa até ser autorizado, evite contacto com água estagnada.' },
  { id:'IS-003', categoria:'Incêndios', icon:'Flame', titulo:'Prevenção de incêndios',
    resumo:'Como prevenir e actuar em caso de incêndio.',
    conteudo:'Prevenção: Não deixe fogueiras sem vigilância, evite queimadas descontroladas, mantenha extintores em casa, não sobrecarregue tomadas eléctricas. Durante: Se o incêndio for pequeno, use extintor. Caso contrário, evacue imediatamente, mantenha-se rasteiro se houver fumo, chame as autoridades.' },
  { id:'IS-004', categoria:'Tempestades', icon:'CloudRain', titulo:'Segurança durante tempestades',
    resumo:'Como proteger-se durante trovoadas e ventos fortes.',
    conteudo:'Permaneça dentro de casa. Afaste-se de janelas e portas. Não utilize aparelhos eléctricos ligados à corrente. Se estiver na rua, procure abrigo em edifício sólido (nunca debaixo de árvores isoladas). Evite zonas descampadas.' },
  { id:'IS-005', categoria:'Riscos sanitários', icon:'Leaf', titulo:'Prevenção de doenças em emergências',
    resumo:'Como prevenir surtos de doenças em situações de emergência.',
    conteudo:'Lave as mãos frequentemente com água e sabão. Consuma apenas água tratada ou fervida. Evite contacto com água estagnada. Elimine criadouros de mosquitos. Cozinhe bem os alimentos. Procure unidade de saúde em caso de sintomas.' },
  { id:'IS-006', categoria:'Preparação familiar', icon:'Users', titulo:'Kit de emergência familiar',
    resumo:'O que deve ter sempre preparado em casa.',
    conteudo:'Água potável (mínimo 3 litros por pessoa/dia), alimentos não perecíveis, medicamentos de uso habitual, lanterna e pilhas, rádio a pilhas, documentos em saco impermeável, dinheiro em notas pequenas, roupa de muda, apito, lista de contactos de emergência.' },
  { id:'IS-007', categoria:'Evacuação', icon:'Navigation', titulo:'Evacuação e procura de abrigo',
    resumo:'Como evacuar em segurança e onde procurar abrigo.',
    conteudo:'Siga as instruções das autoridades. Leve apenas o essencial. Feche gás e electricidade. Avise vizinhos vulneráveis. Utilize rotas oficiais. Mantenha a calma. Não regresse até ser autorizado.' },
];

export const CIDADAO_NOTIFICACOES = [
  { id:'NT-001', tipo:'Confirmação', titulo:'Ocorrência submetida', desc:'A sua ocorrência CID-2025-0038 foi recebida pelo sistema.', data:'15/01/2025 07:45', lida:false, urg:'ok', ref:'CID-2025-0038' },
  { id:'NT-002', tipo:'Actualização', titulo:'A sua ocorrência está em análise', desc:'CID-2025-0038 passou para o estado "Em análise".', data:'15/01/2025 09:30', lida:false, urg:'info', ref:'CID-2025-0038' },
  { id:'NT-003', tipo:'Alerta', titulo:'Alerta vermelho em Sofala', desc:'Ciclone tropical Filipe aproxima-se. Tome precauções.', data:'15/01/2025 08:00', lida:false, urg:'error' },
  { id:'NT-004', tipo:'Resolução', titulo:'Ocorrência resolvida', desc:'CID-2025-0035 foi marcada como resolvida.', data:'11/01/2025 08:00', lida:true, urg:'ok', ref:'CID-2025-0035' },
];

export const USERS = {
  operador:      { nome:'Ana Sitoe',       email:'ana.sitoe@singe.gov.mz' },
  coordenador:   { nome:'Carlos Mabunda',  email:'carlos.mabunda@singe.gov.mz' },
  agente:        { nome:'João Nhampossa',  email:'joao.nhampossa@singe.gov.mz' },
  administrador: { nome:'Pedro Chirindza', email:'pedro.chirindza@singe.gov.mz' },
  cidadao:       { nome:'Maria João Tembe', email:'maria.tembe@exemplo.mz', telefone:'+258 84 000 0000', criadoEm:'20/11/2024' },
};

export const ROLE_LABEL = {
  operador: 'Operador',
  coordenador: 'Coordenador de Emergências',
  agente: 'Agente de Resposta',
  administrador: 'Administrador',
  cidadao: 'Cidadão'
};
