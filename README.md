## Descrição
Um pequeno projeto de cadastro de usuários para treinar minhas habilidades com autenticação usando JWT e Passport.

## Env
Esse exercício está sendo executado numa máquina Lubuntu Linux, usando banco Postgres instalado via apt,
o app é feito em React, Tailwind, TypeScript e Nest com Node. O Nest está usando Express por baixo, como padrão do framework.

## Estrutura do projeto (plaintext)

```text
cadastro/
├── backend/                     # API NestJS + Prisma + testes
│   ├── src/
│   │   ├── auth/               # login, JWT, guards e sessoes
│   │   ├── users/              # CRUD de usuarios
│   │   ├── admin/              # metricas em tempo real (socket)
│   │   └── main.ts             # bootstrap da API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── test/                   # testes e2e
│   ├── .env                    # variaveis de ambiente do backend
│   └── package.json
├── frontend/                    # aplicacao React + Vite
│   ├── src/
│   │   ├── pages/              # Login, Register, Welcome, Admin, Edit
│   │   ├── components/         # componentes reutilizaveis
│   │   ├── hooks/              # hooks de regras de pagina
│   │   ├── api/                # client HTTP e funcoes de API
│   │   └── utils/              # utilitarios de frontend
│   ├── public/
│   ├── .env                    # variaveis de ambiente do frontend
│   └── package.json
├── app.sh                       # script para abrir backend e frontend
└── README.md
```

## Setup do projeto

```bash
$ cd backend && npm install
$ cd ../frontend && npm install
```

## Compilar e rodar o projeto

```bash
# development
$ cd backend && npm run start

# watch mode
$ cd backend && npm run start:dev

# production mode
$ cd backend && npm run start:prod
```

## Rodar o frontend

```bash
$ cd frontend && npm run dev
```

## Run tests

```bash
# unit tests
$ cd backend && npm run test

# e2e tests
$ cd backend && npm run test:e2e

# test coverage
$ cd backend && npm run test:cov
```

## Deployment

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

## Obs
Eu não estou usando acentuação nos commits por uma questão de preferencia.
Tenho o hábito de não colocar pontuação nas coisas que eu escrevo no 
terminal.

## License

Esse projeto é feito com base na licença MIT.

## Cobertura de testes
![screen](https://github.com/user-attachments/assets/7dc4b80f-9ebf-4ded-b409-5c4334ca3f0e)
