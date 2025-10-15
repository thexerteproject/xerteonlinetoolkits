//combines xml from xerte with xml from ai api
function build_xerte_xml(xml_tree, parent_name, parser){
    //if not root we combine basic with openai
    if (xml_tree.tagName !== parent_name) {
        var index = wizard_data[parent_name]?.new_nodes.indexOf(xml_tree.tagName);
        var basic_xml = parser.parseFromString(wizard_data[parent_name]?.new_nodes_defaults[index], "text/xml").children[0];

        for (var i = 0; i < basic_xml.attributes.length; i++){
            var attr = basic_xml.attributes[i];
            if (xml_tree.getAttribute(attr.name) == null) {
                xml_tree.setAttribute(attr.name, attr.value);
            }
        }
    }
    //recursively do this for all children
    //TODO Alek: if it is top level and does not have children
    if (xml_tree.hasChildNodes()) {
        //var children = xml_tree.children;
        var children = xml_tree.childNodes;
        for (let i = 0; i < children.length; i++) {
            build_xerte_xml(children[i], xml_tree.tagName, parser);
        }
    }
}

//changes ai api result into data usable by xerte, also adds it to the xerte data tree
/*function xml_to_xerte_content(data, key, pos, tree) {
    $('body').css("cursor", "default");
    var parser = new DOMParser();
    debugger
    var result = JSON.parse(data);
    if (result.status == 'success') {

        var x = parser.parseFromString(result["result"], "text/xml").children[0];
        debugger
        //merge xerte object root with ai result at root level.
            //TODO change lo_data[key].attributes get key from toolbox
            for (var prop in x.attributes) {
                if (Object.prototype.hasOwnProperty.call(x.attributes, prop)) {
                    const prop_name = x.attributes[prop];
                    if (Object.prototype.hasOwnProperty.call(lo_data[key].attributes, prop_name.nodeName)) {
                        lo_data[key].attributes[prop_name.nodeName] = x.attributes[prop].value;
                    } else {
                        //the property does not exist (prob optional)
                        //so we add it to the xml
                        //todo maybe check if it is one of the possibilities
                        lo_data[key].attributes[prop_name.nodeName] = x.attributes[prop].value;
                    }

                }
            }
        build_xerte_xml(x, x.tagName, parser);

        var children = x.children;
        var size = children.length;
        //add all populated children of top level object for example "quiz"
        for (let i = 0; i < size; i++) {
            addNodeToTree(key, pos, children[i].tagName, children[i], tree, true, true);
        }
        alert("Make sure to check the generated results for mistakes!!");
        console.log("done!")
    } else {
        console.log(result.message);
    }
}*/

function xml_to_xerte_content(data, key, pos, tree, realParent) {
    try {
        $('body').css("cursor", "default");
        $('.featherlight').css("cursor", "default")
        $('.featherlight-content').css("cursor", "default")
        var parser = new DOMParser();
        var result = JSON.parse(data);
        if (result.status == 'success') {
            var llmResultXml = parser.parseFromString(result["result"], "text/xml").children[0];
            //add p tags where needed to wysiwyc results
            //add_p_to_wysiwyg(llmResultXml);

            // Merge Xerte object root with AI result at root level.
            for (var prop in llmResultXml.attributes) {
                if (Object.prototype.hasOwnProperty.call(llmResultXml.attributes, prop)) {
                    const prop_name = llmResultXml.attributes[prop];
                    if (Object.prototype.hasOwnProperty.call(lo_data[key].attributes, prop_name.nodeName)) {
                        lo_data[key].attributes[prop_name.nodeName] = llmResultXml.attributes[prop].value;
                    } else {
                        lo_data[key].attributes[prop_name.nodeName] = llmResultXml.attributes[prop].value;
                    }
                }
            }
            if (lo_data[key].data !== null && llmResultXml.textContent !== null) {
                if (llmResultXml.firstChild && llmResultXml.firstChild.nodeType === 4) {
                    lo_data[key].data = llmResultXml.textContent;
                }

            }
            console.log(llmResultXml.tagName);

            build_xerte_xml(llmResultXml, llmResultXml.tagName, parser);

            //var children = x.children;
            var children = llmResultXml.childNodes;
            var size = children.length;
            // Add all populated children of top level object for example "quiz"
            // Or if nodes exist, update attributes of children
            //todo this should be a recursive function now only works for 1 level in tree.
            for (let i = 0; i < size; i++) {
                const child = children[i];
                // Try to get linkID, but if it's a non-element node, default to undefined
                const childLinkID = child.nodeType === Node.ELEMENT_NODE ? child.getAttribute('linkID') : undefined;

                // Try to find an existing child, but allow undefined
                const existingChild = childLinkID
                    ? Object.values(lo_data).find(node => node.attributes?.linkID === childLinkID)
                    : undefined;

                if (existingChild) {
                    // Node already exists, update its attributes selectively
                    const attributes = child.attributes;
                    for (let j = 0; j < attributes.length; j++) {
                        const attr = attributes[j];

                        // Update only attributes found in the new node
                        if (attr.value !== undefined) {
                            existingChild.attributes[attr.name] = attr.value;
                        }
                    }
                } else {
                    // Node does not exist, add it
                    addAINodeToTree(key, pos, child.tagName, child, tree, true, true);
                }
            }


            var node = tree.get_node(key, false);
            if (node) {
                // Refresh the node to reflect the updated attributes
                //tree.refresh_node(node);
                realParent.tree.showNodeData(node.id, true);
            }

            // Resolve targets for decision_tree children
            if (node.type === 'decision'){
                resolveDecisionTreeTargets(tree, key);
            }

            console.log("done!")
            alert("Make sure to check the generated results for mistakes!");
        } else if(result.status='error'){
            alert(result.message);
        } else {
            console.log(result.message);
        }
    }   catch (error) {
        console.log('Error:', error, 'Data:', data); //log the error for debugging
        throw error;
    }
}

//Used to resolve targets for decision tree, as the AI-generated XMLs don't have the link IDs necessary to achieve correct page-links
function resolveDecisionTreeTargets(tree, key) {
    const decisionTreeNode = tree.get_node(key, false);
    if (!decisionTreeNode) return;

    // Step 1: Build a map of 'name' to 'linkID' for all children (including nested)
    const nameToIdMap = {};

    function buildNameToIdMap(nodeId) {
        const node = tree.get_node(nodeId, false);
        const attributes = lo_data[nodeId]?.attributes;

        if (attributes && attributes.name && attributes.linkID) {
            nameToIdMap[attributes.name] = attributes.linkID;
        }

        // Recurse for all children
        if (node.children && node.children.length > 0) {
            node.children.forEach(childId => buildNameToIdMap(childId));
        }
    }

    // Start building the map from the decisionTreeNode
    buildNameToIdMap(key);

    // Step 2: Update `targetNew` attributes based on the map (including nested nodes)
    function updateTargetNewAttributes(nodeId) {
        const node = tree.get_node(nodeId, false);
        const attributes = lo_data[nodeId]?.attributes;

        if (attributes && attributes.targetNew && nameToIdMap[attributes.targetNew]) {
            attributes.targetNew = nameToIdMap[attributes.targetNew]; // Replace name with linkID
        }

        // Recurse for all children
        if (node.children && node.children.length > 0) {
            node.children.forEach(childId => updateTargetNewAttributes(childId));
        }
    }

    // Start updating from the decisionTreeNode
    updateTargetNewAttributes(key);

    console.log("Resolved targetNew attributes for decision_tree and all nested children.");
}

//cleaner function for prompts, removes unwanted sequences
function clean_prompt(prompt, api){
    //clean prompt
    if (api === "openai") {
        for (const param in prompt) {
            prompt[param] = prompt[param].replace(/(\r\n|\n|\r)/gm, "");
            prompt[param] = prompt[param].replace(/<\/?[^>]+(>|$)/g, "");
        }
    } else {
        //no api match
    }
    return prompt;
}

//handles ai api calls originated from users during xerte usage at runtime
function ai_request_runtime(prompt, type, api, callback){

    prompt = clean_prompt(prompt, api);

    $.ajax({
        url: "editor/openai/openAI.php",
        type: "POST",
        data: { type: type, prompt: prompt, api: api},
        success: function(data){
            var parser = new DOMParser();
            var result = JSON.parse(data);
            if (result.status == 'success') {
                var resultXml = parser.parseFromString(result["result"], "text/xml").children[0];
                callback(resultXml)
            } else {
                console.log(result.message);
            }
        },
    });
}