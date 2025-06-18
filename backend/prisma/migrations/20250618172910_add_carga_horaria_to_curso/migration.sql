/*
  Warnings:

  - A unique constraint covering the columns `[nome_curso]` on the table `cursos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `carga_horaria` to the `cursos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cursos" ADD COLUMN     "carga_horaria" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cursos_nome_curso_key" ON "cursos"("nome_curso");
