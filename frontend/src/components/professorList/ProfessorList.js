import React, { useState, useEffect } from 'react';

import appStyles from '../../App.module.css';

import listStyles from './ProfessorList.module.css'; 

function ProfessorList({ professorAdded }) {
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Estado para erros de carregamento/fetch
  // Removidos os estados 'message' e 'isError' que eram usados para o feedback da exclusão.

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      setError(null); // Limpa erros anteriores
      // Não há setMessage aqui, pois o feedback de fetch é via 'error'
      
      const response = await fetch('http://localhost:5000/professores');
      if (!response.ok) {
        throw new Error('Não foi possível carregar os professores.');
      }
      const data = await response.json();
      setProfessores(data);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
      setError("Erro ao carregar lista de professores."); // Define o erro para exibição
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, [professorAdded]); // Refetch quando um professor é adicionado (ou o prop 'professorAdded' muda)

  const handleDelete = async (id_professor) => {
    if (!window.confirm('Tem certeza que deseja excluir este professor?')) {
      return; // O window.confirm já funciona como um pop-up de confirmação
    }

    try {
      const response = await fetch(`http://localhost:5000/professores/${id_professor}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Usa alert() para erros na exclusão
        alert(errorData.error || `HTTP error! status: ${response.status}`);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`); // Lança o erro para o catch
      }

      const data = await response.json();
      // Usa alert() para sucesso na exclusão
      alert(data.message); 

      // Remove o professor da lista localmente para atualizar a UI
      setProfessores(prevProfessores => prevProfessores.filter(professor => professor.id_professor !== id_professor));
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      // Se um erro foi lançado acima ou outro erro ocorreu, exibe um alert
      if (!error.message.includes("HTTP error! status:")) { // Evita alert duplicado se o throw for capturado
        alert(`Erro ao excluir professor: ${error.message}`);
      }
    }
  };

  if (loading) {
    return <div className={appStyles.loading}>Carregando professores...</div>;
  }

  if (error) {
    // Erros de carregamento/fetch ainda são exibidos aqui, usando o estado 'error'
    return <div className={appStyles.errorMessage}>{error}</div>;
  }

  return (
    <div className={listStyles.listContainer}>
      <h2>Lista de Professores</h2>
      {/* Removido o parágrafo de mensagem que era exibido aqui para exclusão */}
      {professores.length === 0 ? (
        <p>Nenhum professor cadastrado.</p>
      ) : (
        <ul className={listStyles.professorList}>
          {professores.map((professor) => (
            <li key={professor.id_professor} className={listStyles.professorItem}>
              <div className={listStyles.itemDetails}>
                <strong>Nome:</strong> {professor.nome_professor} <br />
                <strong>Formação:</strong> {professor.formacao || 'Não informada'} <br />
                <strong>E-mail:</strong> {professor.email}
              </div>
              <div className={listStyles.actions}>
                <button
                  onClick={() => handleDelete(professor.id_professor)}
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

export default ProfessorList;