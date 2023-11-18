chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "fetchContent") {
        console.log("fteching");
        fetch('https://nertaskapp-c25ba42a297f.herokuapp.com/extract_entities', {
            method: 'POST',
            body: JSON.stringify({ content: request.content }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Send the entities back to the content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                const activeTab = tabs[0];
                console.log("sendback highlight");
                chrome.tabs.sendMessage(activeTab.id, {action: "highlightEntities", entities: data});
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });

        return true;  // Will respond asynchronously.
    }
});



