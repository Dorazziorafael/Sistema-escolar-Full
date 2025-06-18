/*
  Warnings:

  - You are about to drop the column `carga_horaria` on the `cursos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "alunos_cursos" DROP CONSTRAINT "alunos_cursos_aluno_id_fkey";

-- DropForeignKey
ALTER TABLE "alunos_cursos" DROP CONSTRAINT "alunos_cursos_curso_id_fkey";

-- DropForeignKey
ALTER TABLE "cursos_materias" DROP CONSTRAINT "cursos_materias_curso_id_fkey";

-- DropForeignKey
ALTER TABLE "cursos_materias" DROP CONSTRAINT "cursos_materias_materia_id_fkey";

-- DropForeignKey
ALTER TABLE "professores_cursos" DROP CONSTRAINT "professores_cursos_curso_id_fkey";

-- DropForeignKey
ALTER TABLE "professores_cursos" DROP CONSTRAINT "professores_cursos_professor_id_fkey";

-- DropForeignKey
ALTER TABLE "professores_materias" DROP CONSTRAINT "professores_materias_materia_id_fkey";

-- DropForeignKey
ALTER TABLE "professores_materias" DROP CONSTRAINT "professores_materias_professor_id_fkey";

-- AlterTable
ALTER TABLE "alunos" ALTER COLUMN "data_nascimento" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "alunos_cursos" ALTER COLUMN "data_matricula" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "cursos" DROP COLUMN "carga_horaria";

-- AddForeignKey
ALTER TABLE "alunos_cursos" ADD CONSTRAINT "alunos_cursos_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("id_aluno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos_cursos" ADD CONSTRAINT "alunos_cursos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_materias" ADD CONSTRAINT "cursos_materias_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cursos_materias" ADD CONSTRAINT "cursos_materias_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id_materia") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_cursos" ADD CONSTRAINT "professores_cursos_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id_professor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_cursos" ADD CONSTRAINT "professores_cursos_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_materias" ADD CONSTRAINT "professores_materias_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professores"("id_professor") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professores_materias" ADD CONSTRAINT "professores_materias_materia_id_fkey" FOREIGN KEY ("materia_id") REFERENCES "materias"("id_materia") ON DELETE CASCADE ON UPDATE CASCADE;
