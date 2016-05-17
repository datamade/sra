//These are just functions for importing things.

function reorderQuestions() {
    var newQuestionsOrder = [];
    var navData = RAT.Data.navData;
    var getQuestionFromID = RAT.Assessment.getQuestionFromID;
    for (var c = 0; c < navData.length; c++) {
        for (var a = 0; a < navData[c].Admin.length; a++) {
            console.log("getting data for question: " + navData[c].Admin[a])
            newQuestionsOrder.push(getQuestionFromID(navData[c].Admin[a]))
        }
        for (var a = 0; a < navData[c].Physical.length; a++) {
            newQuestionsOrder.push(getQuestionFromID(navData[c].Physical[a]))

        }
        for (var a = 0; a < navData[c].Tech.length; a++) {
            newQuestionsOrder.push(getQuestionFromID(navData[c].Tech[a]))

        }
    }
    console.log(JSON.stringify(newQuestionsOrder, null, 2));
}

function importGlossaryDate() {
    var glossData = {};
    $('#loader').load('GlossaryItems.html', function() {
        var tr = $('#loader').find('table').first().children('tbody').children('tr');

        for (var index = 0; index < tr.length; index++) {
            if (index == 0) continue; //get rid of the header row from our data
            var glossItem = {};
            var trChildren = $(tr[index]).children('td')
            for (var i = 0; i < trChildren.length; i++) {
                switch (i) {
                    case 0:
                        continue;
                    case 1:
                        glossItem.Term = $(trChildren[i]).find('span').html();
                        break;
                    case 2:
                        glossItem.Citation = $(trChildren[i]).find('span').html();
                        break;

                    case 3:
                        glossItem.Definition = $(trChildren[i]).find('span').html();
                        break;

                    case 4:
                        glossItem.Discussion = $(trChildren[i]).find('span').html();
                        break;
                }
            }
            console.log(glossItem);
            glossData[glossItem.Term.toLowerCase()] = (glossItem);
        }
        console.log(JSON.stringify(glossData, null, 2));

    });
}

function readCatagoryData() {
    $("#loader").load("crosswalk.html", function() {
        $("#loader").find("table").first().children("tbody").children("tr").each(function(index) {
            if (!index > 0) return;
            var rowData = {};
            $(this).children("td").each(function(index) {
                switch (index % 4) {
                    case 0:
                        console.log("Catagory: " + $(this).find("span").html())
                        rowData.Catagory = $(this).find("span").html().replace(/[^a-zA-Z0-9, ]/g, "");

                        break;
                    case 1:
                        console.log("Admin: " + $(this).find("span").html())
                        rowData.Admin = $(this).find("span").html().replace(/[^a-zA-Z0-9,]/g, "").split(",");
                        if (rowData.Admin[rowData.Admin.length - 1] == "") rowData.Admin.pop();
                        break;
                    case 2:
                        console.log("Tech: " + $(this).find("span").html())
                        rowData.Tech = $(this).find("span").html().replace(/[^a-zA-Z0-9,]/g, "").split(",");
                        if (rowData.Tech[rowData.Tech.length - 1] == "") rowData.Tech.pop();
                        break;
                    case 3:
                        console.log("Physical: " + $(this).find("span").html())
                        rowData.Physical = $(this).find("span").html().replace(/[^a-zA-Z0-9,]/g, "").split(",");
                        if (rowData.Physical[rowData.Physical.length - 1] == "") rowData.Physical.pop();

                        break;
                }
            });
            data.push(rowData);
        });
        console.log(JSON.stringify(data, null, 2));
    });
}

function readQuestionData() {
    function resolveIbid(currentIndex, currentValueIndex, currentqData) {
        while (pData[currentIndex][currentValueIndex].indexOf("ibid.") == 0) {
            currentIndex--;
        }
        currentqData[currentValueIndex] = pData[currentIndex][currentValueIndex];
    }
    var pData = [];
    var Pages = ["AdministrativeContent.html #tblMain", "PhysicalContent.html #tblMain", "TechnicalContent.html #tblMain"];
    var i = 0;
    LoadDataPage(Pages[i]);

    function LoadDataPage(pageName) {
        console.log(i);
        $("#loader").load(Pages[i], function() {
            $("#loader").find("table").children("tbody").children("tr").each(function(trindex) {

                if (trindex > 1) {
                    qindex = pData.length;
                    pData[qindex] = {};
                    $(this).children("td").each(function(index) {
                        if (index > 0) {
                            switch (index % 9) {
                                //question number
                                case 1:

                                    pData[qindex]["ID"] = $(this).html();

                                    break;
                                case 2:
                                    pData[qindex]["Citation"] = $(this).html();
                                    if (pData[qindex]["Citation"].indexOf("ibid.") == 0) {
                                        resolveIbid(qindex, "Citation", pData[qindex]);
                                    }
                                    break;
                                case 4:
                                    pData[qindex]["Type"] = $(this).html();
                                    if (pData[qindex]["Type"].indexOf("ibid.") == 0) {
                                        resolveIbid(qindex, "Type", pData[qindex]);
                                    }
                                    switch (pData[qindex]["Type"]) {
                                        case "S":
                                            pData[qindex]["Type"] = "Standard";
                                            break;
                                        case "R":
                                            pData[qindex]["Type"] = "Required";
                                            break;
                                        case "A":
                                            pData[qindex]["Type"] = "Addressable";
                                            break;
                                    }

                                    break;
                                case 5:
                                    pData[qindex]["Question"] = $(this).html();

                                    break;
                                case 6:
                                    pData[qindex]["ThingsToConsider"] = $(this).html();

                                    break;
                                case 7:
                                    pData[qindex]["Threats"] = $(this).html();

                                    break;
                                case 8:
                                    pData[qindex]["Safeguards"] = $(this).html();

                                    break;
                            }
                        }
                    });

                }
            });
            i++;
            if (Pages[i]) {
                LoadDataPage(Pages[i]);
            } else {
                console.log(JSON.stringify(pData, null, 2));
                return;
            }
        });
    }

};