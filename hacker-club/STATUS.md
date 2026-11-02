# Status do espaço

Edite `hacker-club/status.json` e faça commit/push para publicar no GitHub Pages.
O status inicial é fechado. O site consulta o JSON a cada minuto, sem cache de navegador.

## Abrir durante o dia

```json
{
  "open": true,
  "updatedAt": "2026-11-02T09:00:00+01:00",
  "openFrom": null,
  "validUntil": null
}
```

A confirmação só vale no mesmo dia em Europe/Warsaw, de segunda a sexta,
das 09:00 até as 18:00. Não existe abertura automática às 09:00.
Use `validUntil` se quiser encerrar antes das 18:00.

## Abertura excepcional à noite

```json
{
  "open": true,
  "updatedAt": "2026-11-02T17:00:00+01:00",
  "openFrom": "2026-11-02T18:00:00+01:00",
  "validUntil": "2026-11-03T01:00:00+01:00"
}
```

Os dois limites são obrigatórios para uma exceção. A janela vale a partir de
`openFrom`, inclusive, até `validUntil`, exclusive. `updatedAt` deve ser menor
ou igual ao início da janela. Sábado e domingo permanecem sempre fechados,
inclusive durante uma janela explícita. Use +01:00 no inverno e +02:00 no verão,
ou timestamps UTC terminados em Z.

## Fechar

Defina `open` como `false`. Atualize `updatedAt` e limpe os limites opcionais.
JSON inválido, falha de leitura ou confirmação expirada resultam em fechado.
O fechamento por horário é recalculado a cada segundo nas páginas abertas.

O indicador aparece somente em `/hacker-club/` e suas subpáginas.
Há um destaque adicional em `/hacker-club/index.html` e `/hacker-club/space/index.html`.
Sirva o site por HTTP para testar localmente; abrir via file:// não permite o fetch.
