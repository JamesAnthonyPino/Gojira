(function(){
	
	// If this is the first time running or there is no current config,
	// this will set a parameter and cause it to open the config dialog (see bottom)
	if(! localStorage.getItem("GOJIRA_CONFIG")) {	
		localStorage.setItem("GOJIRA_CONFIG",  JSON.stringify({ "initialized": false })  );
	}
	var CFG = JSON.parse(localStorage.getItem("GOJIRA_CONFIG"));

	
	/**
	 * submitQuery - submit the "query" and split it up into seperate ticket links.
	 * 
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
	
	/**
	 * addToHistory - add a ticket number to the history
	 * 
	 * @param {String} item - the item, e.g., "ABC-123"
	 */
	function addToHistory(item) {
		item = item.toUpperCase();
		var hist = localStorage.getItem("GOJIRA_HIST") || "";
		var histItems = hist == "" ? [] : hist.split(",");
		
		if(histItems.indexOf(item) < 0) {
			histItems.push(item);
		}
				
		localStorage.setItem("GOJIRA_HIST", histItems.join(","));
		getHistory();
	}
	
	/**
	 * clearHistory - clear the current history (removes the data from local storage).
	 */
	function clearHistory() {
		localStorage.removeItem("GOJIRA_HIST");
		getHistory();
	}
	
	/**
	 * getHistory - get and construct the history items.
	 */
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

	/**
	 * addPrefixes - construct and add prefix buttons to the UI
	 */
	function addPrefixes() {
		if(CFG.PROJECT_PREFIXES) {
			q("#projectPrefixes").innerHTML = "";
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
	}
	addPrefixes();
	
	
	// ------------ Various event handlers -----------------------

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
	
	
	
	// Construct the Help Dialog
	const helpDialog = new Dialog({
		title: "Help/About",
		target: "#helpAboutDialog",
		trigger: "#helpAboutLink"		
	});

	
	// Construct the configuration dialog
	const configDialog = new Dialog({
		title: "Configuration",	
		target: "#configDialog",
		trigger: "#configLink",
		onOpen: handleConfigDialog	
	});

	


	// Save configuration handler
	q("#configSaveButton").onclick = () => {
		let cfg = localStorage.getItem("GOJIRA_CONFIG");
		let cfgAsJson = {};
		if(cfg) {
			cfgAsJson = JSON.parse(cfg);
		}
		cfgAsJson.JIRA_BASE_URL = q("#jiraBaseUrl").value.replace(/\/$/,"");
		cfgAsJson.PROJECT_PREFIXES = q("#projectList").value;
		cfgAsJson.initialized = "true";
		localStorage.setItem("GOJIRA_CONFIG", JSON.stringify(cfgAsJson));
		configDialog.close();
		CFG = cfgAsJson;
		addPrefixes();
	}

	// Populate the values in the config dialog
	function handleConfigDialog() {
		let cfg = localStorage.getItem("GOJIRA_CONFIG");
		let cfgAsJson;
		if(cfg) {
			cfgAsJson = JSON.parse(cfg);
			
			q("#jiraBaseUrl").value = cfgAsJson.JIRA_BASE_URL || "";
			q("#projectList").value = cfgAsJson.PROJECT_PREFIXES || "";			
		}
	}



	// Construct the URL for the create issue link and add handler
	q("#createLink").href = CFG.JIRA_BASE_URL + "/secure/CreateIssue!default.jspa";
	q("#createButton").onclick = function(){
		q("#createLink").click()
	}
		
	
	// Call things when page is finished loading
	document.addEventListener("DOMContentLoaded", function(){
		getHistory();
	});


	// Automatically opne the config dialog if no configuration exists
	if(CFG.initialized == false) {
		setTimeout(()=>{
			q("#configLink").click();
		},500);
		
	}	
})();