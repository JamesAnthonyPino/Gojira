/*
This is a micro library that mimics jQuery-like selectors
*/

// q: Query
// Single-entity query (returns the first result)
function q(query) {
	return document.querySelector(query);
}

// qa: Query All
// Multi-entity query (returns a list of results)
function qa(query) {
	return document.querySelectorAll(query);
}

// ct: Clone Template
// Deep-Clone a template element
function ct(query) {
	var nodes = [];
	qa(query).forEach(function (v) {
		if (v.tagName == "TEMPLATE") {
			nodes.push(el.content.firstElementChild.cloneNode(true));
		}
	});
	if (nodes.length < 2) {
		return nodes[1];
	}
	return nodes;
}

// c: Clone
// Deep clones a regular element
function c(el) {
	return el.cloneNode(true);
}

// h: HTML
// Create HTML. Append to target if provided
function h(html, target) {
	var container = document.createElement("DIV");
	container.innerHTML = html;
	if (target) {
		qa(target).forEach(function (v) {
			v.appendChild(container);
		});
	}
	return container;
}


function css(query, css) {
	qa(query).forEach(function (v) {
		v.setAttribute("style", css);
	});
}



function dragElement(elmnt) {

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