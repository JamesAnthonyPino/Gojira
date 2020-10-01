/**
 * Dialog - basic movable dialog widget
 * 
 * Dialog is a fully-functional dialog widget that prvides the ability to
 * set a title, set content, specify a trigger and more.
 * 
    const myDialog = new Dialog({
        title: "My Test Dialog",        
        target: "#testDiv",
        trigger: "#testLink",
        content: "Lorem ipsum"
    });
 */
class Dialog {

    /**
     * Create a new Dialog
     * 
     * @param {Object} cfg 
     */
    constructor(cfg) {

        this.CFG = cfg;
        var self = this;


        this.template = `
            
                <div class="header">
                    <div class="left">
                        <h3 class="title"></h3>
                    </div>					
                    <div class="right">
                        <button class="closeLink">X</button>
                    </div>        
                </div>                
            
        `;



        if (cfg.target) {
            
            let existingContentNode = document.querySelector(cfg.target).querySelector(".content");
            let clonedContentNode;
            if(existingContentNode) {
                clonedContentNode = existingContentNode.cloneNode(true);
            }
                    
            document.querySelector(cfg.target).innerHTML = this.template;
            document.querySelector(cfg.target).appendChild(clonedContentNode);
            
        }


        this.DIALOG = document.querySelector(cfg.target);
        this.DIALOG.className = "dialog";
        


        if (cfg.title) {
            this.title = cfg.title;
        }

        this.DIALOG.querySelector(".closeLink").onclick = () => this.close();


        if (
            (!cfg.hasOwnProperty("draggable")) ||
            (cfg.hasOwnProperty("draggable") && cfg.draggable === true)
        ) {
            this._makeDraggable(this.DIALOG);
        }



        // --- set up trigger --
        if(cfg.trigger) {
            document.querySelector(cfg.trigger).onclick = ()=> this.open();

        }



        // ------- onOpen and onClose callbacks -----------------
        if(cfg.onOpen) {
            this.CFG.onOpen = cfg.onOpen;
        }

        if(cfg.onClose) {
            this.CFG.onClose = cfg.onClose;
        }


        
        this.destroyed = false;
    }

    /**
     * Open the dialog.
     */
    open() {
        this.DIALOG.style.display = "block";
        if(this.CFG.onOpen) {
            this.CFG.onOpen();
        }
    }

    /**
     * Close the dialog.
     */
    close() {
        this.DIALOG.style.display = "none";
        if(this.CFG.onClose) {
            this.CFG.onClose();
        }
    }

    /**
     * Destroy the dialog. Upon successful destruction,
     * sets destroyed flag to true.
     */
    destroy() {
        this.DIALOG.innerHTML = "";
        this.destroyed = true;
    }    

    /**
     * (private)
     * Makes the dialog draggable.
     * @param {Object} elmnt 
     */
    _makeDraggable(elmnt) {

        var header = elmnt.querySelector(".header");


        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (header) {
            // if present, the header is where you move the DIV from:
            header.onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }


    /**
     * The HTML for the main content area of the dialog.
     */
    set content(content) {
        this.DIALOG.querySelector(".content").innerHTML = content;
    }

    /**
     * The title that is displayed in the header of the dialog.
     */
    set title(title) {
        this.DIALOG.querySelector(".title").innerText = title;
    }




}