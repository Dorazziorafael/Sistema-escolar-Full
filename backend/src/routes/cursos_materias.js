const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Rota para ASSOCIAR uma matéria a um curso (POST /curso-materias)
router.post('/', async (req, res) => {
    // Usar curso_id e materia_id conforme o schema.prisma
    const { curso_id, materia_id } = req.body; 

    // Validação para garantir que os IDs são números válidos
    if (isNaN(parseInt(curso_id)) || isNaN(parseInt(materia_id))) {
        return res.status(400).json({ error: 'IDs de curso e matéria devem ser números inteiros válidos.' });
    }

    try {
        // Opcional: Verificar se curso e matéria existem antes de tentar criar a associação
        const cursoExistente = await prisma.curso.findUnique({ where: { id_curso: parseInt(curso_id) } });
        const materiaExistente = await prisma.materia.findUnique({ where: { id_materia: parseInt(materia_id) } });

        if (!cursoExistente || !materiaExistente) {
            return res.status(400).json({ error: 'Curso ou Matéria não encontrado para associação.' });
        }

        const cursoMateria = await prisma.cursoMateria.create({
            data: {
                curso_id: parseInt(curso_id),
                materia_id: parseInt(materia_id),
            },
            include: { 
                curso: true,
                materia: true
            }
        });

        res.status(201).json(cursoMateria); 
    } catch (error) {
        console.error('Erro ao associar matéria a curso:', error);
        if (error.code === 'P2002') { 
            return res.status(409).json({ error: 'Matéria já associada a este curso.' });
        }
        if (error.code === 'P2003') { 
            return res.status(400).json({ error: 'Falha na chave estrangeira: Curso ou Matéria inexistente.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao associar matéria ao curso.', details: error.message });
    }
});

// 2. Rota para LISTAR TODAS as associações de curso e matéria (GET /curso-materias)
router.get('/', async (req, res) => {
    try {
        const cursosMaterias = await prisma.cursoMateria.findMany({
            include: {
                curso: true,
                materia: true
            }
        });
        res.status(200).json(cursosMaterias);
    } catch (error) {
        console.error('Erro ao buscar associações de cursos e matérias:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar associações.', details: error.message });
    }
});

// 3. Rota para LISTAR matérias de um CURSO ESPECÍFICO (GET /curso-materias/curso/:cursoId)
router.get('/curso/:cursoId', async (req, res) => {
    const { cursoId } = req.params;

    if (isNaN(parseInt(cursoId))) {
        return res.status(400).json({ error: 'ID do curso inválido. Deve ser um número inteiro.' });
    }

    try {
        const materiasDoCurso = await prisma.cursoMateria.findMany({
            where: {
                curso_id: parseInt(cursoId)
            },
            include: {
                materia: true 
            }
        });

        if (materiasDoCurso.length === 0) {
            return res.status(200).json([]); 
        }
        res.status(200).json(materiasDoCurso);
    } catch (error) {
        console.error('Erro ao buscar matérias do curso:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar matérias do curso.', details: error.message });
    }
});

// 4. Rota para LISTAR cursos que oferecem uma MATÉRIA ESPECÍFICA (GET /curso-materias/materia/:materiaId)
router.get('/materia/:materiaId', async (req, res) => {
    const { materiaId } = req.params;

    if (isNaN(parseInt(materiaId))) {
        return res.status(400).json({ error: 'ID da matéria inválido. Deve ser um número inteiro.' });
    }

    try {
        const cursosDaMateria = await prisma.cursoMateria.findMany({
            where: {
                materia_id: parseInt(materiaId)
            },
            include: {
                curso: true 
            }
        });

        if (cursosDaMateria.length === 0) {
            return res.status(200).json([]); 
        }
        res.status(200).json(cursosDaMateria);
    } catch (error) {
        console.error('Erro ao buscar cursos da matéria:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar cursos da matéria.', details: error.message });
    }
});

// 5. Rota para DESASSOCIAR uma matéria de um curso (DELETE /curso-materias/:cursoId/:materiaId)
router.delete('/:cursoId/:materiaId', async (req, res) => {
    const { cursoId, materiaId } = req.params;

    // Validação de IDs
    if (isNaN(parseInt(cursoId)) || isNaN(parseInt(materiaId))) {
        return res.status(400).json({ error: 'IDs de curso e matéria devem ser números inteiros válidos.' });
    }

    try {
        await prisma.cursoMateria.delete({
            where: {
                // A chave primária composta no Prisma para CursoMateria é curso_id_materia_id
                curso_id_materia_id: {
                    curso_id: parseInt(cursoId),
                    materia_id: parseInt(materiaId)
                }
            }
        });
        res.status(204).send(); 
    } catch (error) {
        console.error('Erro ao desassociar matéria de curso:', error);
        if (error.code === 'P2025') { 
            return res.status(404).json({ error: 'Associação de curso e matéria não encontrada.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao desassociar matéria de curso.', details: error.message });
    }
});

module.exports = router;