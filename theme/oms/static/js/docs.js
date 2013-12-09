
// This script should be included at the END of the document. 
// For the fastest loading it does not inlude $(document).ready()

// This Document contains a few helper functions for the documentation to display the current version,
// collapse and expand the menu etc.

function prepend_icon(selector, icon_name) {
    /*
     Insert a Font Awesome icon followed by a space BEFORE some HTML content.
     selector: jQuery selector that match content to change.
     icon_name: Font Awesome icon name (excluding the icon- prefix).
     */
    var node = $(selector);
    node.html('<i class="icon-' + icon_name + '"></i>&nbsp;' + node.html());
}

$(function(){
    $('.toctree-l1 .current').parent().addClass('open');
    $('.toctree-l1').not('.current').children('ul').hide();

    // add class to all those which have children
    $('.sidebar > ul > li').not(':last').not(':first').addClass('has-children');
    $('table').addClass('table table-bordered table-hover');

    $('.sidebar ul > li.toctree-l1.has-children > ul').before(
        '<a class="trigger-collapse" href="#" data-toggle="tooltip" data-placement="left" title="sub-menu"><i class="icon-angle-right"></i></a>'
    );
    $('.trigger-collapse').tooltip();

    $('.sidebar > ul > li.toctree-l1.has-children').click(function(){
        var li = $(this);
        if(li.hasClass('open')){
            li.children('ul').slideUp(200, function() {
                li.removeClass('open');
            });
        } else {
            setTimeout(function() {
                li.addClass('open'); // toggle before effect
                li.children('ul').hide();
                li.children('ul').slideDown(200);
            }, 100);
        }
    });

    if (doc_version == "") {
        $('.version-flyer ul').html('<li class="alternative active-slug"><a href="" title="Switch to local">Local</a></li>');
    }

    // mark the active documentation in the version widget
    $(".version-flyer a:contains('" + doc_version + "')").parent().addClass('active-slug');

    prepend_icon('.note > .first', 'pushpin');
    prepend_icon('.warning > .first', 'ban-circle');
    prepend_icon('.danger > .first', 'ban-circle');
    prepend_icon('.seealso > .first', 'eye-open');
    prepend_icon('.todo > .first', 'check');
});



