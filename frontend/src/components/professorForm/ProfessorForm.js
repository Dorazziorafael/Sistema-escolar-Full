
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import formStyles from './ProfessorForm.module.css'; 
import appStyles from '../../App.module.css'; 

function ProfessorForm({ onProfessorAdded }) {
    const [nome_professor, setNomeProfessor] = useState('');
    const [formacao, setFormacao] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null); 
    const [loading, setLoading] = useState(false); 

    const navigate = useNavigate(); // Inicializar useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Limpa erros anteriores ao tentar enviar
        setLoading(true); // Ativa o estado de carregamento

        // Validação básica
        if (!nome_professor || !email) {
            setError('Nome do professor e E-mail são campos obrigatórios.'); // Define o erro para a UI
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/professores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome_professor, formacao, email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao cadastrar professor.');
            }

            const newProfessor = await response.json();

            // Limpa o formulário após o sucesso
            setNomeProfessor('');
            setFormacao('');
            setEmail('');

           
          
            if (onProfessorAdded) {
                onProfessorAdded(newProfessor);
            }

            // Navega de volta para a lista de professores após o cadastro
            navigate('/professores'); // Supondo que sua lista de professores esteja em /professores

        } catch (err) {
            console.error('Erro no cadastro de professor:', err);
            setError(`Erro ao cadastrar professor: ${err.message}`); // Define o erro para a UI
        } finally {
            setLoading(false); // Desativa o estado de carregamento, independentemente do sucesso/erro
        }
    };

    return (
        <div className={formStyles.container}>
            <h2>Cadastrar Novo Professor</h2>
            {error && <div className={appStyles.errorMessage}>{error}</div>} {/* Exibe erros usando appStyles */}
            <form onSubmit={handleSubmit} className={formStyles.form}>
                <div className={formStyles.formGroup}>
                    <label htmlFor="nome_professor">Nome do Professor:</label>
                    <input
                        type="text"
                        id="nome_professor"
                        className={formStyles.input}
                        value={nome_professor}
                        onChange={(e) => setNomeProfessor(e.target.value)}
                        required
                    />
                </div>
                <div className={formStyles.formGroup}>
                    <label htmlFor="formacao">Formação:</label>
                    <input
                        type="text"
                        id="formacao"
                        className={formStyles.input}
                        value={formacao}
                        onChange={(e) => setFormacao(e.target.value)}
                    />
                </div>
                <div className={formStyles.formGroup}>
                    <label htmlFor="email">E-mail:</label>
                    <input
                        type="email"
                        id="email"
                        className={formStyles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {/* Adiciona o grupo de botões para manter o layout consistente */}
                <div className={formStyles.buttonGroup}>
                    <button
                        type="submit"
                        className={formStyles.submitButton}
                        disabled={loading} 
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar Professor'}
                    </button>
                    <button
                        type="button" // Tipo button para não acionar submit
                        onClick={() => navigate('/professores')} // Navega para a lista de professores
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

export default ProfessorForm;