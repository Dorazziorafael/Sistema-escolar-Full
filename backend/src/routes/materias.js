// backend/src/routes/materias.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// 1. Rota para CADASTRAR uma nova matéria (POST /materias)
router.post('/', async (req, res) => {
  // Apenas extraia nome_materia e creditos do body,
  // pois o frontend (VerMateriasDoCurso.js) só envia isso para esta rota.
  
  const { nome_materia, creditos } = req.body; 

  // Validação básica (mantida, já está boa)
  if (!nome_materia || creditos === undefined) {
    return res.status(400).json({ error: 'Nome da matéria e créditos são obrigatórios.' });
  }
  if (typeof creditos !== 'number' || creditos <= 0) {
    return res.status(400).json({ error: 'Créditos devem ser um número positivo.' });
  }

  try {
    const novaMateria = await prisma.materia.create({
      data: {
        nome_materia,
        creditos,
        
      },
      
    });
    res.status(201).json(novaMateria); // Retornará a matéria criada (com id_materia, nome_materia, creditos)
  } catch (error) {
    console.error("Erro ao cadastrar matéria:", error);
    if (error.code === 'P2002') { // Erro de violação de UNIQUE (se nome_materia for @unique e já existir)
        return res.status(409).json({ error: 'Uma matéria com este nome já existe.' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor ao cadastrar matéria.', details: error.message });
  }
});

// 2. Rota para LISTAR todas as matérias (GET /materias) - MANTIDA IGUAL
router.get('/', async (req, res) => {
  try {
    const materias = await prisma.materia.findMany({
      include: {
        cursos_que_oferecem: {
          include: {
            curso: true
          }
        },
        professores_da_materia: {
          include: {
            professor: true
          }
        }
      }
    });
    res.status(200).json(materias);
  } catch (error) {
    console.error("Erro ao buscar matérias:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar matérias.' });
  }
});

// 3. Rota para BUSCAR uma matéria por ID (GET /materias/:id) - MANTIDA IGUAL
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const materia = await prisma.materia.findUnique({
      where: { id_materia: parseInt(id) },
      include: {
        cursos_que_oferecem: {
          include: {
            curso: true
          }
        },
        professores_da_materia: {
          include: {
            professor: true
          }
        }
      }
    });
    if (!materia) {
      return res.status(404).json({ error: 'Matéria não encontrada.' });
    }
    res.status(200).json(materia);
  } catch (error) {
    console.error("Erro ao buscar matéria por ID:", error);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar matéria.' });
  }
});

// 4. Rota para ATUALIZAR uma matéria por ID (PUT /materias/:id) - MANTIDA IGUAL
// Esta rota espera curso_ids e professor_ids, o que é OK para uma atualização.
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_materia, creditos, curso_ids, professor_ids } = req.body;

  if (!nome_materia || creditos === undefined) {
    return res.status(400).json({ error: 'Nome da matéria e créditos são obrigatórios.' });
  }
  if (typeof creditos !== 'number' || creditos <= 0) {
    return res.status(400).json({ error: 'Créditos devem ser um número positivo.' });
  }

  try {
    const transaction = await prisma.$transaction(async (prisma) => {
      await prisma.cursoMateria.deleteMany({
        where: { materia_id: parseInt(id) }
      });
      await prisma.professorMateria.deleteMany({
        where: { materia_id: parseInt(id) }
      });

      const materiaAtualizada = await prisma.materia.update({
        where: { id_materia: parseInt(id) },
        data: {
          nome_materia,
          creditos,
          cursos_que_oferecem: {
            create: curso_ids.map(curso_id => ({
              curso: {
                connect: { id_curso: curso_id }
              }
            }))
          },
          ...(professor_ids && professor_ids.length > 0 && {
            professores_da_materia: {
              create: professor_ids.map(professor_id => ({
                professor: {
                  connect: { id_professor: professor_id }
                }
              }))
            }
          })
        },
        include: {
          cursos_que_oferecem: { include: { curso: true } },
          professores_da_materia: { include: { professor: true } }
        }
      });
      return materiaAtualizada;
    });

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Erro ao atualizar matéria:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Matéria não encontrada para atualização.' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Um dos IDs de curso ou professor fornecidos não foi encontrado.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar matéria.' });
  }
});

// 5. Rota para DELETAR uma matéria por ID (DELETE /materias/:id) - MANTIDA IGUAL
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const materiaDeletada = await prisma.materia.delete({
      where: { id_materia: parseInt(id) },
    });
    res.status(200).json({ message: 'Matéria excluída com sucesso.', materia: materiaDeletada });
  } catch (error) {
    console.error("Erro ao deletar matéria:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Matéria não encontrada para exclusão.' });
    }
    res.status(500).json({ error: 'Erro interno do servidor ao deletar matéria.' });
  }
});

module.exports = router;