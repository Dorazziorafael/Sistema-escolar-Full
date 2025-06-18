import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import formStyles from './CursoForm.module.css'; 
import appStyles from '../../App.module.css'; 

function CursoForm({ onCursoCreated }) {
    const [nome_curso, setNomeCurso] = useState('');
    const [carga_horaria, setCargaHoraria] = useState('');
    const [numero_semestres, setNumeroSemestres] = useState('');
    const [descricao, setDescricao] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!nome_curso || !carga_horaria) {
            setError('Nome do curso e Carga Horária são campos obrigatórios.');
            setLoading(false);
            return;
        }

        if (isNaN(parseInt(carga_horaria))) {
            setError('Carga Horária deve ser um número válido.');
            setLoading(false);
            return;
        }
        if (numero_semestres && isNaN(parseInt(numero_semestres))) {
            setError('Número de Semestres deve ser um número válido.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/cursos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome_curso,
                    carga_horaria: parseInt(carga_horaria),
                    numero_semestres: numero_semestres ? parseInt(numero_semestres) : null,
                    descricao
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao cadastrar curso.');
            }

            const newCurso = await response.json();

            setNomeCurso('');
            setCargaHoraria('');
            setNumeroSemestres('');
            setDescricao('');

            if (onCursoCreated) {
                onCursoCreated(newCurso);
            }

            navigate('/cursos');

        } catch (err) {
            console.error('Erro no cadastro de curso:', err);
            setError(`Erro ao cadastrar curso: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={formStyles.container}>
            <h2>Cadastrar Novo Curso</h2>
            {error && <div className={appStyles.errorMessage}>{error}</div>}
            <form onSubmit={handleSubmit} className={formStyles.form}>
                <div className={formStyles.formGroup}>
                    <label htmlFor="nome_curso">Nome do Curso:</label>
                    <input
                        type="text"
                        id="nome_curso"
                        className={formStyles.input}
                        value={nome_curso}
                        onChange={(e) => setNomeCurso(e.target.value)}
                        required
                    />
                </div>
                <div className={formStyles.formGroup}>
                    <label htmlFor="carga_horaria">Carga Horária (horas):</label>
                    <input
                        type="number"
                        id="carga_horaria"
                        className={formStyles.input}
                        value={carga_horaria}
                        onChange={(e) => setCargaHoraria(e.target.value)}
                        required
                        min="1"
                    />
                </div>
                <div className={formStyles.formGroup}>
                    <label htmlFor="numero_semestres">Número de Semestres:</label>
                    <input
                        type="number"
                        id="numero_semestres"
                        className={formStyles.input}
                        value={numero_semestres}
                        onChange={(e) => setNumeroSemestres(e.target.value)}
                        min="1"
                    />
                </div>
                <div className={formStyles.formGroup}>
                    <label htmlFor="descricao">Descrição:</label>
                    <textarea
                        id="descricao"
                        className={formStyles.textarea}
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        rows="3"
                    ></textarea>
                </div>
                <div className={formStyles.buttonGroup}>
                    <button
                        type="submit"
                        className={formStyles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar Curso'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/cursos')}
                        className={formStyles.backButton} 
                        disabled={loading}
                    >
                        Voltar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CursoForm;