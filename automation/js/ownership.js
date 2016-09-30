
doChangeOwner = function(action)
{
    var templatefolders = $('#shared_templatefolders').val();

    $.ajax(
        {
            method: "POST",
            url: "changeowner.php",
            data: {
                group: $("#group").val(),
                course: $("#course").val(),
                orgtemplate: $("#template").val(),
                templatefolders: templatefolders,
                newowner: $('#new_owner').val()
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

updateGroupList = function(clear)
{
    var courseid = $("#course").val();
    var select = $("#group");
    $("#group option").remove();

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
    changeSelection(clear);
}

changeSelection = function(clear)
{
    $.ajax(
        {
            method: "POST",
            url: "getsharedtemplates.php",
            data: {
                group: $("#group").val(),
                course: $("#course").val(),
                template: $("#template").val(),
                //readonly: $("#readonly").prop('checked'),
                //unshare_teachers: $("#unshare_teachers").prop('checked'),
                //practice: $("#practice").prop('checked'),
                //attempt: $("#attempt").val()
            },
            dataType: "text"
        })
        .done(function( msg ) {
            var sharedTemplateFolders = JSON.parse(msg);

            var folder_select = $('#shared_templatefolders');
            //Clear select
            $('#shared_templatefolders option').remove();
            for (var i in sharedTemplateFolders['shared_templatefolders'])
            {
                var folder = sharedTemplateFolders['shared_templatefolders'][i];
                var id = folder['id'];
                var teacher_id = folder['user_id'];
                var teacher_name = folder['firstname'] + ' ' + folder['surname']  + ' (' + folder['username'] + ')';
                var folder_name = folder['group_name'];

                var option=$('<option>')
                    .attr("value", id)
                    .append(id + ' | ' + teacher_name + ' | ' +  folder_name);
                folder_select.append(option);
            }
            var teacher_select = $('#new_owner');
            // Clear select
            $('#new_owner option').remove();
            for (var i in sharedTemplateFolders['teachers'])
            {
                var teacher = sharedTemplateFolders['teachers'][i];
                var teacher_name = teacher['firstname'] + " " + teacher['lastname'];
                var teacher_username = teacher['username'];

                var option = $('<option>')
                    .attr("value", teacher_username)
                    .append(teacher_name + ' (' + teacher_username + ')');
                teacher_select.append(option);
            }
        });
    if (clear)
        clearResult();
}

clearTeacherList = function()
{

}