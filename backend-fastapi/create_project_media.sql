CREATE TABLE project_media (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('imagen','video')),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
