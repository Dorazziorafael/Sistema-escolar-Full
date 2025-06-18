const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Rota para ASSOCIAR um professor a um curso (POST /professor-cursos)
router.post('/', async (req, res) => {
    const { professor_id, curso_id } = req.body; 

    // Validação para garantir que os IDs são números válidos
    if (isNaN(parseInt(professor_id)) || isNaN(parseInt(curso_id))) {
        return res.status(400).json({ error: 'IDs de professor e curso devem ser números inteiros válidos.' });
    }

    try {
        // Opcional: Verificar se professor e curso existem antes de tentar criar a associação
        const professorExistente = await prisma.professor.findUnique({ where: { id_professor: parseInt(professor_id) } });
        const cursoExistente = await prisma.curso.findUnique({ where: { id_curso: parseInt(curso_id) } });

        if (!professorExistente || !cursoExistente) {
            return res.status(400).json({ error: 'Professor ou Curso não encontrado para associação.' });
        }

        const professorCurso = await prisma.professorCurso.create({
            data: {
                professor_id: parseInt(professor_id),
                curso_id: parseInt(curso_id),
            },
            include: { 
                professor: true,
                curso: true
            }
        });

        res.status(201).json(professorCurso); 
    } catch (error) {
        console.error('Erro ao associar professor a curso:', error);
        if (error.code === 'P2002') { 
            return res.status(409).json({ error: 'Professor já associado a este curso.' });
        }
        if (error.code === 'P2003') { 
            return res.status(400).json({ error: 'Falha na chave estrangeira: Professor ou Curso inexistente.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao associar professor ao curso.', details: error.message });
    }
});

// 2. Rota para LISTAR TODAS as associações de professor e curso (GET /professor-cursos)
router.get('/', async (req, res) => {
    try {
        const professoresCursos = await prisma.professorCurso.findMany({
            include: {
                professor: true,
                curso: true
            }
        });
        res.status(200).json(professoresCursos);
    } catch (error) {
        console.error('Erro ao buscar associações de professores e cursos:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar associações.', details: error.message });
    }
});

// 3. Rota para LISTAR cursos que um PROFESSOR ESPECÍFICO ministra (GET /professor-cursos/professor/:professorId)
router.get('/professor/:professorId', async (req, res) => {
    const { professorId } = req.params;

    if (isNaN(parseInt(professorId))) {
        return res.status(400).json({ error: 'ID do professor inválido. Deve ser um número inteiro.' });
    }

    try {
        const cursosDoProfessor = await prisma.professorCurso.findMany({
            where: {
                professor_id: parseInt(professorId)
            },
            include: {
                curso: true 
            }
        });

        if (cursosDoProfessor.length === 0) {
            return res.status(200).json([]); 
        }
        res.status(200).json(cursosDoProfessor);
    } catch (error) {
        console.error('Erro ao buscar cursos do professor:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar cursos do professor.', details: error.message });
    }
});

// 4. Rota para LISTAR professores de um CURSO ESPECÍFICO (GET /professor-cursos/curso/:cursoId)
router.get('/curso/:cursoId', async (req, res) => {
    const { cursoId } = req.params;

    if (isNaN(parseInt(cursoId))) {
        return res.status(400).json({ error: 'ID do curso inválido. Deve ser um número inteiro.' });
    }

    try {
        const professoresDoCurso = await prisma.professorCurso.findMany({
            where: {
                curso_id: parseInt(cursoId)
            },
            include: {
                professor: true 
            }
        });

        if (professoresDoCurso.length === 0) {
            return res.status(200).json([]); 
        }
        res.status(200).json(professoresDoCurso);
    } catch (error) {
        console.error('Erro ao buscar professores do curso:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar professores do curso.', details: error.message });
    }
});

// 5. Rota para DESASSOCIAR um professor de um curso (DELETE /professor-cursos/:professorId/:cursoId)
router.delete('/:professorId/:cursoId', async (req, res) => {
    const { professorId, cursoId } = req.params;

    // Validação de IDs
    if (isNaN(parseInt(professorId)) || isNaN(parseInt(cursoId))) {
        return res.status(400).json({ error: 'IDs de professor e curso devem ser números inteiros válidos.' });
    }

    try {
        await prisma.professorCurso.delete({
            where: {
                professor_id_curso_id: {
                    professor_id: parseInt(professorId),
                    curso_id: parseInt(cursoId)
                }
            }
        });
        res.status(204).send(); 
    } catch (error) {
        console.error('Erro ao desassociar professor de curso:', error);
        if (error.code === 'P2025') { 
            return res.status(404).json({ error: 'Associação de professor e curso não encontrada.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao desassociar professor de curso.', details: error.message });
    }
});

module.exports = router;