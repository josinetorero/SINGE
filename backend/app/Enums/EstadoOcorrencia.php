<?php

namespace App\Enums;

enum EstadoOcorrencia: string
{
    case REGISTADA = 'registada';
    case EM_AVALIACAO = 'em_avaliacao';
    case EM_ATENDIMENTO = 'em_atendimento';
    case RESOLVIDA = 'resolvida';
    case CANCELADA = 'cancelada';
}