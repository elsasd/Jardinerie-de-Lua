SET GLOBAL validate_password.policy=LOW;
SET GLOBAL validate_password.mixed_case_count=0;
SET GLOBAL validate_password.number_count=0;
SET GLOBAL validate_password.special_char_count=0;
SET GLOBAL validate_password.length=0;
DROP USER IF EXISTS 'lua'@'localhost';
CREATE USER 'lua'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'lua'@'localhost';
ALTER USER 'lua'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
DROP DATABASE IF EXISTS jardinerie_de_lua;
CREATE DATABASE jardinerie_de_lua;
USE jardinerie_de_lua;

DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS vendeur;
DROP TABLE IF EXISTS appartenance;
DROP TABLE IF EXISTS bouquet;
DROP TABLE IF EXISTS composition;
DROP TABLE IF EXISTS fleur;
DROP TABLE IF EXISTS commande;

CREATE TABLE client (
       id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
       pseudo VARCHAR(8),
       mdp TEXT
);

CREATE TABLE vendeur (
       id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
       pseudo VARCHAR(8),
       nb_commande INT NOT NULL DEFAULT 0,
       mdp TEXT
);

CREATE TABLE bouquet (
       id INT PRIMARY KEY,
       nom VARCHAR(10),
       prix FLOAT,
       photo VARCHAR(40)
)ENGINE = INNODB DEFAULT CHARSET = latin1 ;

CREATE TABLE fleur (
       id INT PRIMARY KEY,
       nom VARCHAR(20),
       photo VARCHAR(40),
       prix FLOAT
) ENGINE = INNODB DEFAULT CHARSET = latin1 ;

CREATE TABLE appartenance (     
       id_bouquet INT,
       id_fleur INT,
       nombre INT,
       CONSTRAINT
       FOREIGN KEY (`id_bouquet`)
       REFERENCES `bouquet` (`id`),
       CONSTRAINT
       FOREIGN KEY (`id_fleur`)
       REFERENCES `fleur` (`id`),
       PRIMARY KEY (id_bouquet, id_fleur)
) ENGINE = INNODB DEFAULT CHARSET = latin1 ;

CREATE TABLE commande (
       id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
       pseudo_client VARCHAR(8),
       `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       etat INT NOT NULL DEFAULT 0,
       prix FLOAT
)ENGINE = INNODB DEFAULT CHARSET = latin1 ;

CREATE TABLE composition (
       id INT,
       id_commande INT,
       id_fleur INT,
       nombre INT,
       id_bouquet INT,
       etat INT DEFAULT 0,
       pseudo_vendeur VARCHAR(8),
       CONSTRAINT
       FOREIGN KEY (`id_commande`)
       REFERENCES `commande` (`id`),
       CONSTRAINT
       FOREIGN KEY (`id_fleur`)
       REFERENCES `fleur` (`id`),
       PRIMARY KEY (`id`, `id_fleur`)
)ENGINE = INNODB DEFAULT CHARSET = latin1 ;
       
INSERT INTO client (pseudo, mdp)
VALUES
('lua', 'lua'),
('bamy','bamy'),
('aaron', 'aaron'),
('tchdu94', 'tchdu94'),
('asta','asta');

INSERT INTO vendeur (pseudo, mdp)
VALUES
('sara', 'sara'),
('raphael','raphael');

INSERT INTO bouquet (id, nom, prix, photo)
VALUES
(1, 'Ambre', null, '/images/bouquets/ambre.jpg'),
(2, 'Angélique', null, '/images/bouquets/angelique.jpg'),
(3, 'Avigaïl', null, '/images/bouquets/avigail.jpg'),
(4, 'Axelle', null, '/images/bouquets/axelle.jpg'),
(5, 'Cassandra', null, '/images/bouquets/cassandra.jpg'),
(6, 'Deolinda', null, '/images/bouquets/deolinda.jpg'),
(7, 'Jeanne', null, '/images/bouquets/jeanne.jpg'),
(8, 'Julie', null, '/images/bouquets/julie.jpg'),
(9, 'Léa', null, '/images/bouquets/lea.jpg'),
(10, 'Marie', null, '/images/bouquets/marie.jpg'),
(11, 'Sara', null, '/images/bouquets/sara.jpg'),
(12, 'Sonia', null, '/images/bouquets/sonia.jpg'),
(13, 'Sophie', null, '/images/bouquets/sophie.jpg');

INSERT INTO fleur (id, nom, photo, prix)
VALUES
(1, 'rose', '/images/fleurs/rose.jpg', 2),
(2, 'germini', '/images/fleurs/germini.jpg', 1.5),
(3, 'tulipe', '/images/fleurs/tulipe.jpg', 1.5),
(4, 'lys', '/images/fleurs/lys.jpg', 4),
(5, 'santini', '/images/fleurs/santini.jpg', 4),
(6, 'anémone', '/images/fleurs/anemone.jpg', 3),
(7, 'blé', '/images/fleurs/ble.jpg', 10),
(8, 'lavande', '/images/fleurs/lavande.jpg', 15),
(9, 'alstroemeria', '/images/fleurs/alstroemeria.jpg', 2),
(10, 'crocus','/images/fleurs/crocus.jpg', 2),
(11, 'eucalyptus', '/images/fleurs/eucalyptus.jpg', 4),
(12, 'immortelle', '/images/fleurs/immortelle.jpg', 5),
(13, 'sanfordii', '/images/fleurs/sanfordii.jpg', 10),
(14, 'jonquille', '/images/fleurs/jonquille.jpg', 3);

INSERT INTO appartenance (id_bouquet, id_fleur, nombre)
VALUES
(1 , 4 , 6 ),
(1 , 1 , 9 ),

(2 , 1 , 10),
(2 , 9 , 10),
(2 , 5 , 2 ),

(3 , 1 , 10),
(3 , 2 , 6 ),
(3 , 5 , 1 ),

(4 , 1 , 6 ),
(4 , 2 , 5 ),
(4 , 5 , 1 ),

(5 , 3 , 8 ),
(5 , 2 , 6 ),
(5 , 6 , 6 ),

(6 , 7 , 1 ),
(6 , 13, 1 ),
(6 , 8 , 1 ),

(7 , 1 , 10),
(7 , 2 , 6 ),
(7 , 9 , 10),

(8 , 3 , 30),

(9 , 1 , 10),
(9 , 2 , 7 ),
(9 , 5 , 1 ),

(10, 3 , 6),
(10, 14, 6),
(10, 2 , 5 ),
(10, 5 , 1 ),

(11, 7 , 1 ),
(11, 8 , 1 ),

(12, 1 , 11),
(12, 2 , 5),
(12, 9 , 7),

(13, 1 , 7 ),
(13, 2 , 7 ),
(13, 10, 7 ),
(13, 11, 1 ),
(13, 12, 1 );

UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 1) * 0.90 WHERE id = 1;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 2) * 0.90 WHERE id = 2;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 3) * 0.90 WHERE id = 3;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 4) * 0.90 WHERE id = 4;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 5) * 0.90 WHERE id = 5;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 6) * 0.90 WHERE id = 6;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 7) * 0.90 WHERE id = 7;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 8) * 0.90 WHERE id = 8;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 9) * 0.90 WHERE id = 9;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 10) * 0.90 WHERE id = 10;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 11) * 0.90 WHERE id = 11;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 12) * 0.90 WHERE id = 12;
UPDATE bouquet SET prix = (SELECT ROUND(SUM(prix * nombre)) AS prix FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet = 13) * 0.90 WHERE id = 13;

