// Sections JS

var current_section = gon.current_section,
    initial_section = gon.current_section,
    scrolled = false,
    book_id = gon.current_book;

$(document).ready(function(){

  //when the document is loaded
  //if it's the first section, load up the first section, and the next section
  //if it's another section, load up the section, the next section and the previous section

  // JQuery Waypoints documentation here:
  // http://imakewebthings.com/jquery-waypoints

  //register a waypoint: 
  //  when the top of the section is reached, 
  //  when scrolling downwards, 
  //    set the current_section ++ (or section-number html attribute if present),
  //    update section number display
  //    load the following section
  //    register this waypoint on that section
  //    if the sections length > 3, 
  //      pop the first
  //    $.waypoints('refresh');

  //  when scrolling upwards,
  //    set current_section -- (or section-number html attribute if present)
  //    update section number display
  //    load the previous section
  //    register this waypoint on that section
  //    if the sections length > 3, 
  //      pop the last
  //    $.waypoints('refresh');

  $('#toc-toggle').sidr({
    name: 'toc',
    source: '#toc'
  });

  if (current_section == 1) {
    //get the first section, delete the waypoint from it
    request = getSection(current_section).done(function(data) { 
      appendSection(data, 'delete'); 
      updateSectionDisplay();
    });
    //after the first section is done, get the second section
    request.done(function(data) { 
      getSection(current_section + 1).done(function(data) { 
        appendSection(data); 
      });
    });

    // after the second section is done, get the third section
    request.done(function(data) {
      getSection(current_section + 2).done(function(data) { 
        appendSection(data); 
      });
    });
  }

  else {
    //load the desired section, then prepend and append the sections around it
    //get the first section, disable the waypoint
    request = getSection(current_section).done(function(data) { 
      appendSection(data, 'disable');
      updateSectionDisplay();
    });
    // after the current section is done, get the previous section and scroll down
    request.done(function(data) {
      getSection(current_section - 1).done(function(data) { 
        prependSection(data); 
      });
    });

    //after the previous section is done, get the next section
    request.done(function(data) { 
      getSection(current_section + 1).done(function(data) { 
        appendSection(data); 
      });
    });
  }
});

waypointHandler = function(direction) {
  //  when scrolling downwards, 
  //    set the current_section ++ (or section-number html attribute if present),
  //    update section number display
  //    load the following section
  //    register this waypoint on that section
  //    if the sections length > 3, 
  //      pop the first
  //    $.waypoints('refresh');

  // return the first waypoint, because we shouldn't do anything
  if (direction == 'down') {
    // enableAllWaypoints();
    current_section += 1;
    console.log('reached top of section ' + (current_section) + ' downwards');
    updateSectionDisplay();
    if ((current_section + 1) > 3) {
      getSection(current_section + 1).done(function(data) {
        appendSection(data);
        popFirstSection();
      }); 
    }
  }

  //  when scrolling upwards,
  //    set current_section -- (or section-number html attribute if present)
  //    update section number display
  //    load the previous section
  //    register this waypoint on that section
  //    if the sections length > 3, 
  //      pop the last
  //    $.waypoints('refresh');

  else if (direction == 'up') {
    enableAllWaypoints();
    console.log('reached top of section ' + (current_section ) + ' upwards');
    if (current_section > 1) {
      current_section -= 1;
    }
    updateSectionDisplay();
    if (current_section > 1) {
      prependSection(current_section - 1);
    }
  }

};
getSection = function(section) {
  console.log("getting section " + section);
  return $.ajax({
    url: '/books/' + book_id + '/sections/' + section,
    type: 'get',
    dataType: 'json',
    async: true
  });
 };

appendSection = function(data, waypoint) {
  if (data !== null && data !== undefined) {
    $('.sections').append(data.html);
  }
  if (waypoint !== 'delete') {
    $('.sections section').last().waypoint({
      handler: function(direction) { waypointHandler(direction); },
      offset: 0
    });
    if (waypoint == 'disable') {
      $('.sections section').last().waypoint('disable');
    }
  }
};

popFirstSection = function() { 
  if ($('.sections section').length > 3){
    $('.sections section').first().remove();
    console.log('removing section ' + (current_section - 3))
    // console.log('sections visible:' + $('.sections section').length);
  }
};

prependSection = function(data, waypoint) {
  if (data !== null && data !== undefined) {
    var currOffset = $('.sections section').first().offset().top - $(document).scrollTop();
    console.log($('.sections section').first().offset().top);
    $('.sections').prepend(data.html);
    console.log($('.sections section').eq(1).offset().top);
    // console.log($(document.scrollTop));
    // $(document).scrollTop($('.sections section').eq(1).offset().top-currOffset);
  }
  if (waypoint !== 'delete') {
    $('.sections section').first().waypoint({
      handler: function(direction) { waypointHandler(direction); },
      offset: 0
    });
    if (waypoint == 'disable') {
      $('.sections section').first().waypoint('disable');
    }
  }
};

popLastSection = function() { 
  // console.log($('.sections section').length);
  if ($('.sections section').length > 3){
    $('.sections section').last().remove();
    console.log('removing section ' + (current_section + 3))
    // console.log('sections visible:' + $('.sections section').length);
  }
};

enableAllWaypoints = function() {
  console.log('enabling waypoints');
  $('.sections section').each(function(){ 
    $(this).waypoint('enable');
  });
}

updateSectionDisplay = function(){
  $('#section').css('display', 'inline');
  $('#section-heading').css('display', 'inline');
  $('#section-number').html(current_section);
  // history.pushState(null, null, current_section)
};

