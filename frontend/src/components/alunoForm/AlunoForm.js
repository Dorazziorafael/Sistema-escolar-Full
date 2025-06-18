

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import formStyles from './AlunoForm.module.css';

function AlunoForm({ onAlunoAdded }) {
  const [nome_aluno, setNomeAluno] = useState('');
  const [data_nascimento, setDataNascimento] = useState('');
  const [matricula, setMatricula] = useState('');
  const [email, setEmail] = useState('');
  const [semestre, setSemestre] = useState(1);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const novoAluno = {
      nome_aluno,
      data_nascimento,
      matricula,
      email,
      semestre: parseInt(semestre),
    };

    try {
      const response = await fetch('/alunos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoAluno),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setNomeAluno('');
      setDataNascimento('');
      setMatricula('');
      setEmail('');
      setSemestre(1);

      if (onAlunoAdded) {
        onAlunoAdded(); // Chama a função de callback para atualizar a lista
      }

      alert('Aluno cadastrado com sucesso!');
      navigate('/alunos'); //  Redireciona para a lista de alunos após o cadastro
      
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      alert(`Erro ao cadastrar aluno: ${error.message}`);
    }
  };

  return (
    <div className={formStyles.formContainer}>
      <h2>Cadastrar Novo Aluno</h2>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <label className={formStyles.formLabel}>
          Nome:
          <input
            type="text"
            value={nome_aluno}
            onChange={(e) => setNomeAluno(e.target.value)}
            required
            className={formStyles.formInput}
          />
        </label>
        <label className={formStyles.formLabel}>
          Data de Nascimento:
          <input
            type="date"
            value={data_nascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            required
            className={formStyles.formInput}
          />
        </label>
        <label className={formStyles.formLabel}>
          Matrícula:
          <input
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
            className={formStyles.formInput}
          />
        </label>
        <label className={formStyles.formLabel}>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={formStyles.formInput}
          />
        </label>
        <label className={formStyles.formLabel}>
          Semestre:
          <input
            type="number"
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            required
            min="1"
            className={formStyles.formInput}
          />
        </label>
        <div className={formStyles.buttonGroup}> 
            <button type="submit" className={formStyles.formButton}>
                Cadastrar Aluno
            </button>
            
            <button
                type="button" 
                onClick={() => navigate('/alunos')}
                className={formStyles.backButton}
            >
                Voltar para a Lista
            </button>
        </div>
      </form>
    </div>
  );
}

export default AlunoForm;