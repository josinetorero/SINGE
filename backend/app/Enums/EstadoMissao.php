<?php

namespace App\Enums;

enum EstadoMissao: string
{
    case ATRIBUIDA = 'atribuida';
    case EM_DESLOCACAO = 'em_deslocacao';
    case EM_EXECUCAO = 'em_execucao';
    case CONCLUIDA = 'concluida';
    case CANCELADA = 'cancelada';
}