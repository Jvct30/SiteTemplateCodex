# 🌙 Lunart — E-commerce Artesanal

Lunart é uma plataforma de vendas de produtos artesanais com uma temática celestial, inspirada em constelações, estrelas e no céu noturno. A plataforma permite a compra direta ou via carrinho, suporta cálculos de frete variados e possui um chat para pedidos customizados.

## 🚀 Tecnologias

### Backend
- **Framework:** FastAPI
- **Servidor:** Uvicorn
- **Banco de Dados:** SQLite (com transição planejada para PostgreSQL)
- **ORM:** SQLAlchemy 2.0 (Assíncrono)
- **Migrações:** Alembic
- **Autenticação:** JWT (`pyjwt`) e hash de senhas (`bcrypt`)
- **Validações:** Pydantic V2 e `pydantic-br` (validação de CPF)
- **Upload de Imagens:** Cloudinary (Integração Direta)

### Frontend
- **Framework:** Next.js (App Router)
- **Estilização:** Tailwind CSS (com paleta temática personalizada, gradientes e animações fluídas)
- **Gerenciamento de Estado e Cache:** TanStack Query
- **Ícones e Fontes:** Outfit e Inter (Google Fonts)

## 🏗️ Arquitetura

O projeto adota uma arquitetura em **Monorepo** com separação clara entre os diretórios `frontend/` e `backend/`. 

O **Backend** implementa os princípios do **SOLID** e utiliza o padrão **Service-Repository** para garantir forte isolamento entre a lógica de negócios e as operações do banco de dados, empregando injeção de dependências e tipagem rigorosa.

### Principais Funcionalidades
- **Autenticação e Perfil:** Cadastro completo de usuários (com validação de CPF e endereço) e gestão de perfil.
- **Loja Virtual:** Listagem responsiva de produtos, detalhamento, controle de carrinho de compras e fluxo de checkout com simulador de pagamentos e cálculo de frete (Sedex, Retirada, Uber Flash).
- **Pedidos Customizados:** Chat assíncrono integrado entre clientes e a administração da loja para a negociação e solicitação de peças artesanais personalizadas.
- **Painel Administrativo:** Gestão intuitiva de produtos (com upload direto de fotos para nuvem), cupons de desconto, banners/anúncios rotativos da homepage e gerenciamento de status de pedidos.
- **Design System Celestial:** Paleta visual fluida focada em tons de roxo, rosa e cores escuras (quase preto) com efeitos de glassmorphism e micro-animações estelares no CSS.

## 💻 Execução Local

> *Um guia completo e detalhado (incluindo passos para deploy em nuvem e substituição por meios de pagamento reais) será disponibilizado no arquivo `deployguide.md`.*

### Configurando o Backend
```bash
cd backend
python -m venv .venv
# Ative o ambiente virtual
# Windows: .\.venv\Scripts\Activate.ps1
# Linux/Mac: source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
alembic upgrade head
python seed.py
uvicorn run:app --reload
```

### Configurando o Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## 📜 Licença
Projeto de uso restrito e proprietário.
