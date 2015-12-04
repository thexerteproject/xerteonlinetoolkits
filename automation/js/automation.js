doShare = function()
{
    doAction("Share");
}

doUnshare = function()
{
    doAction("Unshare");
}

doAction = function(action)
{
    $.ajax(
        {
            method: "POST",
            url: "doshare.php",
            data: { action: action,
                    group: $("#group").val(),
                    template: $("#template").val(),
                    readonly: $("#readonly").prop('checked')
            }
        })
        .done(function( msg ) {
            $("#result").html(msg);
        });
}

clearResult = function()
{
    // Clear message
    $("#result").html("");
}


updateGroupList = function()
{
    var courseid = $("#course").val();
    var select = $("<select>")
        .attr("id", "group")
        .attr("name", "group");

    // Clear message
    $("#result").html("");

    var selectedCourse = null;
    for (var courseidx in courses)
    {
        var course = courses[courseidx];
        if (course['courseid'] == courseid)
        {
            selectedCourse = course;
        }
    }
    if (selectedCourse != null)
    {
        for (var groupidx in selectedCourse['groups'])
        {
            var group = selectedCourse['groups'][groupidx]
            var option=$('<option>')
                .attr("value", group['id'])
                .append(group['name'])
            select.append(option);
        }
    }
    $('#groupDiv').html(select);
}