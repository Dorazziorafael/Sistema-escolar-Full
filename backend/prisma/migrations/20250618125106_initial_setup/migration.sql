-- CreateTable
CREATE TABLE "alunos" (
    "id_aluno" SERIAL NOT NULL,
    "nome_aluno" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "matricula" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id_aluno")
);

-- CreateTable
CREATE TABLE "cursos" (
    "id_curso" SERIAL NOT NULL,
    "nome_curso" TEXT NOT NULL,
    "carga_horaria" INTEGER NOT NULL,
    "numero_semestres" INTEGER,
    "descricao" TEXT,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "professores" (
    "id_professor" SERIAL NOT NULL,
    "nome_professor" TEXT NOT NULL,
    "formacao" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "professores_pkey" PRIMARY KEY ("id_professor")
);

-- CreateTable
CREATE TABLE "materias" (
    "id_materia" SERIAL NOT NULL,
    "nome_materia" TEXT NOT NULL,
    "creditos" INTEGER NOT NULL,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id_materia")
);

-- CreateTable
CREATE TABLE "alunos_cursos" (
    "aluno_id" INTEGER NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "data_matricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_matricula" TEXT NOT NULL DEFAULT 'Ativo',

    CONSTRAINT "alunos_cursos_pkey" PRIMARY KEY ("aluno_id","curso_id")
);

-- CreateTable
CREATE TABLE "cursos_materias" (
    "curso_id" INTEGER NOT NULL,
    "materia_id" INTEGER NOT NULL,

    CONSTRAINT "cursos_materias_pkey" PRIMARY KEY ("curso_id","materia_id")
);

-- CreateTable
CREATE TABLE "professores_cursos" (
    "professor_id" INTEGER NOT NULL,
    "curso_id" INTEGER NOT NULL,

    CONSTRAINT "professores_cursos_pkey" PRIMARY KEY ("professor_id","curso_id")
);

-- CreateTable
CREATE TABLE "professores_materias" (
    "professor_id" INTEGER NOT NULL,
    "materia_id" INTEGER NOT NULL,

    CONSTRAINT "professores_materias_pkey" PRIMARY KEY ("professor_id","materia_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alunos_matricula_key" ON "alunos"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_email_key" ON "alunos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professores_email_key" ON "professores"("email");

-- AddForeignKey
ALTER TABLE "alunos_cursos" ADD CONSTRAINT "alunos_cursos_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("id_aluno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos_cursos" ADD CONSTRAINT "alunos_cursos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_materias" ADD CONSTRAINT "cursos_materias_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_materias" ADD CONSTRAINT "cursos_materias_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id_materia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_cursos" ADD CONSTRAINT "professores_cursos_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_cursos" ADD CONSTRAINT "professores_cursos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id_curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_materias" ADD CONSTRAINT "professores_materias_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_materias" ADD CONSTRAINT "professores_materias_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id_materia") ON DELETE RESTRICT ON UPDATE CASCADE;
