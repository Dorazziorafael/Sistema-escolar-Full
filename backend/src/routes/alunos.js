const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rota para criar um novo aluno (POST /alunos)
router.post('/', async (req, res) => {
    const { nome_aluno, data_nascimento, matricula, email, semestre } = req.body;

    // Validação de data_nascimento: É crucial que seja uma data válida, pois @db.Date e não é opcional.
    if (!data_nascimento || isNaN(new Date(data_nascimento).getTime())) {
        return res.status(400).json({ error: 'Data de nascimento inválida. Formato esperado: YYYY-MM-DD.' });
    }

    // Validação e tratamento de semestre:
    // Se o semestre não for fornecido, ou for vazio/nulo, ou não for um número válido,
    // usamos 'undefined' para que o @default(1) do schema.prisma seja aplicado.
    let semestreParaDB = undefined; // Valor padrão para usar o default do DB
    if (semestre !== undefined && semestre !== null && semestre !== '') {
        const parsedSemestre = parseInt(semestre);
        if (!isNaN(parsedSemestre)) {
            semestreParaDB = parsedSemestre;
        } else {
            // Se foi fornecido, mas não é um número válido
            return res.status(400).json({ error: 'Semestre inválido. Deve ser um número inteiro.' });
        }
    }

    try {
        const novoAluno = await prisma.aluno.create({
            data: {
                nome_aluno,
                data_nascimento: new Date(data_nascimento), // Converte para objeto Date
                matricula,
                email,
                semestre: semestreParaDB, // Usará o valor parseado ou undefined para o default
            }
        });

        res.status(201).json(novoAluno);
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        if (error.code === 'P2002') { // Erro de violação de restrição única (matricula ou email)
            return res.status(409).json({ error: 'Matrícula ou E-mail já cadastrados.' });
        }
        if (error.code === 'P2007') { // Erro de validação de dados do Prisma (ex: data ou tipo)
             return res.status(400).json({ error: 'Erro de validação de dados. Verifique os valores fornecidos.', details: error.message });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao criar aluno.', details: error.message });
    }
});

// Rota para listar todos os alunos (GET /alunos)
router.get('/', async (req, res) => {
    try {
        const alunos = await prisma.aluno.findMany();
        res.status(200).json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar alunos.', details: error.message });
    }
});

// Rota para buscar um aluno por ID (GET /alunos/:id)
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    // Validação inicial para garantir que o ID é um número
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID do aluno inválido. Deve ser um número inteiro.' });
    }

    try {
        const aluno = await prisma.aluno.findUnique({
            where: { id_aluno: parseInt(id) }, // Usando id_aluno
            include: {
                cursos_matriculados: {
                    include: {
                        curso: true
                    }
                }
            }
        });

        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }
        res.status(200).json(aluno);
    } catch (error) {
        console.error('Erro ao buscar aluno por ID:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar aluno.', details: error.message });
    }
});

// Rota para atualizar um aluno por ID (PUT /alunos/:id)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome_aluno, data_nascimento, matricula, email, semestre } = req.body;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID do aluno inválido para atualização. Deve ser um número inteiro.' });
    }

    // Objeto para armazenar apenas os campos que serão atualizados
    const dataToUpdate = {};

    if (nome_aluno !== undefined) dataToUpdate.nome_aluno = nome_aluno;
    if (matricula !== undefined) dataToUpdate.matricula = matricula;
    if (email !== undefined) dataToUpdate.email = email;

    // Tratamento de data_nascimento para UPDATE:
    // Se a data_nascimento for fornecida (não undefined)
    if (data_nascimento !== undefined) {
        if (data_nascimento === null || data_nascimento === '') {
            // Se for null ou string vazia, e o campo permite null no schema, envie null.
            // No seu schema, data_nascimento é obrigatório (@db.Date sem '?').
            // Então, null ou vazio aqui indicaria um erro de validação ou intenção.
            return res.status(400).json({ error: 'Data de nascimento não pode ser vazia ou nula na atualização.' });
        }
        const parsedDate = new Date(data_nascimento);
        if (!isNaN(parsedDate.getTime())) {
            dataToUpdate.data_nascimento = parsedDate;
        } else {
            return res.status(400).json({ error: 'Formato de data de nascimento inválido para atualização. Esperado: YYYY-MM-DD.' });
        }
    }

    // Tratamento de semestre para UPDATE:
    if (semestre !== undefined) {
        if (semestre === null || semestre === '') {
            // Se for null ou string vazia, e você quer que volte para o default (1) ou null
            // No seu schema tem @default(1), então undefined faria isso.
            dataToUpdate.semestre = undefined; // Deixa o default do DB agir se o Prisma suportar para updates
        } else {
            const parsedSemestre = parseInt(semestre);
            if (!isNaN(parsedSemestre)) {
                dataToUpdate.semestre = parsedSemestre;
            } else {
                return res.status(400).json({ error: 'Semestre inválido para atualização. Deve ser um número inteiro.' });
            }
        }
    }
    
    try {
        const alunoAtualizado = await prisma.aluno.update({
            where: { id_aluno: parseInt(id) }, 
            data: dataToUpdate, // Usando o objeto com apenas os campos a serem atualizados
        });
        res.status(200).json(alunoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        if (error.code === 'P2025') { // Aluno não encontrado
            return res.status(404).json({ error: 'Aluno não encontrado para atualização.' });
        }
        if (error.code === 'P2002') { // Matrícula ou E-mail já cadastrados
            return res.status(409).json({ error: 'Matrícula ou E-mail já cadastrados.' });
        }
        if (error.code === 'P2007') { // Erro de validação de dados do Prisma
            return res.status(400).json({ error: 'Erro de validação de dados na atualização. Verifique os valores fornecidos.', details: error.message });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar aluno.', details: error.message });
    }
});

// Rota para deletar um aluno por ID (DELETE /alunos/:id)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID do aluno inválido para exclusão. Deve ser um número inteiro.' });
    }

    try {
        await prisma.aluno.delete({
            where: { id_aluno: parseInt(id) }, 
        });
        res.status(200).json({ message: 'Aluno excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar aluno:', error);
        if (error.code === 'P2025') { // Aluno não encontrado
            return res.status(404).json({ error: 'Aluno não encontrado para exclusão.' });
        }
        if (error.code === 'P2003') { // Chave estrangeira falhou (aluno tem dependências)
            return res.status(400).json({ error: 'Não é possível deletar o aluno. Existem cursos matriculados vinculados a ele.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao deletar aluno.', details: error.message });
    }
});

module.exports = router;