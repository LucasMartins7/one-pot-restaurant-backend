# One Pot Restaurant - Backend

Backend Flask para o sistema de pedidos do restaurante One Pot - Paulista com integração ao Mercado Pago.

## Funcionalidades

- 🔐 Processamento seguro de pagamentos PIX e cartão de crédito
- 📊 Sistema de banco de dados para registro de vendas
- 📈 Relatórios de vendas e estatísticas
- 🔄 API RESTful para integração com frontend

## Tecnologias

- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **PostgreSQL** - Banco de dados em produção
- **Mercado Pago SDK** - Processamento de pagamentos
- **Flask-CORS** - Suporte a CORS para frontend

## Endpoints da API

### Pagamentos
- `POST /api/generate_pix_payment` - Gerar pagamento PIX
- `POST /api/process_card_payment` - Processar pagamento de cartão

### Relatórios e Consultas
- `GET /api/orders` - Listar pedidos (com filtros)
- `GET /api/orders/<order_id>` - Buscar pedido específico
- `GET /api/sales-report` - Relatório de vendas
- `GET /api/health` - Health check da API

## Deploy no Render

### Pré-requisitos
1. Conta no [Render](https://render.com)
2. Repositório no GitHub com o código

### Passos para Deploy

1. **Conectar Repositório**
   - Acesse o dashboard do Render
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub

2. **Configurar Serviço**
   - **Name**: `one-pot-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd src && python main.py`

3. **Configurar Variáveis de Ambiente**
   ```
   MP_ACCESS_TOKEN=TEST-3110328722128258-100514-63e7dc670655b03344e180477a3d5da3-190968069
   MP_PUBLIC_KEY=TEST-ae034fa4-581f-4e04-a922-4fcf697872f4
   FLASK_ENV=production
   SECRET_KEY=[gerar uma chave secreta]
   DATABASE_URL=[será fornecida pelo banco PostgreSQL do Render]
   ```

4. **Configurar Banco de Dados**
   - Criar um PostgreSQL database no Render
   - Copiar a `DATABASE_URL` para as variáveis de ambiente

5. **Deploy**
   - Clicar em "Create Web Service"
   - Aguardar o build e deploy

## Estrutura do Projeto

```
backend/
├── src/
│   ├── main.py          # Aplicação Flask principal
│   └── models.py        # Modelos do banco de dados
├── requirements.txt     # Dependências Python
├── .env.example        # Exemplo de variáveis de ambiente
├── Procfile           # Configuração para deploy
├── render.yaml        # Configuração do Render
└── README.md          # Este arquivo
```

## Modelos de Dados

### Order (Pedido)
- Informações do cliente
- Detalhes do pagamento
- Status e timestamps

### OrderItem (Item do Pedido)
- Detalhes dos produtos
- Quantidades e preços
- Relacionamento com pedido

## Desenvolvimento Local

1. Instalar dependências:
   ```bash
   pip install -r requirements.txt
   ```

2. Configurar variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Editar .env com suas configurações
   ```

3. Executar aplicação:
   ```bash
   cd src && python main.py
   ```

## Suporte

Para dúvidas ou problemas, consulte a documentação do Mercado Pago ou entre em contato com o desenvolvedor.
