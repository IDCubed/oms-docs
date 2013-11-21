
// This script should be included at the END of the document. 
// For the fastest loading it does not inlude $(document).ready()

// This Document contains a few helper functions for the documentation to display the current version,
// collapse and expand the menu etc.


// Function to make the sticky header possible
function shiftWindow() { 
    scrollBy(0, -70);
    console.log("window shifted")
}

window.addEventListener("hashchange", shiftWindow);

function loadShift() {
    if (window.location.hash) {
        console.log("window has hash");
        shiftWindow();
    }
}

function prepend_icon(selector, icon_name) {
    /*
     Insert a Font Awesome icon followed by a space BEFORE some HTML content.
     selector: jQuery selector that match content to change.
     icon_name: Font Awesome icon name (excluding the icon- prefix).
     */
    var node = $(selector);
    node.html('<i class="icon-' + icon_name + '"></i>&nbsp;' + node.html());
}

$(window).load(function() {
    loadShift();
});

$(function(){
    // define an array to which all opened items should be added
    var openmenus = [];

    var elements = $('.toctree-l2');
    // for (var i = 0; i < elements.length; i += 1) { var current = $(elements[i]); current.children('ul').hide();}


    // set initial collapsed state
    var elements = $('.toctree-l1');
    for (var i = 0; i < elements.length; i += 1) {
        var current = $(elements[i]);
        if (current.hasClass('current')) {
            current.addClass('open');
            currentlink = current.children('a');
            openmenus.push(currentlink);

            // do nothing
        } else {
            // collapse children
            current.children('ul').hide();
        }
    }

    if (doc_version == "") {
        $('.version-flyer ul').html('<li class="alternative active-slug"><a href="" title="Switch to local">Local</a></li>');
    }

    // mark the active documentation in the version widget
    $(".version-flyer a:contains('" + doc_version + "')").parent().addClass('active-slug');

    // add class to all those which have children
    $('.sidebar > ul > li').not(':last').not(':first').addClass('has-children');
    $('table').addClass('table table-bordered table-hover');

    prepend_icon('.note > .first', 'pushpin');
    prepend_icon('.warning > .first', 'ban-circle');
    prepend_icon('.danger > .first', 'ban-circle');
    prepend_icon('.seealso > .first', 'eye-open');
    prepend_icon('.todo > .first', 'check');

// attached handler on click
    // Do not attach to first element or last (intro, faq) so that
    // first and last link directly instead of accordian

    $('.sidebar > ul > li > a').not(':last').not(':first').click(function(){
        var index = $.inArray(this.href, openmenus)
        if (index > -1) {
            openmenus.splice(index, 1);
            $(this).parent().children('ul').slideUp(200, function() {
                $(this).parent().removeClass('open'); // toggle after effect
            });
        }
        else {
            openmenus.push(this.href);

            var current = $(this);

            setTimeout(function() {
                // $('.sidebar > ul > li').removeClass('current');
                current.parent().addClass('current').addClass('open'); // toggle before effect
                current.parent().children('ul').hide();
                current.parent().children('ul').slideDown(200);
            }, 100);
        }
        return false;
    });
})



