-- Esquema completo del Gestor de Proyectos.
-- Correr una sola vez sobre una base Neon vacía, antes del primer despliegue.
-- Neon no acepta varias sentencias en un mismo prepared statement: pegarlo en
-- el SQL Editor del panel de Neon, que sí las ejecuta en lote.

CREATE TABLE IF NOT EXISTS projects (
  id           serial PRIMARY KEY,
  name         text        NOT NULL,
  status       text        NOT NULL DEFAULT 'No iniciado',
  responsables text[]      NOT NULL DEFAULT '{}',
  notas        text        NOT NULL DEFAULT '',
  archived     boolean     NOT NULL DEFAULT false,
  deadline     date,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attachments (
  id          serial PRIMARY KEY,
  project_id  integer     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  url         text        NOT NULL,
  descripcion text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS change_history (
  id         serial PRIMARY KEY,
  project_id integer     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  field      text        NOT NULL,
  old_value  text,
  new_value  text,
  changed_by text        NOT NULL DEFAULT '',
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS responsables (
  id         serial PRIMARY KEY,
  nombre     text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attachments_project_id_idx ON attachments (project_id);
CREATE INDEX IF NOT EXISTS change_history_project_id_idx ON change_history (project_id);
CREATE INDEX IF NOT EXISTS projects_updated_at_idx ON projects (updated_at DESC);
