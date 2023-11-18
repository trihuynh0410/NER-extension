function walk(node, callback) {
    if (node.nodeType === 3) { // Text node
        callback(node);
    } else {
        for (let child of node.childNodes) {
            walk(child, callback);
        }
    }
}

function highlightNode(node, word, color) {
    const wordIndex = node.nodeValue.indexOf(word);
    if (wordIndex === -1) return; // If the word isn't found, exit the function
    console.log("Highlighting word:", word, "with color:", color);
    // Text before the matched word
    const before = node.nodeValue.slice(0, wordIndex);
    if (before) {
        node.parentNode.insertBefore(document.createTextNode(before), node);
    }

    // Create a span for the matched word and set its background color
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.textContent = word;
    node.parentNode.insertBefore(span, node);

    // Update the original text node to contain only the text after the matched word
    node.nodeValue = node.nodeValue.slice(wordIndex + word.length);
}

function getColorForLabel(label) {
    switch (label) {
        case "B-PER":
        case "I-PER":
            return "lightblue";
        case "B-LOC":
        case "I-LOC":
            return "lightgreen";
        case "B-ORG":
        case "I-ORG":
            return "lightcoral";
        case "B-MISC":
        case "I-MISC":
            return "lightyellow";
        default:
            return "transparent";
    }
}

function highlightEntities(entities) {
    console.log("Inside highlightEntities function");
    entities.forEach(sentenceArray => {
        sentenceArray.forEach(([[word, pos], label]) => {
            if (label !== "O") {
                const color = getColorForLabel(label);
                walk(document.body, (textNode) => {
                    highlightNode(textNode, word, color);
                });
            }
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content Script: Received a message.");
    console.log(request);

    if (request.message === "clicked_browser_action") {
        // Fetch the content of the page
        const pageContent = document.body.innerText;
        console.log("Receive click browser");
        // Send the content to the background script to get the entities
        chrome.runtime.sendMessage({action: "fetchContent", content: pageContent}, (response) => {
            console.log("entities no rep is:", response);
            if (response && response.entities) {
                console.log("entities is:", response.entities);
                highlightEntities(response.entities);
            }
        });
    } else if (request.action === "highlightEntities") {
        console.log("Received entities from background script:", request.entities);
        highlightEntities(request.entities);
    }
});

