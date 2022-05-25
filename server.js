// ----------------- INITIALISATION DU SERVEUR ------------------- //

var express = require('express');
var cors = require('cors')
var fs = require('fs')
const path = require('path')
var formidable = require('formidable')
const bodyParser = require('body-parser');
var server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(express.static('public'));
server.use(cors())
server.listen(8080);

// ----------------------- BASE DE DONNEES ----------------------- //

var mysql      = require('mysql');
var connection = mysql.createConnection({   
    host : 'localhost',
    user : 'lua', 
    password : '',   
    database : 'jardinerie_de_lua' 
});     
connection.connect();

var bouquets;
connection.query("SELECT * FROM bouquet", function (err, result) {
    if (err) throw err;
    bouquets = result;
});

// -------------------- GESTION DE SESSION --------------------- //

const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const client  = redis.createClient();
const router = express.Router();

server.use(session({
    secret: 'ssshhhhh',
    store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl : 260}),
    saveUninitialized: false,
    resave: false
}));

server.use(bodyParser.json());      
server.use(bodyParser.urlencoded({extended: true}));


// ------------------ GESTION DES LIENS APPELES ------------------- //

server.use('/jardinerie-de-lua', router);

router.use(function (req, res, next) {
    if (((req.originalUrl.substr(19,26)==="connexion") || (req.originalUrl.substr(19,26)==="connexion-vendeur") && !req.session.pseudo)
	|| req.session.pseudo){
	if (req.session.pseudo && req.session.vendeur == 1 && req.originalUrl.substr(19,26)!="realiser" && req.originalUrl.substr(19,26)!="deconnexion")
	    res.redirect("/jardinerie-de-lua/realiser");
	else if (req.session.pseudo && req.session.vendeur == 0 && req.originalUrl.substr(19,26)==="realiser")
	    res.redirect("/jardinerie-de-lua/");
	else
	    next();
    }
    else
	res.redirect("/jardinerie-de-lua/connexion");
    
});

// -------------------------- CONNEXION --------------------------- //

router.all('/connexion', function (req, res) {
    if(req.session.pseudo){
	res.redirect('/jardinerie-de-lua/realiser');
    }
    else if(req.body.pseudo){
	connection.query("SELECT * FROM client WHERE pseudo='"+req.body.pseudo+"' AND mdp='"+req.body.password+"'", function (err, result) {
	    if (err) throw err;
	    if (result.length == 1){   
		req.session.pseudo = req.body.pseudo;
		req.session.panier = [];
		req.session.vendeur = 0;
		res.redirect('/jardinerie-de-lua/');
	    }else {
		res.render('connexion.ejs', {vendeur:0,erreur : 1});
	    }	
	});
    }
    else
	res.render('connexion.ejs', {vendeur:0});
});

router.all('/connexion-vendeur', function (req, res) {
    if(req.session.pseudo){
	res.redirect('/jardinerie-de-lua/');
    }
    else if(req.body.pseudo){
	connection.query("SELECT * FROM vendeur WHERE pseudo='"+req.body.pseudo+"' AND mdp='"+req.body.password+"'", function (err, result) {
	    if (err) throw err;
	    if (result.length == 1){   
		req.session.pseudo = req.body.pseudo;
		req.session.panier = [];
		req.session.vendeur=1;
		res.redirect('/jardinerie-de-lua/realiser');
	    }else {
		res.render('connexion.ejs', {vendeur : 1, erreur : 1});
	    }	
	});
    }
    else
	res.render('connexion.ejs', {vendeur :1});
});

router.get('/deconnexion',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/jardinerie-de-lua/');
    });  
    
});

// -------------------------- ACCUEIL --------------------------- //

router.get('/', function (req, res) {
    if(!req.session.pseudo)
	res.redirect('/jardinerie-de-lua/connexion');
    else
	res.render('accueil.ejs', {bouquet : bouquets});
});

// ------------------------ COMPOSITION ------------------------- //

var async = require('async');

router.get('/composer', function (req, res) {
    if(!req.session.pseudo)
	res.redirect('/jardinerie-de-lua/connexion');

    connection.query("SELECT * FROM fleur", function (err, result) {
	if (err) throw err;
	res.render('composer.ejs', {fleur : result});
    });
    
});

// -------------------------- BOUQUET -------------------------- //

router.get('/bouquet/:nom', function (req, res){
    async.parallel([
	function(callback) {
	    var bouq = 'SELECT nom, photo, prix, id FROM bouquet WHERE nom = "'+ req.params.nom +'" ';
            connection.query( bouq, function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	},function(callback) {
	    var fleurs = 'SELECT DISTINCT nom, id, nombre, prix, photo FROM fleur JOIN appartenance ON id = id_fleur WHERE id_bouquet IN (SELECT id FROM bouquet WHERE nom = "'+ req.params.nom +'")';
            connection.query(fleurs, function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	}
    ], function(error, callbackResults) {
	if (error) {
            console.log(error);
	} else {
            res.render('bouquet.ejs', {
		bouquet : callbackResults[0],
		composition : callbackResults[1]
	    });
	}
    });
});

// ---------------------- GESTION PANIER ----------------------- //

router.post('/ajout', function (req, res){
    req.session.panier.push([[req.body.compo], req.body.quantite, [req.body.prix]]);
    res.status(201).send();
});

router.get('/supp', function (req, res){
    req.session.panier.splice(req.query.id, 1);
    res.redirect("/jardinerie-de-lua/panier");
});

router.get('/panier', function (req, res){
    async.parallel([
	function (callback) {
	    var bouq = 'SELECT * FROM bouquet';
	    connection.query( bouq, function (err, rows) {
		if (err) throw err;
		return callback(null, rows);
	    });
	},function (callback) {
	    var fleur = 'SELECT nom FROM fleur';
	    connection.query( fleur, function (err, rows) {
		if (err) throw err;
		return callback(null, rows);
	    });
	}
    ],function (error, callbackResults) {
	res.render('panier.ejs', {pseudo : req.session.pseudo,
				  panier : req.session.panier,
				  bouquet : callbackResults[0],
				  fleur : callbackResults[1]});
    });
});

// ---------------------- COMMANDE ----------------------- //
	   
server.use(express.json());
server.use(express.urlencoded({extended:false}));

router.post('/commander', function (req, res){
    async.parallel([
	function (callback) {
	    connection.query("SELECT MAX(id) AS id_max FROM commande", function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	},function (callback) {
	    connection.query("SELECT MAX(id) AS id_max FROM composition", function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	}
    ], function (error, callbackResults) {
	var len = req.session.panier.length;
	var com = "INSERT INTO commande (pseudo_client, prix) VALUES ('"+req.session.pseudo+"', "+req.body.prix+")";
	connection.query(com, function (err) {
	    if (err) throw err;
	});
	var i_commande = callbackResults[0][0]['id_max'] ? callbackResults[0][0]['id_max']+1 : 1;
	var i_compo = callbackResults[1][0]['id_max'] ? callbackResults[1][0]['id_max']+1 : 1;
	var ajout = "INSERT INTO composition (id, id_commande, id_fleur, nombre, id_bouquet, etat) VALUES ";
	var etat;
	for(var i=0; i<len; i++){
	    if (req.session.panier[i][0][0]==0) etat = 0;
	    else etat = 2;
	    for (var j=0;j<req.session.panier[i][1][0].length;j++){
		ajout += "("+i_compo+","
		    +i_commande+","
		    +req.session.panier[i][1][0][j]+","
		    +req.session.panier[i][1][1][j]+","
		    +req.session.panier[i][0][0]+","
		    +etat+"),";		
	    }
	    i_compo++;
	}
	ajout=ajout.substr(0,ajout.length-1);
	connection.query(ajout, function (err) {
	    if (err) throw err;
	    req.session.panier=[];
	    res.redirect("/jardinerie-de-lua/commandes");
	});
    });
    
});

router.get('/commandes', function (req, res){
    async.parallel([
	function (callback) {
	    connection.query("SELECT id, etat, prix, year(date), month(date), day(date) FROM commande WHERE pseudo_client='"+req.session.pseudo+"' ORDER BY date DESC", function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	},function (callback) {
	    connection.query("SELECT C.id, F.nom, C.nombre, C.id_commande, C.id_bouquet FROM composition C JOIN fleur F ON C.id_fleur=F.id WHERE id_commande IN (SELECT id FROM commande WHERE pseudo_client='"+req.session.pseudo+"')", function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	},function (callback) {
	    connection.query("SELECT * FROM bouquet", function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	}
    ], function (error, callbackResults) {
		console.log(callbackResults[0]);
	res.render('commandes.ejs', {pseudo : req.session.pseudo,
				     commande : callbackResults[0],
				     fleur : callbackResults[1],
				     bouquet : callbackResults[2]});
    });
});

// ------------------- REALISER BOUQUET -------------------- //

router.get('/realiser', function (req, res){
    async.parallel([
	function(callback) {
	    var bouq = 'UPDATE composition SET etat=1, pseudo_vendeur = "'+req.session.pseudo+'" WHERE (SELECT DISTINCT id FROM (SELECT * FROM composition) AS T WHERE etat=1 AND pseudo_vendeur = "'+req.session.pseudo+'") IS NULL AND id IN (SELECT MIN(id) FROM (SELECT * FROM composition) AS T WHERE etat=0)';
            connection.query( bouq, function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	},function(callback) {
	    var fleurs = 'SELECT C.id, C.nombre, F.nom, F.photo FROM composition C JOIN fleur F ON C.id_fleur = F.id WHERE etat=1 AND pseudo_vendeur="'+req.session.pseudo+'"';
            connection.query(fleurs, function (err, rows) {
		if (err) {return callback(err);}
		return callback(null, rows);
            });
	}
    ], function(error, callbackResults) {
	if (error) {
            console.log(error);
	} else {
	    connection.query("UPDATE commande SET etat=1 WHERE id NOT IN(SELECT id_commande FROM composition WHERE etat=0)", function (err, rows) {
		if (err) {throw (err);}
            });
	    connection.query("UPDATE commande SET etat=2 WHERE id NOT IN(SELECT id_commande FROM composition WHERE etat!=2)", function (err, rows) {
		if (err) {throw (err);}
            });
            res.render('realiser.ejs', {fleur: callbackResults[1]});
	}
    });    
});

router.post('/realiser', function (req, res){
    if (req.body.id){
	connection.query("UPDATE composition SET etat=2 WHERE id="+req.body.id , function (err, rows) {
	    if (err) {throw (err);}
	});
    }
    res.redirect("/jardinerie-de-lua/realiser");
    
});
