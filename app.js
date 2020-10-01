(function(){

	let cfg = localStorage.getItem("GOJIRA_CONFIG");
	if(cfg) {
		CFG = JSON.parse(cfg);
	}

	
	/*
	 * ABC-123/212/198 <-- opens up multiple tickets of the samne project
	 * ABC-123,XYZ-212,FOO-999 <-- opens multiple tickets of the same project
	 * ABC-123/212/198,XYZ-212,FOO-111/999 <-- opens multiple tickets of mixed projects
	*/
	function submitQuery() {
		var qt = q("#queryText").value;
		q("#queryText").value = qt.replace(/\s*/g,"");
		qt = q("#queryText").value;
		
		if(qt == "") return;
				
		var projects = qt.split(",");
		
		var urls = [];
		projects.forEach(function(v,i){
			var tickets = v.split("/");
			var project = tickets[0].split("-")[0];
			tickets.forEach(function(v2,i2){
				var parts = v2.split("-");
				var ticketNumber;
				if (parts.length > 1) {
					ticketNumber = parts[1];
				} else {
					ticketNumber = parts[0];
				}
								
				var ticket = project + "-" + ticketNumber;
				urls.push(ticket);
			});
		});
		 		
		
		if(urls.length > 1) {
			q("#multiSection").style.display = "";
			q("#multiItems").innerHTML = "";
			urls.forEach(function(v,i){
				var url = CFG.JIRA_BASE_URL + "/browse/" + v;		
				var html = `<a href="${url}">${urls[i]}</a> `;
				q("#multiItems").innerHTML += html;				
				addToHistory(urls[i]);			
			})		
		} else {
			q("#multiItems").innerHTML = "";
			q("#multiSection").style.display = "none";
			var url = CFG.JIRA_BASE_URL + "/browse/" + urls[0];
			window.open(url);
			addToHistory(urls[0]);
		}
	}
	
	function addToHistory(item) {
		debugger
		item = item.toUpperCase();
		var hist = localStorage.getItem("GOJIRA_HIST") || "";
		var histItems = hist == "" ? [] : hist.split(",");
		
		if(histItems.indexOf(item) < 0) {
			histItems.push(item);
		}
				
		localStorage.setItem("GOJIRA_HIST", histItems.join(","));
		getHistory();
	}
	
	function clearHistory() {
		localStorage.removeItem("GOJIRA_HIST");
		getHistory();
	}
	
	function getHistory() {
		var hist = localStorage.getItem("GOJIRA_HIST") || "";
		var histItems = hist == "" ? [] : hist.split(",").reverse();
		var html = "";
		
		if(histItems.length < 1) {
			q("#histSection").style.display = "none";
			return;
		}
		
		q("#histSection").style.display = "";
		
		histItems.forEach(function(v,i){
			html += "<a target='_tab' href='" + CFG.JIRA_BASE_URL + "/browse/" + v + "'>" + v + "</a><br>";
		});
				
		q("#histItems").innerHTML = html;		
	}

	function addPrefixes() {		
		var prefixes = CFG.PROJECT_PREFIXES.split(",") || [];
		prefixes.forEach(function(v) {
			var pf = q(".prefixItemTemplate").cloneNode(true);
			pf.querySelector(".projectPrefix").innerText = v.trim();
			pf.querySelector(".projectPrefix").onclick = function(){				
				q("#queryText").value = this.innerText + "-";
				q("#queryText").focus();
			}			
			q("#projectPrefixes").appendChild(pf);
			pf.style.display="";
		});		
	}
	addPrefixes();
	
	
	q("#goButton").onclick = submitQuery;
	q("#queryText").onkeyup = function(evt) {
		if(evt.key == "Enter") {
			submitQuery();
		}
	}
	
	q("#clearHistButton").onclick = function() {
		clearHistory();
	}
	
	
	q("#clearMultiButton").onclick = function() {
		q("#multiItems").innerHTML = "";
		q("#multiSection").style.display = "none";
	}
	
	
	

	const helpDialog = new Dialog({
		title: "Help/About",
		target: "#helpAboutDialog",
		trigger: "#helpAboutLink"		
	});

	
	const configDialog = new Dialog({
		title: "Configuration",	
		target: "#configDialog",
		trigger: "#configLink",
		onOpen: handleConfigDialog	
	});

	



	q("#configSaveButton").onclick = () => {
		let cfg = localStorage.getItem("GOJIRA_CONFIG");
		let cfgAsJson = {};
		if(cfg) {
			cfgAsJson = JSON.parse(cfg);
		}

		cfgAsJson.JIRA_BASE_URL = q("#jiraBaseUrl").value;
		cfgAsJson.PROJECT_PREFIXES = q("#projectList").value;
		localStorage.setItem("GOJIRA_CONFIG", JSON.stringify(cfgAsJson));
		configDialog.close();
		CFG = cfgAsJson;
	}

	function handleConfigDialog() {
		let cfg = localStorage.getItem("GOJIRA_CONFIG");
		let cfgAsJson;
		if(cfg) {
			cfgAsJson = JSON.parse(cfg);

			q("#jiraBaseUrl").value = cfgAsJson.JIRA_BASE_URL;
			q("#projectList").value = cfgAsJson.PROJECT_PREFIXES;			
		}
	}



	
	q("#createLink").href = CFG.JIRA_BASE_URL + "/secure/CreateIssue!default.jspa";
	q("#createButton").onclick = function(){
		q("#createLink").click()
	}
		
	function toggle(node) {
		if(node.style.display == "block") {
			node.style.display = "none";
		} else {
			node.style.display = "block";
		}
	}
	
	document.addEventListener("DOMContentLoaded", function(){
		getHistory();
	});
	
})()