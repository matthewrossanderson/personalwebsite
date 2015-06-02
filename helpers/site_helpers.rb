module SiteHelpers

  def page_title
    title = "MRA"
    if data.page.title
      title << " | " + data.page.title
    end
    title
  end
  
  def page_description
    data.page.description ||= "Matthew Ross Anderson"
  end

end