CREATE TABLE user(
    id int unsiged primary key auto_increment,
    name varchar(255) not null,
    email varchar(255) not null,
    password varchar(255) not null
    role enum('DIRECTOR', 'USER') not null default 'user'
)