
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appStyles from '../../App.module.css';
import listStyles from './CursoList.module.css';

function CursoList({ cursoAdded }) {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); // Para mensagens de sucesso

    const navigate = useNavigate();

    const fetchCursos = async () => {
        try {
            setLoading(true);
            setError(null);


            const response = await fetch('http://localhost:5000/cursos');
            if (!response.ok) {
                throw new Error('Não foi possível carregar os cursos.');
            }
            const data = await response.json();
            setCursos(data);
        } catch (err) {
            console.error("Erro ao buscar cursos:", err);
            setError("Erro ao carregar lista de cursos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCursos();
    }, [cursoAdded]);

    const handleDelete = async (id_curso) => {
        if (!window.confirm('Tem certeza que deseja excluir este curso?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/cursos/${id_curso}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Se houver um erro, defina a mensagem de erro e deixe ela visível
                setError(errorData.error || `Erro HTTP! Status: ${response.status}`);
                // Opcional: Se quiser que o erro também suma após um tempo, adicione um setTimeout aqui.
                return;
            }

            // Exibe a mensagem de sucesso e configura para ela desaparecer após 3 segundos
            setMessage("Curso excluído com sucesso!");
            setTimeout(() => {
                setMessage(null); // Limpa a mensagem após 3 segundos (3000ms)
            }, 3000); // 3 segundos

            setCursos(prevCursos => prevCursos.filter(curso => curso.id_curso !== id_curso));
        } catch (error) {
            console.error('Erro ao excluir curso:', error);
            setError(`Erro ao excluir curso: ${error.message}`);
           
        }
    };

    const handleVerMaterias = (id_curso) => {
        navigate(`/cursos/${id_curso}/materias`);
    };

    const AlunosDoCurso = ({ cursoId }) => {
        const [alunosMatriculados, setAlunosMatriculados] = useState([]);
        const [loadingAlunos, setLoadingAlunos] = useState(true);
        const [errorAlunos, setErrorAlunos] = useState(null);

        useEffect(() => {
            const fetchAlunosDoCurso = async () => {
                try {
                    setLoadingAlunos(true);
                    setErrorAlunos(null);
                    const response = await fetch(`http://localhost:5000/alunos-cursos/curso/${cursoId}`);
                    if (!response.ok) {
                        throw new Error('Não foi possível carregar os alunos do curso.');
                    }
                    const data = await response.json();
                    setAlunosMatriculados(data.map(item => item.aluno));
                } catch (err) {
                    console.error("Erro ao buscar alunos do curso:", err);
                    setErrorAlunos("Erro ao carregar alunos matriculados.");
                } finally {
                    setLoadingAlunos(false);
                }
            };

            fetchAlunosDoCurso();
        }, [cursoId]);

        if (loadingAlunos) {
            return <p>Carregando alunos...</p>;
        }
        if (errorAlunos) {
            return <p className={appStyles.errorMessage}>{errorAlunos}</p>;
        }

        return (
            <div className={listStyles.alunosMatriculados}>
                <strong>Alunos Matriculados:</strong>
                {alunosMatriculados.length === 0 ? (
                    <p>Nenhum aluno matriculado neste curso.</p>
                ) : (
                    <ul>
                        {alunosMatriculados.map(aluno => (
                            <li key={aluno.id_aluno}>{aluno.nome_aluno}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    if (loading) {
        return <div className={appStyles.loading}>Carregando cursos...</div>;
    }

    // Exibe a mensagem de erro se houver, antes de renderizar a lista de cursos
    if (error) {
        return <div className={appStyles.errorMessage}>{error}</div>;
    }

    return (
        <div className={listStyles.listContainer}>
            <h2>Lista de Cursos</h2>
            {message && <div className={appStyles.successMessage}>{message}</div>}
            
            {cursos.length === 0 ? (
                <p>Nenhum curso cadastrado.</p>
            ) : (
                <ul className={listStyles.cursoList}>
                    {cursos.map((curso) => (
                        <li key={curso.id_curso} className={listStyles.cursoItem}>
                            <div className={listStyles.itemDetails}>
                                <strong>Nome:</strong> {curso.nome_curso} <br />
                                <strong>Carga Horária:</strong> {curso.carga_horaria} horas <br />
                                {curso.numero_semestres && (
                                    <><strong>Número de Semestres:</strong> {curso.numero_semestres} <br /></>
                                )}
                                {curso.descricao && (
                                    <><strong>Descrição:</strong> {curso.descricao} <br /></>
                                )}
                            </div>

                            <AlunosDoCurso cursoId={curso.id_curso} />

                            <div className={listStyles.actions}>
                                <button
                                    onClick={() => handleVerMaterias(curso.id_curso)}
                                    className={`${appStyles.button} ${appStyles.primaryButton}`}
                                >
                                    Ver Matérias do Curso
                                </button>
                                <button
                                    onClick={() => handleDelete(curso.id_curso)}
                                    className={`${appStyles.button} ${appStyles.deleteButton}`}
                                >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CursoList;