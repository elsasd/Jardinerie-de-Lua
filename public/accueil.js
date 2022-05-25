$(document).ready (function () {
    
    // -------------------- GESTION TRI -------------------- //
    var defile = $("div.defile");
    var len = defile.length;
    defile.hide();
    
    var but = document.getElementById("buttri");
    var params = new URLSearchParams(document.location.search.substring(1));
    var min = params.get("min") ? params.get("min") : 0;
    var max = params.get("max") ? params.get("max") : 100;
    var prix = $("div.prix");
    
    var supp = 0;
    for (var j=0; j<len+supp; j++){
	var p = prix[j].textContent.substring(7,prix[j].textContent.length-1);
	if (p<min || p>max){
	    defile.splice((j-supp), 1);
	    len --;
	    supp ++;
	}
    }

    // -------------------------- ONGLET TRI ------------------------- //

    $("#form button").hide();
    var tri = $(".tri");
    console.log(tri.length);
    for (var j = 0; j < tri.length; j++){
	tri.eq(j).css("left", "-145px");
	tri.eq(j).hover(function () {
	    $(this).animate({ "left" : "0"},"slow");
	}, function () {
	    $(this).animate({ "left" : "-145px"},"slow");
	});
    }
    
    // ------------------- ANIMATION DE L'ACCUEIL -------------------- //
    
    var i = 0;
    var start = ["100%", "130%", "160%"];
    var end = ["3%", "35.33%", "67.66%"];

    for ( ; i<3; i++){
	defile.eq(i).css("left", start[i]);
	defile.eq(i).show();
	defile.eq(i).animate({ "left": end[i]},"slow");
    }
    
    ret = 0;

    function defLeft () {
	for (let j = 3; j>0; j--){
	    defile.eq((i - j)%len).animate({ "left": "-100%"},"slow");
	}
	
	for (let j = 0; j<3; j++){
	    if (i == 0)
		ret = (ret + len)%3;
	    defile.eq(i).css("left", start[(i + ret)%3]);
	    defile.eq(i).show();
	    defile.eq(i).animate({ "left": end[(i + ret) %3]},"slow");
	    i = (i+1)%len;
	}
    }

    function defRight () {
	for (let j = 3; j>0; j--){
	    i = (i - 1) % len;
	    defile.eq(i).animate({ "left": "+100%"},"slow"); 
	}

	for (let j = 0; j<3; j++){
	    if (i == 0)
		ret = (((ret-1)%3)+3)%3;
	    i = (((i-1)%len)+len)%len;
	    defile.eq(i).css("left", "-100%");
	    defile.eq(i).show();
	    defile.eq(i).animate({ "left": end[(i + ret) %3]},"slow");
	    
	}
	console.log(ret);
	i = (i+3)%len;
    }
    
    var interval = window.setInterval(defLeft, 5000);

    // ------------- CREATION DES BOUTONS DE L'ACCUEIL -------------- //

    /*var left = document.createElement("div");
    var contenu = document.createTextNode('<');
    left.appendChild(contenu);
    var courant = document.getElementById('left');
    courant.appendChild(left);

    var right = document.createElement("div");
    var contenur = document.createTextNode('>');
    right.appendChild(contenur);
    var courantr = document.getElementById('right');
    courantr.appendChild(right);*/

    
    // ------------- ACTION DES BOUTONS DE L'ACCUEIL -------------- //

    var def = true;
    var duree = 4000;
    $("#left").on('click', function (){
	if (def)
	    window.clearInterval(interval);
	defRight();
	if (def)
	    setTimeout(interval = window.setInterval(defLeft, duree), duree);
    });

    $("#right").on('click', function (){
	if (def)
	    window.clearInterval(interval);
	defLeft();
	if(def)
	    setTimeout(interval = window.setInterval(defLeft, duree), duree);
    });

    $("#stop").on('click', function() {
	if (def){
	    window.clearInterval(interval);
	    $('#stop').text("Reprendre le défilement");
	}
	else{
	    interval = window.setInterval(defLeft, duree);
	    $('#stop').text("Stopper le défilement");
	}
	def=!def;
    });
/*
    // ----------------------- EFFET SHAKE -----------------------//
    
    var shaking = false;
    for (var j = 0; j < len; j++){
	defile.eq(j).hover(function() {
	    if (!shaking){
		$(this).effect("shake", {"direction":"up", "times":"1"}, 500);
		shaking=true;
	    }
	    setTimeout(function () {
		$(this).stop(true, true);
	    }, 500);
	}, function() {
	    shaking = false;
	});
    }
*/
    // -------------------- EFFET IMG ZOOM --------------------//

	/*var timer;
	$("body").on("mouseenter", "div", function(){
		timer = setTimeout(function () {
			$("p").removeClass("hidden");
		}, 2000);
	}).on("mouseleave", "div", function(){
		clearTimeout(timer);
		$("p").addClass("hidden");
	});*/

    var imgs = $("img");
	var time = 200;
	var hoverTimer;
    $(imgs).mouseenter(function(){
		var $this = $(this);
		hoverTimer = setTimeout(function() {
			$this.animate({'margin-left' : '0', 'width' : '100%'});
			$this.parent().find(".nom").hide(500);
			$this.parent().find(".prix").hide(500);
		}, time);
    });
    
    $(imgs).mouseleave(function (){
		clearTimeout(hoverTimer);
		$(this).animate({'margin-left' : '5%', 'width' : '90%'});
		$(this).parent().find(".nom").show(500);
		$(this).parent().find(".prix").show(500);
    });

    $(defile).mouseenter(function (){
		var $this = $(this);
		hoverTimer = setTimeout(function() {
			$(this).css('padding','0');
			$(this).css('width','29.33%');
		}, time);
    });

    $(defile).mouseleave(function(){
		clearTimeout(hoverTimer);
		$(this).css('padding','1%');
		$(this).css('width','27.33%');
		$(this).find(".nom").show(500);
		$(this).find(".prix").show(500);
    });

    
});
