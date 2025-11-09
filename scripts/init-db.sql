-- Create the database and enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teacher table
CREATE TABLE IF NOT EXISTS "Teacher" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "email" VARCHAR UNIQUE NOT NULL,
  "password" VARCHAR NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student table
CREATE TABLE IF NOT EXISTS "Student" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "email" VARCHAR UNIQUE NOT NULL,
  "rollNo" VARCHAR,
  "password" VARCHAR NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz table
CREATE TABLE IF NOT EXISTS "Quiz" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "teacherId" UUID NOT NULL,
  "title" VARCHAR NOT NULL,
  "description" TEXT,
  "timeLimit" INTEGER,
  "maxAttempts" INTEGER DEFAULT 1,
  "status" VARCHAR DEFAULT 'DRAFT',
  "startAt" TIMESTAMP,
  "endAt" TIMESTAMP,
  "shuffleQuestions" BOOLEAN DEFAULT FALSE,
  "shuffleOptions" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE
);

-- Question table
CREATE TABLE IF NOT EXISTS "Question" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID NOT NULL,
  "text" VARCHAR NOT NULL,
  "imageUrl" VARCHAR,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE
);

-- Option table
CREATE TABLE IF NOT EXISTS "Option" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questionId" UUID NOT NULL,
  "text" VARCHAR NOT NULL,
  "isCorrect" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE
);

-- Attempt table
CREATE TABLE IF NOT EXISTS "Attempt" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID NOT NULL,
  "studentId" UUID NOT NULL,
  "score" INTEGER DEFAULT 0,
  "startedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  "answers" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE,
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_quiz_teacher" ON "Quiz"("teacherId");
CREATE INDEX IF NOT EXISTS "idx_question_quiz" ON "Question"("quizId");
CREATE INDEX IF NOT EXISTS "idx_option_question" ON "Option"("questionId");
CREATE INDEX IF NOT EXISTS "idx_attempt_quiz" ON "Attempt"("quizId");
CREATE INDEX IF NOT EXISTS "idx_attempt_student" ON "Attempt"("studentId");
