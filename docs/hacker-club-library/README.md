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

   Commit e push na `main`. Ao trocar a URL, aumente também o `?v=` das tags
   `<script>` do config em `hacker-club/library/index.html` e
   `hacker-club/library/labels/index.html`, senão navegadores com cache
   continuam chamando a URL antiga.
8. Abra `https://bsideskrakow.pl/hacker-club/library/labels/`, imprima as
   etiquetas e cole uma em cada livro. Cole o PIN na estante.

## Conta dedicada e escopos

O web app precisa de `SpreadsheetApp.openById`, e isso exige o escopo de
**todas** as planilhas da conta (`spreadsheets.currentonly` não funciona em
web app). Por isso a planilha e o script ficam numa conta Google só do
Hacker Club, com MFA e sem mais nada dentro.

O [`appsscript.json`](./appsscript.json) fixa os escopos em só
`spreadsheets`. Se alguém editar o código pra usar Gmail, Drive ou outro
serviço, ele falha até uma nova autorização do dono. Para usar: Configurações
do projeto > marque "Mostrar arquivo de manifesto appsscript.json no editor",
abra o arquivo no editor e cole o conteúdo.

### Migrar de uma conta para outra

1. Na conta nova, abra a planilha copiada > Extensões > Apps Script.
   Se o script veio junto na cópia, confira se o código é o `Code.gs` atual;
   senão, cole.
2. Cole o `appsscript.json` (acima).
3. Propriedades do script: `LIBRARY_PIN` e `SPREADSHEET_ID` com o ID da
   **planilha nova**. Se as propriedades vieram na cópia, o ID antigo
   está errado: troque.
4. Implantar > Nova implantação > App da Web (Eu / Qualquer pessoa).
   Autorize: a tela deve pedir só acesso a Planilhas.
5. Troque a URL `/exec` em `js/hacker-club-library-config.js`, commit e push.
6. Teste o roteiro (check-out, check-in, transfer, PIN errado).
7. Na conta antiga: arquive a implantação antiga (Implantar > Gerenciar
   implantações > Arquivar), apague a planilha antiga (o script vinculado
   vai junto) e revogue o acesso do projeto em
   https://myaccount.google.com/permissions.

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
