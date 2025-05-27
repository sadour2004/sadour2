-- appmobile.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE processes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE machines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  process_id INTEGER REFERENCES processes(id),
  status VARCHAR(20) DEFAULT 'working'
);

-- Insertion des process
INSERT INTO processes (name) VALUES
('Casting'), ('Sprue cutting'), ('Heat treatment'), ('Machining'), ('Design cutting'), ('Flow forming');

-- Insertion des machines pour chaque process
-- Casting: LPDC 1 à LPDC 36
DO $$
BEGIN
  FOR i IN 1..36 LOOP
    INSERT INTO machines (name, process_id) VALUES ('LPDC ' || i, 1);
  END LOOP;
END$$;

-- Sprue cutting: 01 à 06
DO $$
BEGIN
  FOR i IN 1..6 LOOP
    INSERT INTO machines (name, process_id) VALUES ('Sprue cutting ' || LPAD(i::text, 2, '0'), 2);
  END LOOP;
END$$;

-- Heat treatment: 01 à 04
DO $$
BEGIN
  FOR i IN 1..4 LOOP
    INSERT INTO machines (name, process_id) VALUES ('Heat treatment ' || LPAD(i::text, 2, '0'), 3);
  END LOOP;
END$$;

-- Machining: 01 à 26
DO $$
BEGIN
  FOR i IN 1..26 LOOP
    INSERT INTO machines (name, process_id) VALUES ('Machining ' || LPAD(i::text, 2, '0'), 4);
  END LOOP;
END$$;

-- Design cutting: 00 à 17
DO $$
BEGIN
  FOR i IN 0..17 LOOP
    INSERT INTO machines (name, process_id) VALUES ('Design cutting ' || LPAD(i::text, 2, '0'), 5);
  END LOOP;
END$$;

-- Flow forming: 01 à 04
DO $$
BEGIN
  FOR i IN 1..4 LOOP
    INSERT INTO machines (name, process_id) VALUES ('Flow forming ' || LPAD(i::text, 2, '0'), 6);
  END LOOP;
END$$; 