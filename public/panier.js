$(document).ready (function () {
    var supp=$(".supp");
    for (var i=0; i<supp.length; i++){
	supp.eq(i).click(function () {
	    var ind = this.getAttribute('id');
	    $.ajax({
		url : '/jardinerie-de-lua/supp', 
		type : 'POST',
		data : {id : ind},
		success: function(code_html, statut) {
		    //alert("La commande a été ajoutée au panier !");
		},
		error: function(res, statut, error) {
		    //alert("La commande n'a pa pu être ajoutée au panier !");
		}
		
	    });
	});
    }
});


