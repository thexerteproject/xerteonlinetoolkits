// Re-format the main content as wish to remove the standard navigation area

$('#contentTable').removeClass('span3');
$('#contentTable').hide();
$('#mainContent').removeClass('span9').addClass('span12');

setTimeout(function() {

// Remove the Back to Top link
    $('a:contains("Top")').remove();

// START Auto Generate next and previous buttons

    var section_array = new Array();

    $('#toc li').each(function(data){
        section_array.push($('a', this).attr('href'));
    });

    var number_of_sections = section_array.length;

    var current_page_element = 0;
    $('section').each(function(data){
        current_page_element = section_array.indexOf('#' + $(this).attr('id'));

        if(number_of_sections > 1){
            // there is more than one section
            if(current_page_element == 0){
                // first section
                $('.page-header', this).after('<p class="text-right page_nav active"><a href="'+ section_array[(current_page_element + 1)] +'" class="btn btn-success shs_nav_btn"><i class="icon-arrow-right icon-white"></i></a></p>');

                $(this).append('<p class="text-right page_nav active page_nav_base"><a href="'+ section_array[(current_page_element + 1)] +'" class="btn btn-success shs_nav_btn"><i class="icon-arrow-right icon-white"></i></a></p><p class="text_center"><a class="btn btn-info" href="#"><i class="icon-arrow-up icon-white"></i> </a></p>');

            }else if((current_page_element + 1 ) == number_of_sections  ){
                // last section
                $('.page-header', this).after('<p class="text-right page_nav active"><a href="'+ section_array[ (current_page_element - 1)] +'" class="btn btn-primary shs_nav_btn"><i class="icon-arrow-left icon-white"></i></i></a> <a href="'+ section_array[0] +'" class="btn btn-warning shs_nav_btn"><i class="icon-repeat icon-white"></i></a></p>');

                $(this).append('<p class="text-right page_nav active page_nav_base"><a href="'+ section_array[ (current_page_element - 1)] +'" class="btn btn-primary shs_nav_btn"><i class="icon-arrow-left icon-white"></i></i></a> <a href="'+ section_array[0] +'" class="btn btn-warning shs_nav_btn"><i class="icon-repeat icon-white"></i></a></p><p class="text_center"><a class="btn btn-info" href="#"><i class="icon-arrow-up icon-white"></i> </a></p>');

            }else{
                $('.page-header', this).after('<p class="text-right page_nav active"><a href="'+ section_array[(current_page_element - 1)] +'" class="btn btn-primary shs_nav_btn"><i class="icon-arrow-left icon-white"></i></i></a> <a href="'+ section_array[ (current_page_element + 1)] +'" class="btn btn-success shs_nav_btn"><i class="icon-arrow-right icon-white"></i></a></p>');

                $(this).append('<p class="text-right page_nav active page_nav_base"><a href="'+ section_array[(current_page_element - 1)] +'" class="btn btn-primary shs_nav_btn"><i class="icon-arrow-left icon-white"></i></i></a> <a href="'+ section_array[ (current_page_element + 1)] +'" class="btn btn-success shs_nav_btn"><i class="icon-arrow-right icon-white"></i></a></p><p class="text_center"><a class="btn btn-info" href="#"><i class="icon-arrow-up icon-white"></i> </a></p>');

            }

        }


    });


// END Auto Generate next and previous buttons


// START display tools panel

    $('#overview').after('<div id="tools"><div id="features" class=""><div class="nav-pills"> <a href="#" id="decrease_txt" class="btn btn-info btn-sm">Text Size <i class="icon-minus-sign icon-white"></i></a> <a href="#" id="increase_txt" class="btn btn-info btn-sm">Text Size <i class="icon-plus-sign icon-white"></i></a> </div></div><div id="tools_btn_container"><a href="#" class="" id="tools_btn">Tools <i class="icon-chevron-down icon-white"></i></a></div></div>');


    $('#features').hide();

    $('#tools_btn').click(function(){
        $('#features').slideToggle( "slow", function(){
            if($(this).is(':visible')){
                $('#tools_btn').html('Tools <i class="icon-chevron-up icon-white"></i>');
            }else{
                $('#tools_btn').html('Tools <i class="icon-chevron-down icon-white"></i>');
            }
        });
        return(false);
    });

    /*$('#close_btn').click(function(){
        $('#features').slideToggle( "slow", function(){
                //$('#tools_btn').show('slow');
            });
        return(false);
    });*/

    $('#show-hide-text').click(function(){
        $('#av-component').removeClass('col-md-12').addClass('col-md-6');
        $('#text-component').toggle('slow',function(){
            if($(this).is(':visible')){
                $('#show-hide-text').html('<span class="glyphicon glyphicon-eye-close"></span> Hide Supporting Text');
                //$('#av-component').toggleClass('col-md-6 col-md-12');
                localStorage.removeItem("hide_text");
            }else{
                $('#show-hide-text').html('<span class="glyphicon glyphicon-eye-open"></span> Show Supporting Text');
                $('#av-component').toggleClass('col-md-6 col-md-12');
                localStorage["hide_text"] = 'hide';
            }


        });
        //$('#av-component').toggleClass('col-md-6 col-md-12');



        return(false);

    });
    var increment = 5;

    $('#increase_txt').click(function(){
        localStorage["text_size"] = ((localStorage["text_size"]* 1) + increment);
        $('body').css('font-size',localStorage["text_size"]+'px');
        // alert ( localStorage["text_size"]);
        return(false);

    });
    $('#decrease_txt').click(function(){
        localStorage["text_size"] = ((localStorage["text_size"]* 1) - increment);
        $('body').css('font-size',localStorage["text_size"]+'px');
        // alert ( localStorage["text_size"]);
        return(false);
    });

    // begin web storage of data
    if (localStorage["hide_text"] == null) {
        // test is being displayed
        //alert ("text being revealed");
    }else{
        //text is being hidden
        //alert ("text being hidden");

        $('#show-hide-text').html('<span class="glyphicon glyphicon-eye-open"></span> Show Textural Content');
        $('#text-component').hide();
        $('#av-component').removeClass('col-md-6').addClass('col-md-12');

    }
    if(localStorage["text_size"] == null){

        localStorage["text_size"] = 14;

    }else{

        var txt_size = localStorage["text_size"] * 1;
        $('body').css('font-size',txt_size+'px');
    }

// END display tools panel


// Grab the navigation content and write to the page
    var toc = $('#toc').html();
    var dropdown_toc = '<div class="container" id="book_nav"><div class="btn-group"><button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown"><i class="icon-book icon-white"></i> Contents <span class="caret"></span></button><ul class="dropdown-menu" role="menu" id="dropdown_toc">'+ toc +'</ul></div></div>';
    $('#tools').after(dropdown_toc);

// Hide the last nav element (this is the code contents
    //$('#dropdown_toc li:last-child').hide();

// Set current page to first page
    var current_page = '#page1section1';

// Set the current page to the active state in the drop down navigation
    $('a[href$="'+ current_page +'"]').parent().addClass('active');


    $('#page1section1').show();


// Handle navigation clicks
    var intented_page_target;
    $('.shs_nav_btn, #dropdown_toc a').click(function(event){
        event.preventDefault();
        intented_page_target = $(this).attr('href');
        $(current_page).hide();
        $(intented_page_target).show();

// send to top of page (function for long pages on small screens)
        location.href = "#overview";

        current_page = intented_page_target;


// Ensure the navigation active states are applied appropriately
        $('#dropdown_toc a').parent().removeClass('active');
        $('a[href$="'+ current_page +'"]').parent().addClass('active');



    });


}, 300);