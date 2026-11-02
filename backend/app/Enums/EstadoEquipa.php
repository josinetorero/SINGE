<?php

namespace App\Enums;

enum EstadoEquipa: string
{
    case DISPONIVEL = 'disponivel';
    case EM_MISSAO = 'em_missao';
    case INDISPONIVEL = 'indisponivel';
}