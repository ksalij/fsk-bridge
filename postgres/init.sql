create table games (
    game_id integer primary key,
    lin_file varchar(700)
);

create table users (
    login VARCHAR(20),
    password bytea,
    salt bytea
)
