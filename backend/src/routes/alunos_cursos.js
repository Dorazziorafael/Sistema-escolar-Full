const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Rota para MATRICULAR um aluno em um curso (POST /aluno-cursos)
router.post('/', async (req, res) => {
    // Usar aluno_id e curso_id conforme o schema.prisma
    const { aluno_id, curso_id } = req.body; 

    // Validação para garantir que os IDs são números válidos
    if (isNaN(parseInt(aluno_id)) || isNaN(parseInt(curso_id))) {
        return res.status(400).json({ error: 'IDs de aluno e curso devem ser números inteiros válidos.' });
    }

    try {
        // Opcional: Verificar se aluno e curso existem antes de tentar criar a matrícula
        const alunoExistente = await prisma.aluno.findUnique({ where: { id_aluno: parseInt(aluno_id) } });
        const cursoExistente = await prisma.curso.findUnique({ where: { id_curso: parseInt(curso_id) } });

        if (!alunoExistente || !cursoExistente) {
            return res.status(400).json({ error: 'Aluno ou Curso não encontrado para matricular.' });
        }

        const alunoCurso = await prisma.alunoCurso.create({
            data: {
                aluno_id: parseInt(aluno_id),
                curso_id: parseInt(curso_id),
                // data_matricula e status_matricula usarão os defaults do schema se não fornecidos
            },
            include: { 
                aluno: true,
                curso: true
            }
        });

        res.status(201).json(alunoCurso); 
    } catch (error) {
        console.error('Erro ao matricular aluno em curso:', error);
        if (error.code === 'P2002') { 
            return res.status(409).json({ error: 'Aluno já matriculado neste curso.' });
        }
        if (error.code === 'P2003') { 
            return res.status(400).json({ error: 'Falha na chave estrangeira: Aluno ou Curso inexistente.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao matricular aluno.', details: error.message });
    }
});

// 2. Rota para LISTAR TODAS as matrículas (GET /aluno-cursos)
router.get('/', async (req, res) => {
    try {
        const alunosCursos = await prisma.alunoCurso.findMany({
            include: {
                aluno: true,
                curso: true
            }
        });
        res.status(200).json(alunosCursos);
    } catch (error) {
        console.error('Erro ao buscar matrículas de alunos em cursos:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar matrículas.', details: error.message });
    }
});

// 3. Rota para LISTAR matrículas de um ALUNO ESPECÍFICO (GET /aluno-cursos/aluno/:alunoId)
router.get('/aluno/:alunoId', async (req, res) => {
    const { alunoId } = req.params;

    if (isNaN(parseInt(alunoId))) {
        return res.status(400).json({ error: 'ID do aluno inválido. Deve ser um número inteiro.' });
    }

    try {
        const matriculasDoAluno = await prisma.alunoCurso.findMany({
            where: {
                aluno_id: parseInt(alunoId)
            },
            include: {
                curso: true 
            }
        });

        if (matriculasDoAluno.length === 0) {
            return res.status(200).json([]); 
        }
        res.status(200).json(matriculasDoAluno);
    } catch (error) {
        console.error('Erro ao buscar matrículas do aluno:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar matrículas do aluno.', details: error.message });
    }
});

// 4. Rota para LISTAR matrículas em um CURSO ESPECÍFICO (GET /aluno-cursos/curso/:cursoId)
router.get('/curso/:cursoId', async (req, res) => {
    const { cursoId } = req.params;

    if (isNaN(parseInt(cursoId))) {
        return res.status(400).json({ error: 'ID do curso inválido. Deve ser um número inteiro.' });
    }

    try {
        const alunosDoCurso = await prisma.alunoCurso.findMany({
            where: {
                curso_id: parseInt(cursoId)
            },
            include: {
                aluno: true 
            }
        });

        if (alunosDoCurso.length === 0) {
            return res.status(200).json([]); 
        }
        res.status(200).json(alunosDoCurso);
    } catch (error) {
        console.error('Erro ao buscar alunos do curso:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar alunos do curso.', details: error.message });
    }
});


// 5. Rota para DESMATRICULAR um aluno de um curso (DELETE /aluno-cursos/:alunoId/:cursoId)
router.delete('/:alunoId/:cursoId', async (req, res) => {
    const { alunoId, cursoId } = req.params;

    // Validação de IDs
    if (isNaN(parseInt(alunoId)) || isNaN(parseInt(cursoId))) {
        return res.status(400).json({ error: 'IDs de aluno e curso devem ser números inteiros válidos.' });
    }

    try {
        await prisma.alunoCurso.delete({
            where: {
                // A chave primária composta no Prisma para AlunoCurso é aluno_id_curso_id
                aluno_id_curso_id: {
                    aluno_id: parseInt(alunoId),
                    curso_id: parseInt(cursoId)
                }
            }
        });
        res.status(204).send(); 
    } catch (error) {
        console.error('Erro ao desmatricular aluno:', error);
        if (error.code === 'P2025') { 
            return res.status(404).json({ error: 'Matrícula não encontrada.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao desmatricular aluno.', details: error.message });
    }
});

module.exports = router;