
function build_xerte_xml(xml_tree, parent_name, parser)
{
    //if not root we combine basic with openai
    if (xml_tree.tagName !== parent_name) {
        var index = wizard_data[parent_name].new_nodes.indexOf(xml_tree.tagName);
        var basic_xml = parser.parseFromString(wizard_data[parent_name].new_nodes_defaults[index], "text/xml").children[0];

        for (var i = 0; i < basic_xml.attributes.length; i++){
            var attr = basic_xml.attributes[i];
            if (xml_tree.getAttribute(attr.name) == null) {
                xml_tree.setAttribute(attr.name, attr.value)
            }
        }
    }
    //recursively do this for all children
    if (xml_tree.hasChildNodes()) {
        var children = xml_tree.children;
        for (let i = 0; i < children.length; i++) {
            build_xerte_xml(children[i], xml_tree.tagName, parser);
        }
    }

}

function generic_content_creator(data, key, pos, tree) {
    $('body').css("cursor", "default");
    var parser = new DOMParser();
    var result = JSON.parse(data);
    if (result.status == 'success') {

        var x = parser.parseFromString(result["result"], "text/xml").children[0];
        console.log(x);

        //merge xerte object root with ai result at root level.
        for (var i = 0; i < x.attributes.length; i++) {
            var attr = foo.attributes[i];
            //TODO change lo_data[key].attributes get key from toolbox
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
}

function openai_request_runtime(prompt, type, callback){
    //clean prompt
    for (const param in prompt) {
        prompt[param] = prompt[param].replace(/(\r\n|\n|\r)/gm, "");
        prompt[param] = prompt[param].replace(/<\/?[^>]+(>|$)/g, "");
    }

    $.ajax({
        url: "editor/openai/openAI.php",
        type: "POST",
        data: { type: type, prompt: prompt},
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