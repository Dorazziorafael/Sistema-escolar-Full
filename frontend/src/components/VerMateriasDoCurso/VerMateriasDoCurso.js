// frontend/src/components/VerMateriasDoCurso/VerMateriasDoCurso.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './VerMateriasDoCurso.module.css'; 

function VerMateriasDoCurso() {
    const { idCurso } = useParams();
    const navigate = useNavigate();

    const [materias, setMaterias] = useState([]);
    const [novaMateriaNome, setNovaMateriaNome] = useState('');
    const [novaMateriaCreditos, setNovaMateriaCreditos] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cursoNome, setCursoNome] = useState('');

    const fetchMateriasDoCurso = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/cursos/${idCurso}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao buscar curso e matérias.');
            }
            const cursoData = await response.json();
            setCursoNome(cursoData.nome_curso);
            setMaterias(cursoData.materias_oferecidas.map(cm => ({
                id_materia: cm.materia.id_materia,
                nome_materia: cm.materia.nome_materia,
                creditos: cm.materia.creditos,
            })));
        } catch (err) {
            console.error("Erro ao buscar matérias do curso:", err);
            setError(err.message || "Não foi possível carregar as matérias.");
        } finally {
            setLoading(false);
        }
    }, [idCurso]);

    useEffect(() => {
        if (idCurso) {
            fetchMateriasDoCurso();
        }
    }, [idCurso, fetchMateriasDoCurso]);

    const handleAddMateria = async (e) => {
        e.preventDefault();
        setError(null);

        if (!novaMateriaNome.trim() || isNaN(parseInt(novaMateriaCreditos)) || parseInt(novaMateriaCreditos) <= 0) {
            setError('Nome da matéria e créditos (número inteiro positivo) são obrigatórios.');
            return;
        }

        try {
            const createMateriaResponse = await fetch('http://localhost:5000/materias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome_materia: novaMateriaNome,
                    creditos: parseInt(novaMateriaCreditos),
                }),
            });

            if (!createMateriaResponse.ok) {
                const errorData = await createMateriaResponse.json();
                throw new Error(errorData.error || 'Erro ao criar a nova matéria.');
            }
            const novaMateriaCriada = await createMateriaResponse.json();
            const materiaIdParaVincular = novaMateriaCriada.id_materia;

            const associateResponse = await fetch('http://localhost:5000/cursos-materias', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    curso_id: parseInt(idCurso),
                    materia_id: materiaIdParaVincular,
                }),
            });

            if (!associateResponse.ok) {
                const errorData = await associateResponse.json();
                throw new Error(errorData.error || 'Erro ao vincular matéria ao curso.');
            }

            setNovaMateriaNome('');
            setNovaMateriaCreditos('');
            fetchMateriasDoCurso();
            alert('Matéria criada e vinculada com sucesso!');
        } catch (err) {
            console.error("Erro completo ao adicionar matéria:", err);
            setError(err.message || "Não foi possível criar e vincular a matéria.");
        }
    };

    const handleRemoveMateria = async (materiaIdToRemove) => {
        if (!window.confirm(`Tem certeza que deseja remover esta matéria (ID: ${materiaIdToRemove}) do curso ${cursoNome}? Esta ação irá apenas desvincular a matéria, não a excluirá do sistema.`)) {
            return;
        }

        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/cursos-materias/${idCurso}/${materiaIdToRemove}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao remover a matéria do curso.');
            }

            fetchMateriasDoCurso();
            alert('Matéria removida do curso com sucesso!');
        } catch (err) {
            console.error("Erro ao remover matéria:", err);
            setError(err.message || "Não foi possível remover a matéria do curso.");
        }
    };

    if (loading) {
        return <p className={styles.loadingMessage}>Carregando matérias do curso...</p>;
    }

    return (
        <div className={styles.container}>
            <h2>Gerenciar Matérias do Curso: {cursoNome} (ID: {idCurso})</h2>
            {error && <p className={styles.errorMessage}>Erro: {error}</p>}

            <div className={styles.formSection}>
                <h4>Criar Nova Matéria e Vincular a Este Curso</h4>
                <form onSubmit={handleAddMateria} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Nome da Nova Matéria"
                        value={novaMateriaNome}
                        onChange={(e) => setNovaMateriaNome(e.target.value)}
                        className={styles.inputField}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Créditos da Nova Matéria"
                        value={novaMateriaCreditos}
                        onChange={(e) => setNovaMateriaCreditos(e.target.value)}
                        className={styles.inputField}
                        required
                    />
                    <button type="submit" className={styles.primaryButton}>
                        Criar e Vincular Matéria
                    </button>
                </form>
            </div>

            <div className={styles.tableSection}>
                <h4>Matérias Atualmente Vinculadas</h4>
                {materias.length === 0 ? (
                    <p className={styles.noMateriasMessage}>Nenhuma matéria vinculada a este curso ainda.</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Créditos</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materias.map((materia) => (
                                <tr key={materia.id_materia}>
                                    <td>{materia.id_materia}</td>
                                    <td>{materia.nome_materia}</td>
                                    <td>{materia.creditos}</td>
                                    <td>
                                        <button
                                            onClick={() => handleRemoveMateria(materia.id_materia)}
                                            className={`${styles.button} ${styles.removeButton}`}
                                        >
                                            Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

           
            <button
                
                onClick={() => navigate('/cursos')}
                
                className={styles.backButton}
            >
                Voltar à Lista de Cursos
            </button>
        </div>
    );
}

export default VerMateriasDoCurso;