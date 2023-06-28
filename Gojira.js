class Gojira {

	constructor() { }

    start() {
        // If this is the first time running or there is no current config,
		// this will set a parameter and cause it to open the config dialog (see bottom)
        if(! localStorage.getItem("GOJIRA_CONFIG")) {
			localStorage.setItem("GOJIRA_CONFIG",  JSON.stringify({ "initialized": false })  );
		}
		this.CFG = JSON.parse(localStorage.getItem("GOJIRA_CONFIG"));



        // ------------ Various event handlers -----------------------

        q("#goButton").onclick = () => {
            this.submitQuery();
        }


        q("#queryText").onkeyup = (evt) => {
            if(evt.key == "Enter") {
                this.submitQuery();
            }
        }
        
        q("#initClearHistButton").onclick = () => {
            q("#initClearHistButton").style.display = "none";
            q("#confirmClearHistBox").style.display = "";
        }

        q("#clearHistButton").onclick = () => {		
            this.clearHistory();				
        }

        q("#cancelClearHistButton").onclick = () => {
            q("#confirmClearHistBox").style.display = "none";
            q("#initClearHistButton").style.display = "";
        }
        
        
        q("#clearMultiButton").onclick = () => {
            q("#multiItems").innerHTML = "";
            q("#multiSection").style.display = "none";
        }

        const self = this;
        q("#sortHistButton").onclick = function() {
            if(this.getAttribute("data-sorted") == "false") {
                self.getHistory(true);
                this.value = "Sort Chronlogically";	
                this.setAttribute("data-sorted", "true");
            } else {
                self.getHistory(false);
                this.value = "Sort Alphabeticaly";
                this.setAttribute("data-sorted", "false");
            }
        }

            // Construct the Help Dialog
        // const helpDialog = new Dialog({
        //     title: "Help/About",
        //     target: "#helpAboutDialog",
        //     trigger: "#helpAboutLink"		
        // });

        
        // Construct the configuration dialog
        // const configDialog = new Dialog({
        //     title: "Configuration",	
        //     target: "#configDialog",
        //     trigger: "#configLink",
        //     onOpen: this.handleConfigDialog	
        // });

        
		q("#helpAboutLink").onclick = () => {
			q("#helpAboutDialog").showModal();
		}

		q("#helpAboutDialogClose").onclick = () => {
			q("#helpAboutDialog").close();
		}

		q("#configLink").onclick = () => {
			q("#configDialog").showModal();
			this.handleConfigDialog();
		}
		
		q("#configDialogClose").onclick = () => {
			q("#configDialog").close();
		}

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
            this.CFG = cfgAsJson;
            this.addPrefixes();
        }


        // Construct the URL for the create issue link and add handler
        q("#createLink").href = this.CFG.JIRA_BASE_URL + "/secure/CreateIssue!default.jspa";
        q("#createButton").onclick = () => {
            q("#createLink").click()
        }
            
        
        // Call things when page is finished loading
        document.addEventListener("DOMContentLoaded", ()=> {
            this.getHistory();
        });


        // Automatically opne the config dialog if no configuration exists
        if(this.CFG.initialized == false) {
            setTimeout(()=>{
                q("#configLink").click();
            },500);
            
        }	



        this.addPrefixes();
    }



	/**
	 * submitQuery - submit the "query" and split it up into seperate ticket links.
	 * 
	 * ABC-123/212/198 <-- opens up multiple tickets of the samne project
	 * ABC-123,XYZ-212,FOO-999 <-- opens multiple tickets of the same project
	 * ABC-123/212/198,XYZ-212,FOO-111/999 <-- opens multiple tickets of mixed projects 
	 */
	 submitQuery() {
		let qt = q("#queryText").value;
		q("#queryText").value = qt.replace(/\s*/g,"");
		qt = q("#queryText").value;
		
		if(qt == "") return;
				
		const projects = qt.split(",");
		
		const urls = [];
		projects.forEach((v,i) => {
			const tickets = v.split("/");
			const project = tickets[0].split("-")[0];
			tickets.forEach((v2,i2) => {
				const parts = v2.split("-");
				let ticketNumber;
				if (parts.length > 1) {
					ticketNumber = parts[1];
				} else {
					ticketNumber = parts[0];
				}
								
				const ticket = project + "-" + ticketNumber;
				urls.push(ticket);
			});
		});
		 		
		
		if(urls.length > 1) {
			q("#multiSection").style.display = "";
			q("#multiItems").innerHTML = "";
			urls.forEach((v,i) => {
				const url = this.CFG.JIRA_BASE_URL + "/browse/" + v;		
				const html = `<a href="${url}">${urls[i]}</a> `;
				q("#multiItems").innerHTML += html;				
				this.addToHistory(urls[i]);			
			})		
		} else {
			q("#multiItems").innerHTML = "";
			q("#multiSection").style.display = "none";
			const url = this.CFG.JIRA_BASE_URL + "/browse/" + urls[0];
			window.open(url);
			this.addToHistory(urls[0]);
		}
	}


	/**
	 * addToHistory - add a ticket number to the history
	 * 
	 * @param {String} item - the item, e.g., "ABC-123"
	 */
	 addToHistory(item) {
		item = item.toUpperCase();
		const hist = localStorage.getItem("GOJIRA_HIST") || "";
		const histItems = hist == "" ? [] : hist.split(",");
		
		if(histItems.indexOf(item) < 0) {
			histItems.push(item);
		}
				
		localStorage.setItem("GOJIRA_HIST", histItems.join(","));
		this.getHistory();
	}


	/**
	 * clearHistory - clear the current history (removes the data from local storage).
	 */
	clearHistory() {
		localStorage.removeItem("GOJIRA_HIST");
		this.getHistory();
	}



	clearHistoryItem(item) {
		const itemText = localStorage.getItem("GOJIRA_HIST");
		if(itemText) {
			const items = localStorage.getItem("GOJIRA_HIST").split(",");
			const itemToRemove = items.indexOf(item);
			items.splice(itemToRemove,1);

			const itemsToStore = items.join(",");
			localStorage.setItem("GOJIRA_HIST", itemsToStore);
			this.getHistory();
		}
		
	}

	/**
	 * getHistory - get and construct the history items.
	 */
	 getHistory(sort) {

		q("#histItems").innerHTML = "";

		const hist = localStorage.getItem("GOJIRA_HIST") || "";
		let histItems = hist == "" ? [] : hist.split(",").reverse();
		
		if(histItems.length < 1) {
			q("#histSection").style.display = "none";
			return;
		}


		if(sort) {
			histItems = histItems.sort((a,b) => {
				if(a < b) {
					return -1;
				} else if(a > b) {
					return 1;
				} else {
					return 0;
				}
			});
		}
		
		q("#histSection").style.display = "";
		
		histItems.forEach((v,i)=> {
			const ul = q("#histItems");
			const li = document.createElement("li");
			
			const delLink = document.createElement("a");
			delLink.href="#"
			delLink.className = "del-link";
			delLink.textContent = "x";
			delLink.onclick = (evt) => {
				evt.preventDefault();
				this.clearHistoryItem(v);
			}


			let itemLink = document.createElement("a");
			itemLink.className = "item-link";
			itemLink.target = "_tab";
			itemLink.setAttribute("data-item-uid", v);
			itemLink.href = `${this.CFG.JIRA_BASE_URL}/browse/${v}`;
			itemLink.textContent = v;

			li.appendChild(delLink);
			li.appendChild(itemLink);
			
			ul.appendChild(li);
		});
	}


	/**
	 * addPrefixes - construct and add prefix buttons to the UI
	 */
	 addPrefixes() {
		if(this.CFG.PROJECT_PREFIXES) {
			q("#projectPrefixes").innerHTML = "";
			const prefixes = this.CFG.PROJECT_PREFIXES.split(",") || [];
			prefixes.forEach((v) => {
				const pf = q(".prefixItemTemplate").cloneNode(true);
				pf.querySelector(".projectPrefix").innerText = v.trim();
				pf.querySelector(".projectPrefix").onclick = function() {				
					q("#queryText").value = this.innerText + "-";
					q("#queryText").focus();
				}			
				q("#projectPrefixes").appendChild(pf);
				pf.style.display="";
			});		
		}
	}
	


    // Populate the values in the config dialog
	handleConfigDialog() {
		const cfg = localStorage.getItem("GOJIRA_CONFIG");
		let cfgAsJson;
		if(cfg) {
			cfgAsJson = JSON.parse(cfg);
			
			q("#jiraBaseUrl").value = cfgAsJson.JIRA_BASE_URL || "";
			q("#projectList").value = cfgAsJson.PROJECT_PREFIXES || "";			
		}
	}

}