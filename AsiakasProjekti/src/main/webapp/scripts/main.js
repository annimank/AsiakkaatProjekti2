//Lomake: muuttaa kaikki kentät automaattisesti JSON-stringiksi
function serialize_form(lomake){
	return JSON.stringify(
	    Array.from(new FormData(lomake).entries())
	        .reduce((m, [ key, value ]) => Object.assign(m, { [key]: value }), {})
	        );	
} 


function haeAsiakkaat() {
	let url = "myynti"
	let requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }       
    };    
    fetch(url, requestOptions)
    .then(response => response.json())
   	.then(response => printItems(response)) 
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}


function printItems(respObjList){
	let htmlStr="";
	for(let item of respObjList){
    	htmlStr+="<tr id='rivi_"+item.asiakas_id+"'>";
    	htmlStr+="<td>"+item.etunimi+"</td>";
    	htmlStr+="<td>"+item.sukunimi+"</td>";
    	htmlStr+="<td>"+item.puhelin+"</td>";
    	htmlStr+="<td>"+item.sposti+"</td>";
    	htmlStr+="<td><span class='poista' onclick=varmistaPoisto("+item.Asiakas_id+",'"+encodeURI(item.etunimi)+"')>Poista</span></td>";
    	//encodeURI() muutetaan erikoismerkit, välilyönnit jne. UTF-8 merkeiksi.
    	htmlStr+="</tr>";    	
	}	
	document.getElementById("tbody").innerHTML = htmlStr;	
}

haeAsiakkaat();

	function haeTieto() {
	    var input, filter, found, table, tr, td, i, j;
	    input = document.getElementById("haku");
	    filter = input.value.toUpperCase();
	    table = document.getElementById("listaus");
	    tr = table.getElementsByTagName("tr");
	    for (i = 0; i < tr.length; i++) {
	        td = tr[i].getElementsByTagName("td");
	        for (j = 0; j < td.length; j++) {
	            if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
	                found = true;
	            }
	        }
	        if (found) {
	            tr[i].style.display = "";
	            found = false;
	        } else {
	            tr[i].style.display = "none";
	        }
	    }
	}
	
	function tutkiJaLisaa() {
		if (tutkiTiedot() == true) {
			lisaaTiedot();
		}	
	}
	
	function tutkiTiedot() {
		let ilmo="";
		//let d = new Date(); //Ei tarvita tässä, liittyy autoon
		if (document.getElementById("etunimi").value.length<1) {
			ilmo="Etunimi ei kelpaa!";
			document.getElementById("etunimi").focus();
		} else if (document.getElementById("sukunimi").value.length<2) {
			ilmo="Sukunimi ei kelpaa!";
			document.getElementById("sukunimi").focus();
		} else if (document.getElementById("puhelin").value.length<5) {
			ilmo="Puhelinumero ei kelpaa!";
			document.getElementById("puhelin").focus();
		} else if (document.getElementById("sposti").value.length<3) {
			ilmo="Sähköpostiosoite ei kelpaa!";
			document.getElementById("sposti").focus();
		}
		if (ilmo!="") {
			document.getElementById("ilmo").innerHTML=ilmo;
			setTimeout(function(){document.getElementById("ilmo").innerHTML=";"}, 3000);
			return false;
		} else {
			document.getElementById("etunimi").value=siivoa(document.getElementById("etunimi").value);
			document.getElementById("sukunimi").value=siivoa(document.getElementById("sukunimi").value);
			document.getElementById("puhelin").value=siivoa(document.getElementById("puhelin").value);
			document.getElementById("sposti").value=siivoa(document.getElementById("sposti").value);	
			return true;
		}
	}
	
	//Funktio XSS-hyökkäysten estämiseksi (Cross-site scripting)
	function siivoa(teksti){
		teksti=teksti.replace(/</g, "");//&lt;
		teksti=teksti.replace(/>/g, "");//&gt;	
		teksti=teksti.replace(/'/g, "''");//&apos;	
		return teksti;
	}
	
	function lisaaTiedot(){
		let formData = serialize_form(document.lomake); //Haetaan tiedot lomakkeelta ja muutetaan JSON-stringiksi
		console.log(formData);
		let url = "myynti";    
    	let requestOptions = {
       	 method: "POST", //Lisätään asiakas
       	 headers: { "Content-Type": "application/json" },  
    		body: formData
   	 	};    
    	fetch(url, requestOptions)
    	.then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   		.then(responseObj => {	
   			//console.log(responseObj);
   			if(responseObj.response==0){
   				document.getElementById("ilmo").innerHTML = "Asiakkaan lisäys epäonnistui.";	
       		}else if(responseObj.response==1){ 
        		document.getElementById("ilmo").innerHTML = "Asiakkaan lisäys onnistui.";
				document.lomake.reset(); //Tyhjennetään asiakkaan lisäämisen lomake		        	
			}
			setTimeout(function(){ document.getElementById("ilmo").innerHTML=""; }, 3000);
   		})
   		.catch(errorText => console.error("Fetch failed: " + errorText));
	}
	
	function varmistaPoisto(Asiakas_id, etunimi){
		//confirm metodi tekee boxin, jossa kysyy kysymksen
		if(confirm("Poista asiakas " + decodeURI(etunimi) +"?")){ //decodeURI() muutetaan enkoodatut merkit takaisin normaaliksi kirjoitukseksi
			poistaAsiakas(Asiakas_id, encodeURI(etunimi));
		}
	}
	
	function poistaAsiakas(Asiakas_id, etunimi) {
		let url = "asiakkaat?asiakas_id=" + Asiakas_id;    
    	let requestOptions = {
        	method: "DELETE",             
    	};    
    	fetch(url, requestOptions)
    	.then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   		.then(responseObj => {	
   		//console.log(responseObj);
   			if(responseObj.response==0){
				alert("Asiakkaan poisto epäonnistui.");	        	
        	}else if(responseObj.response==1){ 
				document.getElementById("rivi_"+ Asiakas_id).style.backgroundColor="red";
				alert("Asiakkaan " + decodeURI(etunimi) +" poisto onnistui."); //decodeURI() muutetaan enkoodatut merkit takaisin normaaliksi kirjoitukseksi
				haeAsiakkaat();        	
			}
   		})
   		.catch(errorText => console.error("Fetch failed: " + errorText));
	}
	
	
	
	