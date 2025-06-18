const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Rota para listar todos os cursos
router.get('/', async (req, res) => {
    try {
        const cursos = await prisma.curso.findMany({
            include: {
               
                materias_oferecidas: { // Nome da relação: materias_oferecidas
                    include: {
                        materia: true // Inclui os detalhes da matéria associada
                    }
                },
                professores_do_curso: { // Nome da relação: professores_do_curso
                    include: {
                        professor: true // Inclui os detalhes do professor associado
                    }
                },
                alunos_matriculados: { // Nome da relação: alunos_matriculados
                    include: {
                        aluno: true // Inclui os detalhes do aluno associado
                    }
                }
            }
        });
        res.json(cursos);
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar cursos.', details: error.message });
    }
});

// Rota para buscar um curso por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const curso = await prisma.curso.findUnique({
            where: { id_curso: parseInt(id) }, // id_curso é o campo ID
            include: {
                materias_oferecidas: {
                    include: {
                        materia: true
                    }
                },
                professores_do_curso: {
                    include: {
                        professor: true
                    }
                },
                alunos_matriculados: {
                    include: {
                        aluno: true
                    }
                }
            }
        });
        if (!curso) {
            return res.status(404).json({ error: 'Curso não encontrado.' });
        }
        res.json(curso);
    } catch (error) {
        console.error('Erro ao buscar curso por ID:', error);
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID do curso inválido. Deve ser um número inteiro.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao buscar curso.', details: error.message });
    }
});

// Rota para CRIAR um novo curso
router.post('/', async (req, res) => {
    const { nome_curso, carga_horaria, numero_semestres, descricao } = req.body;

    console.log('Dados recebidos para criar curso (após desestruturação):', { nome_curso, carga_horaria, numero_semestres, descricao });

    // Validação robusta no backend
    if (!nome_curso || typeof nome_curso !== 'string' || nome_curso.trim() === '') {
        return res.status(400).json({ error: 'Nome do curso é obrigatório e deve ser uma string não vazia.' });
    }

    const parsedCargaHoraria = parseInt(carga_horaria);
    if (isNaN(parsedCargaHoraria) || parsedCargaHoraria <= 0) {
        return res.status(400).json({ error: 'Carga horária é obrigatória e deve ser um número inteiro positivo.' });
    }

    const parsedNumeroSemestres = numero_semestres !== undefined && numero_semestres !== null ? parseInt(numero_semestres) : null;
    if (parsedNumeroSemestres !== null && (isNaN(parsedNumeroSemestres) || parsedNumeroSemestres <= 0)) {
        return res.status(400).json({ error: 'Número de semestres, se fornecido, deve ser um número inteiro positivo.' });
    }

    // A descrição é opcional, pode ser uma string vazia ou null/undefined.
    // Se for string vazia, salva como null, se o schema permitir (String?).
    const finalDescricao = (descricao === '' || descricao === undefined) ? null : descricao;


    try {
        const novoCurso = await prisma.curso.create({
            data: {
                nome_curso,
                carga_horaria: parsedCargaHoraria,
                numero_semestres: parsedNumeroSemestres,
                descricao: finalDescricao,
            },
        });
        res.status(201).json(novoCurso);
    } catch (error) {
        console.error('Erro ao criar curso:', error);
        if (error.code === 'P2002' && error.meta?.target?.includes('nome_curso')) {
            return res.status(409).json({ error: 'Já existe um curso com este nome.' });
        }
        // P2000: Valor inválido para o tipo (ex: string muito longa, ou valor que não se encaixa no tipo)
        // P2003: Falha na restrição de chave estrangeira (menos provável para criação de curso base)
        if (error.code === 'P2000') {
            return res.status(400).json({ error: 'Dados inválidos para o curso. Verifique os tipos dos campos.', details: error.message });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao criar curso.', details: error.message });
    }
});

// Rota para atualizar um curso
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_curso, carga_horaria, numero_semestres, descricao } = req.body;

    const updateData = {};

    if (nome_curso !== undefined) {
        if (typeof nome_curso !== 'string' || nome_curso.trim() === '') {
            return res.status(400).json({ error: 'Nome do curso deve ser uma string não vazia.' });
        }
        updateData.nome_curso = nome_curso;
    }

    if (carga_horaria !== undefined) {
        const parsedCargaHoraria = parseInt(carga_horaria);
        if (isNaN(parsedCargaHoraria) || parsedCargaHoraria <= 0) {
            return res.status(400).json({ error: 'Carga horária deve ser um número inteiro positivo.' });
        }
        updateData.carga_horaria = parsedCargaHoraria;
    }

    if (numero_semestres !== undefined) {
        const parsedNumeroSemestres = parseInt(numero_semestres);
        if (isNaN(parsedNumeroSemestres) || parsedNumeroSemestres <= 0) {
             // Se o cliente explicitamente enviar null ou 0, e o campo for Int?, isso deve ser permitido.
             // Para simplificar, estamos tratando 0 ou valores inválidos como erro aqui,
             // exceto se for explicitamente null.
            if (numero_semestres === null) {
                updateData.numero_semestres = null;
            } else {
                 return res.status(400).json({ error: 'Número de semestres deve ser um número inteiro positivo ou nulo.' });
            }
        } else {
            updateData.numero_semestres = parsedNumeroSemestres;
        }
    } else {
        // Se numero_semestres NÃO for fornecido no body, não o inclua no updateData
        // para que o Prisma não tente alterá-lo.
    }
    

    if (descricao !== undefined) {
        updateData.descricao = (descricao === '' || descricao === undefined) ? null : descricao;
    }

    try {
        const cursoAtualizado = await prisma.curso.update({
            where: { id_curso: parseInt(id) },
            data: updateData,
        });
        res.status(200).json(cursoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar curso:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Curso não encontrado para atualização.' });
        }
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID do curso inválido para atualização. Deve ser um número inteiro.' });
        }
        if (error.code === 'P2000') {
            return res.status(400).json({ error: 'Dados inválidos para o curso. Verifique os tipos dos campos.', details: error.message });
        }
        if (error.code === 'P2002' && error.meta?.target?.includes('nome_curso')) {
            return res.status(409).json({ error: 'Já existe outro curso com este nome.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar curso.', details: error.message });
    }
});

// Rota para deletar um curso
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.curso.delete({
            where: { id_curso: parseInt(id) },
        });
        res.status(200).json({ message: 'Curso excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar curso:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Curso não encontrado para exclusão.' });
        }
        // P2003: Foreign Key Constraint violation
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Não é possível deletar o curso. Existem alunos, matérias ou professores vinculados a ele.' });
        }
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'ID do curso inválido para exclusão. Deve ser um número inteiro.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao deletar curso.', details: error.message });
    }
});

module.exports = router;