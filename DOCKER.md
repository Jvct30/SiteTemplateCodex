# Guia Docker do SiteTemplateCodex

Este guia mostra como rodar o projeto em outra maquina usando Docker. A ideia e empacotar backend e frontend em containers, sem precisar instalar Python, Node, `uv` ou dependencias do projeto diretamente na maquina.

## Conceitos rapidos

- **Imagem**: o pacote pronto da aplicacao. Ela e criada a partir de um `Dockerfile`.
- **Container**: uma execucao de uma imagem.
- **Dockerfile**: receita para construir uma imagem.
- **docker-compose.yml**: arquivo que sobe varios containers juntos.
- **Volume**: armazenamento persistente fora do container. Aqui ele guarda o SQLite e os uploads.

## Arquivos adicionados

- `docker-compose.yml`: sobe backend e frontend juntos.
- `backend/Dockerfile`: cria a imagem FastAPI.
- `frontend/Dockerfile`: cria a imagem Next.js.
- `backend/.env.example`: exemplo das variaveis do backend.
- `.dockerignore` nos projetos: evita copiar arquivos pesados ou privados para as imagens.

## Rodar localmente com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Depois acesse:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Documentacao da API: http://localhost:8000/docs

Para parar:

```bash
docker compose down
```

Para parar e apagar tambem os volumes de banco/uploads:

```bash
docker compose down -v
```

Use `-v` com cuidado, porque isso apaga os dados persistidos pelo Docker.

## Rodar em outra maquina

1. Instale o Docker Desktop ou Docker Engine na outra maquina.
2. Copie o projeto inteiro para a maquina ou clone o repositorio.
3. Entre na pasta raiz do projeto.
4. Rode:

```bash
docker compose up --build
```

Se voce acessar pelo proprio computador onde o Docker esta rodando, mantenha `localhost`.

Se voce acessar por outro computador da rede, troque os enderecos no `docker-compose.yml`. Por exemplo, se a maquina Docker tem IP `192.168.0.50`:

```yaml
PUBLIC_API_URL: http://192.168.0.50:8000
FRONTEND_URL: http://192.168.0.50:3000
CORS_ORIGINS: '["http://192.168.0.50:3000"]'
```

No frontend, troque tambem:

```yaml
args:
  NEXT_PUBLIC_API_URL: http://192.168.0.50:8000
environment:
  NEXT_PUBLIC_API_URL: http://192.168.0.50:8000
```

Depois reconstrua:

```bash
docker compose up --build
```

## Comandos uteis

Ver containers rodando:

```bash
docker compose ps
```

Ver logs:

```bash
docker compose logs -f
```

Ver logs so do backend:

```bash
docker compose logs -f backend
```

Ver logs so do frontend:

```bash
docker compose logs -f frontend
```

Abrir um terminal dentro do backend:

```bash
docker compose exec backend bash
```

Abrir um terminal dentro do frontend:

```bash
docker compose exec frontend sh
```

Recriar tudo depois de mudar dependencias:

```bash
docker compose build --no-cache
docker compose up
```

## Observacoes importantes

- O banco SQLite fica no volume `backend_data`.
- Os uploads locais ficam no volume `backend_uploads`.
- `SECRET_KEY` deve ser alterada antes de publicar o projeto.
- `NEXT_PUBLIC_API_URL` e usado pelo navegador. Por isso, ele precisa apontar para um endereco que o navegador consiga acessar, nao para `backend:8000`.
- Para producao real, considere usar PostgreSQL, HTTPS, dominio proprio e secrets fora do `docker-compose.yml`.
