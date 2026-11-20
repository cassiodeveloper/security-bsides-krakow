# Biblioteca do Hacker Club: check-in e check-out

Cada livro tem um código único (`HCL-001`, `HCL-002`, ...) e um QR que abre
`https://bsideskrakow.pl/hacker-club/library/?b=HCL-001`.

- Livro **na biblioteca**: o scan oferece "Borrow this book" (check-out).
- Livro **com alguém**: o scan oferece "Return to the Club" (check-in) ou
  "Borrow it myself" (check-out por outra pessoa, registrado como `transfer`).

O site continua estático. O estado mora numa Google Sheet, exposta por um
Apps Script publicado como web app.

## Segurança e privacidade

- Identidade: a pessoa digita nome ou @ do Discord. Não há login. O navegador
  lembra nome e PIN em `localStorage`.
- PIN do clube: obrigatório para qualquer ação e para ver quem está com o livro.
  Fica colado na estante, então só quem está no espaço consegue mexer.
  Depois de 20 PINs errados, todo mundo fica bloqueado por 10 minutos.
- A listagem pública (GET) mostra só título, autor e disponível/emprestado.
- Texto digitado é limpo (controle, 60 caracteres) e protegido contra
  injeção de fórmula na planilha.
- `LockService` evita dois scans simultâneos sobrescreverem um ao outro.
- Troque o PIN quando quiser em Script Properties. Não precisa republicar.

## Setup (uns 5 minutos)

1. Crie uma Google Sheet, por exemplo "Hacker Club Library", na conta do BSides.
2. Renomeie a primeira aba para `books` com este cabeçalho na linha 1:

   | code | title | author | status | holder | since |
   |------|-------|--------|--------|--------|-------|
   | HCL-001 | Título do livro 1 | Autor | available | | |
   | HCL-002 | Título do livro 2 | Autor | available | | |

3. Crie uma segunda aba `events` com o cabeçalho:
   `timestamp | code | action | person | previous_holder`
4. Na planilha: **Extensões > Apps Script**. Apague o conteúdo e cole
   [`Code.gs`](./Code.gs). Salve.
5. No Apps Script: **Configurações do projeto (engrenagem) > Propriedades do
   script > Adicionar**:
   - `LIBRARY_PIN` = um PIN de 4 a 6 dígitos.
   - `SPREADSHEET_ID` = o ID da planilha, o trecho da URL entre `/d/` e `/edit`.
     (Web apps do Apps Script não enxergam a planilha "ativa", por isso o ID.)
6. **Implantar > Nova implantação > Tipo: App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
   Autorize o acesso à planilha e copie a URL terminada em `/exec`.
7. Cole a URL em [`js/hacker-club-library-config.js`](../../js/hacker-club-library-config.js):

   ```js
   window.HCL_LIBRARY_API = 'https://script.google.com/macros/s/.../exec';
   ```

   Commit e push na `main`.
8. Abra `https://bsideskrakow.pl/hacker-club/library/labels/`, imprima as
   etiquetas e cole uma em cada livro. Cole o PIN na estante.

## Adicionar um livro

Adicione uma linha em `books` com o próximo código (`HCL-003`), `status`
= `available`, e imprima só a etiqueta nova:
`/hacker-club/library/labels/?codes=HCL-003`.

## Atualizar o script

Depois de editar o `Code.gs`, use **Implantar > Gerenciar implantações >
Editar > Nova versão**. Assim a URL `/exec` continua a mesma.

## Métricas

A aba `events` é o log completo (`checkout`, `checkin`, `transfer`). Dá pra
tirar livros mais emprestados, tempo médio com cada pessoa e quem está
atrasado direto com uma tabela dinâmica ou fórmulas na própria planilha.

## Testes

```sh
node --test scripts/hacker-club-library.test.mjs
```
