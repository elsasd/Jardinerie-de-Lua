$(document).ready (function () {
    alert("Ici, une quantité de lavande, de sanfordii, de blé ou de santini ne correspond pas à une fleur mais à une quantité que l'on juge raisonnable pour la création du bouquet en photo.");
    var sel = $("select");
    var len = sel.length;
    //prix des fleurs
    var prix = [];
    //valeurs selectionée
    var quantite = [];
    //prix total
    var prix_tot = parseFloat(document.getElementById("prix_tot").textContent);

    for (var i = 0; i<len; i++){
	//on remplit defaut avec les valeur pr defaut
	quantite.push(sel.eq(i).find('option:selected').val());
	//on remplit prix avec les prix de chaque fleur
	prix.push(parseFloat(document.getElementById("prix"+i).textContent));
	sel[i].addEventListener('change', update);
    }

    function update () {
	for (var i=0; i<len; i++){
	    var inter = quantite[i];
	    quantite[i] = sel.eq(i).find('option:selected').val();
	    inter -= quantite[i];
	    if (inter>0)
		prix_tot -= Math.round((inter)*prix[i]*100)/100; 
	    else
		prix_tot += Math.round((-inter)*prix[i]*100)/100; 

	}
	document.getElementById("prix_tot").innerHTML=prix_tot;
    }

    // ----------------- REQUETE AJAX ----------------- 
    
    $("#commander").click(function(){
	var data=[[]];
	for (var i=0; i<sel.length; i++){
	    if (quantite[i]!=0) data[0].push(sel[i].getAttribute('id'));
	}
	for (var i=0; i<quantite.length; i++){
	    if (quantite[i]==0) quantite.splice(i, 1);
	}
	data.push(quantite);
	$.ajax({
	    url : '/jardinerie-de-lua/ajout', 
	    type : 'POST',
	    data : {compo : id,quantite: data, prix : prix_tot},
	    success: function(code_html, statut) {
		console.log("ici le succes");
		alert("Le bouquet a été ajouté au panier !");
	    },
	    error: function(res, statut, error) {
		alert("Le bouquet n'a pa pu être ajouté au panier !");
	    }
	    
	});	

    });

    // ------------------ BLUR EFFECT -------------------- //

    var imgs = $(".pic-container img");

    function hov () {
	$(this).parent().find("img").css({"filter" : "blur(2px)"});
	$(this).parent().find("img").css({"z-index" : "0"});   
    }

    function notHov(){
	$(this).parent().find("img").css({"filter" : "blur(0)"});
	$(this).parent().find("img").css({"z-index" : "2"});
    }
    
    for (var i=0; i<len; i++){
	$(imgs).eq(i).hover(function() {
	    $(this).css({"filter" : "blur(2px)"});
	    $(this).css({"z-index" : "0"});
	},function( event ) {
	    $(this).css({"filter" : "blur(0)"});
	    $(this).css({"z-index" : "2"});
	});
	$(".nom").eq(i).hover(hov,notHov);

    }


    

});
