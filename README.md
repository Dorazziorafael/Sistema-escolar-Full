# Sistema de Gerenciamento Acadêmico: Meu Estudo Fullstack com React

Olá! Este projeto é o resultado do meu aprendizado prático em desenvolvimento Fullstack porem ainda há muito a aprender e implementar dentro desse proprio sistema. Criei um sistema básico de gerenciamento acadêmico para solidificar meus conhecimentos em React.js e dominar as operações CRUD (Criar, Ler, Atualizar, Deletar).

Foi uma jornada para entender a comunicação entre frontend e backend em tempo real.

##  Meu Propósito com Este Projeto

Meu principal objetivo foi:

* **Aprofundar em React.js:** Pratiquei componentes, gerenciamento de estado (useState, useEffect), roteamento (react-router-dom) e organização de estilos com CSS Modules.
* **Dominar Operações CRUD:** Implementei a criação, leitura, atualização e exclusão de dados para cursos, matérias e alunos.
* **Explorar o Fullstack:** Conectei o frontend React a um backend Node.js, compreendendo o fluxo de requisições e respostas em uma API RESTful.
* **Organização de Código:** Apliquei boas práticas para manter o código limpo e fácil de entender.

##  Funcionalidades Principais

O sistema permite gerenciar:

* **Cursos:** Cadastro, listagem, exclusão e visualização de alunos matriculados.
* **Matérias:** Cadastro, listagem, exclusão e a crucial funcionalidade de vínculo com cursos.
* **Alunos:** Cadastro, listagem, exclusão e matrícula em cursos.
* **Feedback:** Mensagens de sucesso e erro aparecem para guiar o usuário após cada ação.

##  As Tecnologias Usadas

Para construir este projeto, utilizei:

**No Frontend:**
* React.js
* JavaScript
* React Router DOM
* CSS Modules
* Fetch API

**No Backend:**
* Node.js
* Express.js
* PostgreSQL (via Neon Tech)
* Prisma ORM

## Como Rodar Localmente

### 1. Obtenha o Código

### 2.BACKEND
npm install
# Crie um arquivo .env com sua DATABASE_URL do Neon/PostgreSQL:
# DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/BANCO?schema=public"
npx prisma migrate dev --name init

npm start

### 3.FRONTEND

npm install

npm start

