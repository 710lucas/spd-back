# 📦 Backend - Integração com Archivematica

Este projeto integra um backend Node.js com o sistema **Archivematica** para gestão e preservação digital.

## 🚀 Requisitos

- Node.js
- NPM
- Docker & Docker Compose
- Archivematica (executando e acessível)
- `.env` configurado com as variáveis necessárias `(ver .env.sample)`

---

## ⚙️ Passo a passo para rodar o backend

### 1. Clone o repositório

```bash
git clone https://github.com/710lucas/spd-back.git
cd spd-back/
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute o Archivematica e obtenha as variáveis de ambiente

- Certifique-se de que o **Archivematica** e o **Storage Service** estão em execução.
- Copie e configure as variáveis necessárias no arquivo `.env` com base no `.env.sample`.

### 4. Suba os serviços do backend com Docker Compose

```bash
docker compose up -d
```

> Isso iniciará os containers necessários, como o banco de dados PostgreSQL (caso esteja incluído).

### 5. Inicie o servidor em modo desenvolvimento

```bash
npm run start:dev
```

> Isso iniciará o backend na porta 3000 `http://localhost:3000`
---

## 📁 Estrutura esperada do `.env`

Veja o arquivo `.env.sample` incluído no repositório para saber quais variáveis precisam ser configuradas, como:

```env
AM_API_KEY=admin:your_am_api_key_here
AM_API_URL=http://10.10.10.20:80
AM_STORAGE_SERV_URL=http://10.10.10.20:8000
UPLOAD_DIR=C:\path\to\uploads
REMOTE_UPLOAD_DIR=/uploads/
REMOTE_UPLOAD_FULL_DIR=/home/local-transfers/uploads
LOCATION_UUID=your_location_uuid
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
```

---

## ✅ Pronto!

Após isso, o backend estará rodando localmente e integrado ao Archivematica. 

---

