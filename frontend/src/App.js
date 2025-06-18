// 
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

import styles from './App.module.css';
import AlunoList from './components/alunoList/AlunoList';
import AlunoForm from './components/alunoForm/AlunoForm';
import ProfessorList from './components/professorList/ProfessorList';
import ProfessorForm from './components/professorForm/ProfessorForm';
import CursoList from './components/cursoList/CursoList';
import CursoForm from './components/cursoForm/CursoForm';
import DetalhesDoCurso from './components/DetalhesDoCurso/DetalhesDoCurso';
import VerMateriasDoCurso from './components/VerMateriasDoCurso/VerMateriasDoCurso';


function App() {
    const location = useLocation(); // Hook para obter a localização atual
    const navigate = useNavigate(); // Hook para navegação

    // Estado para forçar a atualização da lista de alunos
    const [alunoRefreshTrigger, setAlunoRefreshTrigger] = useState(0);
    const handleAlunoAdded = () => {
        setAlunoRefreshTrigger(prev => prev + 1);
        navigate('/alunos'); // Volta para a lista após cadastro
    };

    // Estados e callbacks para Professores
    const [professorRefreshTrigger, setProfessorRefreshTrigger] = useState(0);
    const handleProfessorAdded = () => {
        setProfessorRefreshTrigger(prev => prev + 1);
        navigate('/professores'); // Volta para a lista após cadastro
    };

    // Estados e callbacks para Cursos
    const [cursoRefreshTrigger, setCursoRefreshTrigger] = useState(0);
    const handleCursoAdded = () => {
        setCursoRefreshTrigger(prev => prev + 1); // Força o refresh da lista de cursos
        navigate('/cursos'); 
    };

    return (
        <div className={styles.app}>
            <header className={styles.appHeader}>
                <h1>Sistema Escolar</h1>
                <nav>
                    <ul className={styles.navList}>
                        <li><Link to="/" className={styles.navLink}>Home</Link></li>
                        <li><Link to="/alunos" className={styles.navLink}>Alunos</Link></li>
                        <li><Link to="/professores" className={styles.navLink}>Professores</Link></li>
                        <li><Link to="/cursos" className={styles.navLink}>Cursos</Link></li>
                    </ul>
                </nav>
            </header>

            <main className={styles.mainContent}>
                <Routes>
                    {/* Rota Padrão (Home) */}
                    <Route path="/" element={<p>Bem-vindo ao Sistema Escolar! Use o menu de navegação para gerenciar.</p>} />

                    {/* Rotas para Alunos */}
                    <Route
                        path="/alunos"
                        element={<AlunoList refreshTrigger={alunoRefreshTrigger} />}
                    />
                    <Route
                        path="/alunos/cadastrar"
                        element={<AlunoForm onAlunoAdded={handleAlunoAdded} />}
                    />

                    {/* Rotas para Professores */}
                    <Route
                        path="/professores"
                        element={<ProfessorList professorAdded={professorRefreshTrigger} />}
                    />
                    <Route
                        path="/professores/cadastrar"
                        element={<ProfessorForm onProfessorAdded={handleProfessorAdded} />}
                    />

                    {/* Rotas para Cursos */}
                    <Route
                        path="/cursos"
                        element={<CursoList cursoAdded={cursoRefreshTrigger} />}
                    />
                    <Route
                        path="/cursos/cadastrar"
                        element={<CursoForm onCursoCreated={handleCursoAdded} />}
                    />

                    {/* NOVO: Rota para Detalhes de um Curso específico */}
                    {/* Esta rota receberá o ID do curso na URL, ex: /cursos/1 */}
                    <Route
                        path="/cursos/:idCurso" // :idCurso é um parâmetro dinâmico
                        element={<DetalhesDoCurso />}
                    />

                    {/* NOVO: Rota para Gerenciar Matérias de um Curso específico */}
                    {/* Esta rota também receberá o ID do curso, ex: /cursos/1/materias */}
                    <Route
                        path="/cursos/:idCurso/materias" // :idCurso é um parâmetro dinâmico
                        element={<VerMateriasDoCurso />}
                    />

                </Routes>

                {/* Botões de Ação Dinâmicos (mantidos como estavam) */}
                {/* Botão "Cadastrar Novo Aluno" */}
                {location.pathname === '/alunos' && (
                    <button
                        onClick={() => navigate('/alunos/cadastrar')}
                        className={styles.addActionButton}
                    >
                        Cadastrar Novo Aluno
                    </button>
                )}

                {/* Botão "Cadastrar Novo Professor" */}
                {location.pathname === '/professores' && (
                    <button
                        onClick={() => navigate('/professores/cadastrar')}
                        className={styles.addActionButton}
                    >
                        Cadastrar Novo Professor
                    </button>
                )}

                {/* Botão "Cadastrar Novo Curso" */}
                {location.pathname === '/cursos' && (
                    <button
                        onClick={() => navigate('/cursos/cadastrar')}
                        className={styles.addActionButton}
                    >
                        Cadastrar Novo Curso
                    </button>
                )}
            </main>
        </div>
    );
}

export default function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}