const express = require('express');
const cors = require('cors');

// Importa os arquivos de rota
const cursosRoutes = require('./src/routes/cursos');
const professoresRoutes = require('./src/routes/professores');
const alunosRoutes = require('./src/routes/alunos');
const materiasRoutes = require('./src/routes/materias');

// Importa os arquivos de rota dos relacionamentos
const alunosCursosRoutes = require('./src/routes/alunos_cursos');
const cursosMateriasRoutes = require('./src/routes/cursos_materias');
const professoresMateriasRoutes = require('./src/routes/professores_materias');
const professoresCursosRoutes = require('./src/routes/professores_cursos');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Sistema Escolar funcionando!');
});

// Usa as rotas específicas para cada entidade
app.use('/cursos', cursosRoutes);
app.use('/professores', professoresRoutes);
app.use('/alunos', alunosRoutes);
app.use('/materias', materiasRoutes);

// Usa as rotas para os relacionamentos (com endpoints em kebab-case, mais comum para URLs RESTful)
app.use('/alunos-cursos', alunosCursosRoutes); 
app.use('/cursos-materias', cursosMateriasRoutes);
app.use('/professores-materias', professoresMateriasRoutes);
app.use('/professores-cursos', professoresCursosRoutes);

// O app.listen() permanece no final
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});