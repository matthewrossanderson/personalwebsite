(function() {
  $(document).ready(function() {
    $("#add_book").click(function() {
      return $("div#new").css("display", "block");
    });
    return $(".books").bind("ajax:success", function(xhr, data, status) {
      if (data.success === true) {
        return $("tr[data_book_id=book_" + data.book.id + "]").fadeOut("slow");
      }
    });
  });

}).call(this);
