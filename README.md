# Naian Menginelli — Portfólio

Site estático em HTML, CSS e JavaScript, sem dependências externas.

## Executar localmente

Na pasta do projeto, execute:

```bash
python3 -m http.server 8080 --directory dist
```

Abra http://localhost:8080. Também é possível abrir `dist/index.html` diretamente; a cópia de mensagens depende das permissões do navegador.

## Estrutura

- `dist/index.html`: conteúdo e estrutura das páginas.
- `dist/assets/styles.css`: identidade visual e layout responsivo.
- `dist/assets/app.js`: navegação, dados dos projetos, projeção 4D e cubos 3D.
- `dist/assets/favicon.svg`: ícone do site.

As rotas usam fragmentos: `#home`, `#works`, `#about`, `#contact` e `#project/SLUG`. Funcionam em hospedagem estática sem configuração de redirecionamento. Os projetos têm os slugs `kitkat`, `emilie-chamie` e `tipografia-variavel`.

## Próxima etapa editorial

As páginas individuais preservam os textos de planejamento do protótipo. Precisam receber imagens, vídeos e descrições finais dos trabalhos. A página de contato prepara e copia uma mensagem; ainda não envia e-mail. Para receber mensagens diretamente, conectar um serviço de formulário ou backend e informar o endereço de destino.

## Publicar em outra hospedagem

Envie o conteúdo de `dist` para qualquer hospedagem de arquivos estáticos. Nenhuma chave, conta ou dependência é necessária para executar o frontend.

## Paleta oficial

- Cinza escuro: `#242426`
- Vermelho escuro: `#751C19`
- Branco: `#FFFFFF`

Tons de apoio usam transparências dessas cores.
