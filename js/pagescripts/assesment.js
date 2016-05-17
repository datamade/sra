$(document).ready(function() {
    RAT.Assessment.calculateCompletion();
    $("#prev-button").click(function() {
        if (RAT.Assessment.currentQuestion > 0) {
            $('.ui-tooltip').remove();
            $('#prev-button').show();
            RAT.Assessment.currentQuestion--;
            RAT.Assessment.loadQuestion();
        }
    });
    $("#next-button").click(function() {
        if (RAT.Assessment.currentQuestion < RAT.Data.qData.length - 1) {
            $('.ui-tooltip').remove();

            RAT.Assessment.currentQuestion++;
            RAT.Assessment.loadQuestion();
        }
    });
    RAT.Utils.rightPanelLoadContent('html/relatedinformation.html', function() {
        RAT.Assessment.loadQuestion();
    });
    RAT.Assessment.showRelatedInfo();
});