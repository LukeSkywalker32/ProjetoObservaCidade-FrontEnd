<div align="center">

<br/>

```
 ██████╗ ██████╗ ███████╗███████╗██████╗ ██╗   ██╗ █████╗  ██████╗██╗██████╗  █████╗ ██████╗ ███████╗
██╔═══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██║   ██║██╔══██╗██╔════╝██║██╔══██╗██╔══██╗██╔══██╗██╔════╝
██║   ██║██████╔╝███████╗█████╗  ██████╔╝██║   ██║███████║██║     ██║██║  ██║███████║██║  ██║█████╗  
██║   ██║██╔══██╗╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══██║██║     ██║██║  ██║██╔══██║██║  ██║██╔══╝  
╚██████╔╝██████╔╝███████║███████╗██║  ██║ ╚████╔╝ ██║  ██║╚██████╗██║██████╔╝██║  ██║██████╔╝███████╗
 ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝╚═╝╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝
```

### 🗺️ Plataforma colaborativa de segurança urbana

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

<br/>

> **Cidadãos conectados. Comunidades mais seguras.**  
> Registre, visualize e compartilhe ocorrências urbanas em tempo real com o mapa da sua cidade.

<br/>

---

</div>

## 📌 Sobre o Projeto

O **ObservaCidade** nasceu da necessidade de empoderar cidadãos na construção de cidades mais seguras. É uma plataforma **colaborativa e comunitária** onde qualquer pessoa pode registrar e visualizar ocorrências urbanas em um mapa interativo.

> ⚠️ As informações são de caráter colaborativo e **não substituem** os canais oficiais de segurança pública como Polícia, Bombeiros e Defesa Civil.

---

## ✨ Funcionalidades

### 👤 Usuário
- 📍 Visualização de ocorrências no mapa em tempo real
- ✅ Acesso público sem necessidade de cadastro
- 📝 Registro de ocorrências com endereço e descrição
- 🗂️ Histórico de ocorrências registradas no perfil
- 📸 Upload de foto de perfil
- 🔐 Autenticação via e-mail ou CPF

### 🛡️ Administrador
- 👥 Gestão completa de usuários
- 📄 Homologação de documentos (aprovar/reprovar)
- 🗺️ Mapa de ocorrências integrado ao painel
- 📊 Auditoria de ocorrências com exportação CSV
- 🗑️ Exclusão de ocorrências com registro de motivo

---

## 🚀 Stack Tecnológica

### Frontend
| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript | Interface web |
| Vite | Build tool |
| Tailwind CSS | Estilização |
| React Router DOM | Navegação |
| Axios | Requisições HTTP |
| Google Maps API | Mapa interativo |
| Capacitor | Build Android (APK) |

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js + Express | Servidor HTTP |
| TypeScript | Tipagem |
| MongoDB + Mongoose | Banco de dados |
| JWT | Autenticação |
| Bcryptjs | Hash de senhas |
| Cloudinary | Upload de imagens |
| Multer | Processamento de arquivos |

### Infraestrutura
| Serviço | Uso |
|---|---|
| Render | Hospedagem do backend |
| MongoDB Atlas | Banco em nuvem |
| Cloudinary | CDN de imagens |
| Capacitor | APK Android |

---

## 📱 Plataformas

- 🌐 **Web** — acesso via navegador
- 📱 **Android** — APK gerado via Capacitor

---

## 🗂️ Estrutura do Projeto

```
observacidade-frontend/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   ├── constants/         # Tipos de ocorrências e constantes
│   ├── context/           # AuthContext, GoogleMapsContext
│   ├── pages/             # Map, Login, SignUp, Profile, Admin, Help
│   ├── routes/            # Configuração de rotas e PrivateRoute
│   ├── services/          # Configuração do Axios
│   └── utils/             # Validadores, formatadores, markers
└── android/               # Projeto Android gerado pelo Capacitor

observacidade-backend/
├── src/
│   ├── config/            # Banco de dados e Cloudinary
│   ├── controllers/       # Lógica de negócio
│   ├── middlewares/       # Auth, status, upload
│   ├── models/            # User, Occurrence
│   ├── routes/            # Auth, Public, Private, Admin
│   ├── services/          # Geocode, Upload
│   └── utils/             # Validadores, formatadores
```

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Yarn
- MongoDB local ou Atlas
- Chave da Google Maps API

### Backend

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/observacidade-backend.git
cd observacidade-backend

# Instale as dependências
yarn

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie o servidor
yarn dev
```

### Frontend

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/observacidade-frontend.git
cd observacidade-frontend

# Instale as dependências
yarn

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie o projeto
yarn dev
```

### Variáveis de Ambiente

**Backend `.env`**
```env
MONGO_URL=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=
GOOGLEMAPS_API_KEY=
PORT=5000
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLEMAPS_API_KEY=
```

---

## 📲 Gerando o APK Android

```bash
# Build do projeto
yarn build

# Sincronizar com o Capacitor
npx cap sync

# Abrir no Android Studio
npx cap open android

# No Android Studio:
# Build → Generate App Bundles or APKs → Generate APKs
```

---

## 🗺️ Tipos de Ocorrências

| Tipo | Cor |
|---|---|
| 🔴 Furto | `#ef4444` |
| 🟢 Roubo | `#008000` |
| 🟣 Vandalismo | `#8b5cf6` |
| 🟡 Atividade Suspeita | `#f59e0b` |
| ⚫ Outros | `#6b7280` |

---

## 🔐 Perfis de Acesso

| Perfil | Acesso |
|---|---|
| **Visitante** | Visualiza ocorrências no mapa |
| **Usuário** | Visualiza + registra ocorrências |
| **Admin** | Gestão completa da plataforma |

---

## 📞 Contatos de Emergência

> Em situações de risco, acione os canais oficiais:

| Serviço | Número |
|---|---|
| Polícia Militar | 190 |
| Bombeiros | 193 |
| SAMU | 192 |
| Defesa Civil | 199 |
| Disque Denúncia | 181 |
| Emergência Geral | 112 |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma **issue** ou enviar um **pull request**.

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com ❤️ para tornar as cidades mais seguras

**ObservaCidade** — *Sua cidade, seus olhos.*

</div>

