const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rota para criar um novo professor (POST /professores)
router.post('/', async (req, res) => {
  const { nome_professor, formacao, email } = req.body;

  try {
    const novoProfessor = await prisma.professor.create({
      data: {
        nome_professor,
        formacao,
        email
      }
    });

    res.status(201).json(novoProfessor); // Retorna o professor criado com status 201 (Created)
  } catch (error) {
    console.error('Erro ao criar professor:', error);
    // Erro de violação de restrição única (email já existe)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail já cadastrado para outro professor.' });
    }
    // Erro genérico do servidor
    res.status(500).json({ error: 'Erro interno do servidor ao criar professor.' });
  }
});

// Rota para listar todos os professores (GET /professores)
router.get('/', async (req, res) => {
  try {
    const professores = await prisma.professor.findMany();
    res.status(200).json(professores); // Retorna a lista de professores com status 200 (OK)
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar professores.' });
  }
});

// Rota para buscar um professor por ID (GET /professores/:id)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const professor = await prisma.professor.findUnique({
      // Busca pelo id_professor, que é a chave primária no seu schema.prisma para Professor
      where: { id_professor: parseInt(id) },
      // Inclua relações se desejar mais detalhes (ex: cursos_ministrados, materias_ministradas)
      include: {
        cursos_ministrados: {
          include: {
            curso: true // Inclui detalhes do curso relacionado
          }
        },
        materias_ministradas: {
          include: {
            materia: true // Inclui detalhes da matéria relacionada
          }
        }
      }
    });

    if (!professor) {
      // Se o professor não for encontrado, retorna status 404 (Not Found)
      return res.status(404).json({ error: 'Professor não encontrado.' });
    }
    res.status(200).json(professor); // Retorna o professor encontrado com status 200 (OK)
  } catch (error) {
    console.error('Erro ao buscar professor por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar professor.' });
  }
});

// Rota para atualizar um professor por ID (PUT /professores/:id)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_professor, formacao, email } = req.body;

  try {
    const professorAtualizado = await prisma.professor.update({
      // Atualiza pelo id_professor, que é a chave primária no seu schema.prisma
      where: { id_professor: parseInt(id) },
      data: {
        nome_professor,
        formacao,
        email
      }
    });
    res.status(200).json(professorAtualizado); // Retorna o professor atualizado com status 200 (OK)
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    // Erro: Professor não encontrado para atualização
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Professor não encontrado para atualização.' });
    }
    // Erro: E-mail já cadastrado (violação de restrição única)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail já cadastrado para outro professor.' });
    }
    // Erro genérico do servidor
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar professor.' });
  }
});

// Rota para deletar um professor por ID (DELETE /professores/:id)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.professor.delete({
      // Deleta pelo id_professor, que é a chave primária no seu schema.prisma
      where: {
        id_professor: parseInt(id)
      },
    });
    // Retorna mensagem de sucesso com status 200 (OK)
    res.status(200).json({ message: 'Professor excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar professor:', error);
    // Erro: Professor não encontrado para exclusão
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Professor não encontrado para exclusão.' });
    }
    // Erro: Chave estrangeira falhou (professor tem dependências, ex: cursos ou matérias ministradas)
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Não é possível deletar o professor. Existem cursos ou matérias vinculadas a ele.' });
    }
    // Erro genérico do servidor
    res.status(500).json({ error: 'Erro interno do servidor ao deletar professor.' });
  }
});

module.exports = router;