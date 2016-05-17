$(document).ready(function() {

    $("#practice-catagories").children('ul').children("li").each(function(index) {
        $(this).click(function() {
            // console.log(RAT.ingo.currentPage)
            RAT.Info.closeCurrentPage();
            RAT.Info.gotoPage($(this).attr('id'));
        });
    });

    //if(RAT.practiceInfomation.about.name == "")
    RAT.Info.gotoPage("users");
});