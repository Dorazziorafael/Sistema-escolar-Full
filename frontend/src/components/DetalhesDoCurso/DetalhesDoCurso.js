import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

// Este componente provavelmente recebe 'curso' como prop do componente pai (por exemplo, ListaCursos ou de uma rota)
function DetalhesDoCurso({ curso }) {
    const navigate = useNavigate();

    if (!curso) {
        return <p>Carregando detalhes do curso...</p>; // Ou uma mensagem de erro/redirecionamento
    }

    const handleVerMaterias = () => {
        // Navega para a nova rota de matérias, passando o ID do curso na URL
        // Ex: /cursos/10/materias
        navigate(`/cursos/${curso.id_curso}/materias`);
    };

    return (
        <div>
            <h2>Detalhes do Curso</h2>
            <p><strong>Nome:</strong> {curso.nome_curso}</p>
            <p><strong>Carga Horária:</strong> {curso.carga_horaria} horas</p>
            <p><strong>Número de Semestres:</strong> {curso.numero_semestres || 'N/A'}</p>
            <p><strong>Descrição:</strong> {curso.descricao || 'Sem descrição.'}</p>

            {/* Botão para ver as matérias do curso, que agora navegará para uma nova página */}
            <button onClick={handleVerMaterias}>Ver Matérias do Curso</button>

          
        </div>
    );
}

export default DetalhesDoCurso;