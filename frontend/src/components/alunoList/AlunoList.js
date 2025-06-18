
import React, { useState, useEffect } from 'react';

import appStyles from '../../App.module.css';
import listStyles from './AlunoList.module.css';

function AlunoList({ refreshTrigger }) {
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  

    const fetchAlunos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5000/alunos');
            if (!response.ok) {
                throw new Error('Não foi possível carregar os alunos.');
            }
            const data = await response.json();
            setAlunos(data);
        } catch (err) {
            console.error("Erro ao buscar alunos:", err);
            setError("Erro ao carregar lista de alunos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlunos();
    }, [refreshTrigger]);

    const handleDelete = async (id_aluno) => {
        if (!window.confirm('Tem certeza que deseja excluir este aluno?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/alunos/${id_aluno}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || `HTTP error! status: ${response.status}`);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            alert(data.message);

            setAlunos(prevAlunos => prevAlunos.filter(aluno => aluno.id_aluno !== id_aluno));
        } catch (error) {
            console.error('Erro ao excluir aluno:', error);
            if (!error.message.includes("HTTP error! status:")) {
                alert(`Erro ao excluir aluno: ${error.message}`);
            }
        }
    };

    if (loading) {
        return <div className={appStyles.loading}>Carregando alunos...</div>;
    }

    if (error) {
        return <div className={appStyles.errorMessage}>{error}</div>;
    }

    return (
        <div className={listStyles.listContainer}>
            <h2>Lista de Alunos</h2>
            
            <div className={listStyles.scrollableArea}>
                {alunos.length === 0 ? (
                    <p>Nenhum aluno cadastrado.</p>
                ) : (
                    <ul className={listStyles.alunoList}>
                        {alunos.map((aluno) => (
                            <li key={aluno.id_aluno} className={listStyles.alunoItem}>
                                <div className={listStyles.itemDetails}>
                                    <strong>Nome:</strong> {aluno.nome_aluno} <br />
                                    <strong>Matrícula:</strong> {aluno.matricula} <br />
                                    <strong>Email:</strong> {aluno.email} <br />
                                    <strong>Nascimento:</strong> {new Date(aluno.data_nascimento).toLocaleDateString()} <br />
                                    <strong>Semestre:</strong> {aluno.semestre}
                                </div>
                                <div className={listStyles.actions}>
                                    <button 
                                        onClick={() => handleDelete(aluno.id_aluno)} 
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
        </div>
    );
}

export default AlunoList;