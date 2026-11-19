# Contas de demonstração do SINGE

O `DemoCoordenadorSeeder` cria contas locais de demonstração. Todas usam a palavra-passe `SingeDemo2026!`.

| Perfil | Email |
|---|---|
| Administrador | `admin@singe.test` |
| Coordenador | `coord@singe.test` |
| Operador | `operador@singe.test` |
| Cidadão | `cidadao@singe.test` |
| Agente de campo | `agente@singe.test` |
| Agente de resgate | `agente.resgate@singe.test` |
| Agente de saúde | `agente.saude@singe.test` |
| Agente de logística | `agente.logistica@singe.test` |

Estas credenciais são exclusivamente para desenvolvimento local. Para semear os dados institucionais e de demonstração, executar `php artisan db:seed`. Para executar apenas a parte de demonstração, executar `php artisan db:seed --class=DemoCoordenadorSeeder`.
