DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS users;

CREATE TABLE games (
    game_id integer PRIMARY KEY,
    lin_file varchar(700)
);

CREATE TABLE users (
    login VARCHAR(20),
    password CHAR(64),
    salt CHAR(16)
)
