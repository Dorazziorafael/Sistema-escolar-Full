const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Rota para ASSOCIAR uma matéria a um professor (POST /professores-materias)
router.post('/', async (req, res) => {
    // Usar professor_id e materia_id conforme o schema.prisma
    const { professor_id, materia_id } = req.body; 

    // Validação para garantir que os IDs são números válidos
    if (isNaN(parseInt(professor_id)) || isNaN(parseInt(materia_id))) {
        return res.status(400).json({ error: 'IDs de professor e matéria devem ser números inteiros válidos.' });
    }

    try {
        // Opcional: Verificar se professor e matéria existem antes de tentar criar a associação
        const professorExistente = await prisma.professor.findUnique({ where: { id_professor: parseInt(professor_id) } });
        const materiaExistente = await prisma.materia.findUnique({ where: { id_materia: parseInt(materia_id) } });

        if (!professorExistente || !materiaExistente) {
            return res.status(400).json({ error: 'Professor ou Matéria não encontrado.' });
        }

        // Regra de Negócio: Limitar professor a no máximo 3 matérias
        const countMateriasProfessor = await prisma.professorMateria.count({
            where: { professor_id: parseInt(professor_id) }, // Corrigido para professor_id
        });

        if (countMateriasProfessor >= 3) {
            return res.status(400).json({ error: `Este professor (${professorExistente.nome_professor}) já ministra o número máximo de 3 matérias.` });
        }

        const professorMateria = await prisma.professorMateria.create({
            data: {
                professor_id: parseInt(professor_id), // Corrigido para professor_id
                materia_id: parseInt(materia_id),     // Corrigido para materia_id
            },
            include: { // Opcional: Incluir os detalhes do professor e matéria na resposta
                professor: true,
                materia: true
            }
        });

        res.status(201).json(professorMateria); 
    } catch (error) {
        console.error('Erro ao associar matéria a professor:', error);
        if (error.code === 'P2002') { 
            return res.status(409).json({ error: 'Professor já associado a esta matéria.' });
        }
        if (error.code === 'P2003') { 
            return res.status(400).json({ error: 'Falha na chave estrangeira: Professor ou Matéria inexistente.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao associar matéria ao professor.', details: error.message });
    }
});

// 2. Rota para LISTAR TODAS as associações de professor e matéria (GET /professores-materias)
router.get('/', async (req, res) => {
    try {
        const professoresMaterias = await prisma.professorMateria.findMany({
            include: {
                professor: true,
                materia: true
            }
        });
        res.status(200).json(professoresMaterias);
    } catch (error) {
        console.error('Erro ao buscar associações de professores e matérias:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar associações.', details: error.message });
    }
});

// 3. Rota para LISTAR matérias que um PROFESSOR ESPECÍFICO ministra (GET /professores-materias/professor/:professorId)
router.get('/professor/:professorId', async (req, res) => {
    const { professorId } = req.params;

    if (isNaN(parseInt(professorId))) {
        return res.status(400).json({ error: 'ID do professor inválido. Deve ser um número inteiro.' });
    }

    try {
        const materiasDoProfessor = await prisma.professorMateria.findMany({
            where: {
                professor_id: parseInt(professorId) // Corrigido para professor_id
            },
            include: {
                materia: true // Inclui os detalhes da matéria para cada associação
            }
        });

        if (materiasDoProfessor.length === 0) {
            return res.status(200).json([]); 
        }
        res.status(200).json(materiasDoProfessor);
    } catch (error) {
        console.error('Erro ao buscar matérias do professor:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar matérias do professor.', details: error.message });
    }
});

// 4. Rota para LISTAR professores que ministram uma MATÉRIA ESPECÍFICA (GET /professores-materias/materia/:materiaId)
router.get('/materia/:materiaId', async (req, res) => {
    const { materiaId } = req.params;

    if (isNaN(parseInt(materiaId))) {
        return res.status(400).json({ error: 'ID da matéria inválido. Deve ser um número inteiro.' });
    }

    try {
        const professoresDaMateria = await prisma.professorMateria.findMany({
            where: {
                materia_id: parseInt(materiaId) // Corrigido para materia_id
            },
            include: {
                professor: true // Inclui os detalhes do professor para cada associação
            }
        });

        if (professoresDaMateria.length === 0) {
            return res.status(200).json([]); 
        }
        res.status(200).json(professoresDaMateria);
    } catch (error) {
        console.error('Erro ao buscar professores da matéria:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar professores da matéria.', details: error.message });
    }
});

// 5. Rota para DESASSOCIAR uma matéria de um professor (DELETE /professores-materias/:professorId/:materiaId)
router.delete('/:professorId/:materiaId', async (req, res) => {
    const { professorId, materiaId } = req.params;

    // Validação de IDs
    if (isNaN(parseInt(professorId)) || isNaN(parseInt(materiaId))) {
        return res.status(400).json({ error: 'IDs de professor e matéria devem ser números inteiros válidos.' });
    }

    try {
        await prisma.professorMateria.delete({
            where: {
                // A chave primária composta no Prisma para ProfessorMateria é professor_id_materia_id
                professor_id_materia_id: {
                    professor_id: parseInt(professorId), // Corrigido para professor_id
                    materia_id: parseInt(materiaId)     // Corrigido para materia_id
                }
            }
        });
        res.status(204).send(); 
    } catch (error) {
        console.error('Erro ao desassociar matéria de professor:', error);
        if (error.code === 'P2025') { 
            return res.status(404).json({ error: 'Associação de professor e matéria não encontrada.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao desassociar matéria de professor.', details: error.message });
    }
});

module.exports = router;