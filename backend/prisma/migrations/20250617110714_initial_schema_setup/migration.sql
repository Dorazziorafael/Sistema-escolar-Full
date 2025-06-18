-- CreateTable
CREATE TABLE "cursos" (
    "id" SERIAL NOT NULL,
    "nome_curso" TEXT NOT NULL,
    "carga_horaria" INTEGER NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "cursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professores" (
    "id" SERIAL NOT NULL,
    "nome_professor" TEXT NOT NULL,
    "formacao" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "professores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materias" (
    "id" SERIAL NOT NULL,
    "nome_materia" TEXT NOT NULL,
    "carga_horaria_materia" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alunos" (
    "id" SERIAL NOT NULL,
    "nome_aluno" TEXT NOT NULL,
    "semestre" INTEGER NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursos_professores" (
    "id_professor" INTEGER NOT NULL,
    "id_curso" INTEGER NOT NULL,

    CONSTRAINT "cursos_professores_pkey" PRIMARY KEY ("id_professor","id_curso")
);

-- CreateTable
CREATE TABLE "alunos_materias" (
    "id_aluno" INTEGER NOT NULL,
    "id_materia" INTEGER NOT NULL,
    "status_materia" TEXT,

    CONSTRAINT "alunos_materias_pkey" PRIMARY KEY ("id_aluno","id_materia")
);

-- CreateIndex
CREATE UNIQUE INDEX "professores_email_key" ON "professores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_email_key" ON "alunos"("email");

-- AddForeignKey
ALTER TABLE "materias" ADD CONSTRAINT "materias_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_professores" ADD CONSTRAINT "cursos_professores_id_professor_fkey" FOREIGN KEY ("id_professor") REFERENCES "professores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_professores" ADD CONSTRAINT "cursos_professores_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "cursos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos_materias" ADD CONSTRAINT "alunos_materias_id_aluno_fkey" FOREIGN KEY ("id_aluno") REFERENCES "alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos_materias" ADD CONSTRAINT "alunos_materias_id_materia_fkey" FOREIGN KEY ("id_materia") REFERENCES "materias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
