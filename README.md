# SiteTemplateCodex — Template de E-commerce

SiteTemplateCodex é uma base full stack para criar lojas virtuais com catálogo, carrinho, checkout simulado, área do cliente e painel administrativo. O projeto usa nomes, textos e imagens genéricos para servir como ponto de partida para uma marca real.

## 🚀 Tecnologias

### Backend
- **Framework:** FastAPI
- **Servidor:** Uvicorn
- **Banco de Dados:** SQLite (com transição planejada para PostgreSQL)
- **ORM:** SQLAlchemy 2.0 (Assíncrono)
- **Migrações:** Alembic
- **Autenticação:** JWT (`pyjwt`) e hash de senhas (`bcrypt`)
- **Validações:** Pydantic V2 e `pydantic-br` (validação de CPF)
- **Upload de Imagens:** Local em desenvolvimento ou Cloudinary via configuração

### Frontend
- **Framework:** Next.js (App Router)
- **Estilização:** Tailwind CSS (com paleta base customizável, gradientes e animações fluídas)
- **Gerenciamento de Estado e Cache:** TanStack Query
- **Ícones e Fontes:** Outfit e Inter (Google Fonts)

## 🏗️ Arquitetura

O projeto adota uma arquitetura em **Monorepo** com separação clara entre os diretórios `frontend/` e `backend/`. 

O **Backend** implementa os princípios do **SOLID** e utiliza o padrão **Service-Repository** para garantir forte isolamento entre a lógica de negócios e as operações do banco de dados, empregando injeção de dependências e tipagem rigorosa.

### Principais Funcionalidades
- **Autenticação e Perfil:** Cadastro completo de usuários (com validação de CPF e endereço) e gestão de perfil.
- **Loja Virtual:** Listagem responsiva de produtos, detalhamento, controle de carrinho de compras e fluxo de checkout com simulador de pagamentos e cálculo de frete (Sedex, Retirada, Uber Flash).
- **Pedidos Customizados:** Chat assíncrono integrado entre clientes e administração para solicitações, dúvidas e pedidos personalizados.
- **Painel Administrativo:** Gestão intuitiva de produtos (com upload direto de fotos para nuvem), cupons de desconto, banners/anúncios rotativos da homepage e gerenciamento de status de pedidos.
- **Design System:** Paleta visual base e componentes prontos para adaptação de marca, com glassmorphism e micro-animações sutis no CSS.

## ⚙️ Configuração de Ambiente

O projeto foi preparado para rodar em modo desenvolvimento sem custos e trocar serviços por produção com variáveis de ambiente.

`.env.example` é o guia público do formato das variáveis. Ele não deve conter segredos reais. `.env` e `.env.local` são os arquivos privados usados na sua máquina ou configurados na plataforma de deploy.

### Backend
Copie `backend/.env.example` para `backend/.env`.

- `DOMAIN`: domínio principal do projeto.
- `DATABASE_URL`: usa SQLite por padrão. Para PostgreSQL, use uma URL `postgresql+asyncpg://...`.
- `FRONTEND_URL`: URL pública do frontend.
- `PUBLIC_API_URL`: URL pública do backend, usada para gerar links de arquivos locais.
- `SECRET_KEY`: chave privada usada para assinar JWTs. Nunca commite o valor real.
- `CORS_ORIGINS`: lista de domínios autorizados a chamar a API pelo navegador.
- `UPLOAD_STORAGE`: `local` para desenvolvimento ou `cloudinary` para Cloudinary.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: obrigatórios quando `UPLOAD_STORAGE=cloudinary`.
- `PAYMENT_PROVIDER`: `mock` enquanto o pagamento real não estiver integrado.

### Frontend
Copie `frontend/.env.example` para `frontend/.env.local`.

- `NEXT_PUBLIC_API_URL`: URL do backend que o frontend deve chamar.

No Next.js, variáveis com prefixo `NEXT_PUBLIC_` ficam disponíveis no navegador. Use esse prefixo apenas para valores públicos, como URL da API. Nunca coloque segredos, senhas ou chaves privadas no frontend.

### Diferença entre `.env` e `.env.local`

- `backend/.env`: lido pelo FastAPI via `pydantic-settings`; guarda variáveis privadas do servidor, como `DATABASE_URL`, `SECRET_KEY` e chaves de serviços.
- `frontend/.env.local`: lido pelo Next.js durante desenvolvimento; guarda variáveis do frontend. Neste projeto, ele contém apenas a URL pública da API.

### Como Rodar

Backend:
```bash
cd backend
uv run uvicorn src.main:app --reload
```

Frontend:
```bash
cd frontend
npm run dev
```

## ✅ Testes

Backend:
```bash
cd backend
uv run pytest
uv run ruff check .
```

Frontend:
```bash
cd frontend
npm test
npm run lint
npm run build
```
  
## 📜 Licença
Defina a licença conforme o uso do seu projeto.
