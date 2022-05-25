$(document).ready (function () {
    
    // ------------------ GESTION PRIX -------------------- //
    
    var inp = $("input.fleur");
    
    var len=inp.length;
    var quantite = [];
    var prix_tot = 0;
    for (var i=0;i<len;i++){
	quantite[i]=inp.eq(i).val();
	prix_tot+=quantite[i]*prix[i];
	document.getElementById("prix_tot").innerHTML=Math.round(prix_tot*100)/100;
	inp.eq(i).change(function () {
	    var j = $(this).attr('id') - 1;
	    var inter = quantite[j];
	    quantite[j]=$(this).val();
	    inter -= quantite[j];
	    if (inter < 0){
		prix_tot += (-inter)*prix[j];
	    }else {
		prix_tot -= inter*prix[j];
	    }
	    document.getElementById("prix_tot").innerHTML=Math.round(prix_tot*100)/100;
	});
    }
    
    // ---------------- AFFICHAGE PRIX ------------------ //

    var cont = false;

    $("#cont").on('change', function () {
	cont=!cont;
	if (cont){
	    for (var i=0; i<len; i++){
		$(imgs).eq(i).css({"filter" : "blur(2px)"});
		$(imgs).eq(i).css({"z-index" : "0"});  
	    }
	}else{
	    for (var i=0; i<len; i++){
		$(imgs).eq(i).css({"filter" : "blur(0)"});
		$(imgs).eq(i).css({"z-index" : "2"});  
	    }
	}
    });
    
    // ------------------ BLUR EFFECT -------------------- //

    var imgs = $("img");

    function hov () {
	if(!cont){
	    $(this).parent().find("img").css({"filter" : "blur(2px)"});
	    $(this).parent().find("img").css({"z-index" : "0"});
	}else{
	    $(this).parent().find("img").css({"filter" : "blur(0)"});
	    $(this).parent().find("img").css({"z-index" : "2"});
	}
    }

    function notHov(){
	$(this).parent().find("img").css({"filter" : "blur(0)"});
	$(this).parent().find("img").css({"z-index" : "2"});
    }
    
    for (var i=0; i<len; i++){
	$(imgs).eq(i).mouseenter(function() {
	    if (!cont){
		$(this).css({"filter" : "blur(2px)"});
		$(this).css({"z-index" : "0"});
	    }else{
		$(this).css({"filter" : "blur(0)"});
		$(this).css({"z-index" : "2"});
	    }
	});
	$(".nom").eq(i).hover(hov,notHov);
	$(inp).eq(i).hover(hov,notHov);
	$(imgs).eq(i).mouseleave(function( event ) {
	    if(!cont){
		$(this).css({"filter" : "blur(0)"});
		$(this).css({"z-index" : "2"});
	    }else{
		$(this).css({"filter" : "blur(2px)"});
		$(this).css({"z-index" : "0"});
	    }
	});
	
	
    }

    // ------------------ REQUETE AJAX ------------------ //

    $("#commander").click(function(){
	var data = [[],[]];
	for (var i=0; i<inp.length; i++){
	    if (inp.eq(i).val() != 0){
		data[1].push(inp.eq(i).val());
		data[0].push(i+1);
	    }
	}
	$.ajax({
	    url : '/jardinerie-de-lua/ajout', 
	    type : 'POST',
	    data : {compo: 0, quantite: data, prix : prix_tot},
	    success: function(code_html, statut) {
		console.log("ici le succes");
		alert("Le bouquet a été ajouté au panier !");
	    },
	    error: function(res, statut, error) {
		alert("Le bouquet n'a pa pu être ajouté au panier !");
	    }
	    
	});	

    });
    
});


