CREATE TABLE users (
    login VARCHAR(20) UNIQUE,
    password BYTEA,
    salt BYTEA
);

CREATE TABLE tables (
    table_id INT UNIQUE,
    east TEXT, -- uses the user_id to uniquely identify
    south TEXT,
    west TEXT,
    north TEXT
);

CREATE TABLE games (
    table_id INT UNIQUE,
    game_num INT,
    lin_file TEXT,
    PRIMARY KEY (table_id, game_num)
);
