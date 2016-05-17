//TODO:
//Fix the legend for the charts on reporting
//Add in associates, assets, and users to the report,






///////////////////
//Namespaces
///////////////////
RAT = {};
RAT.Data = {};
RAT.Reporting = {};
RAT.Reporting.Dialogs = {};
RAT.Utils = {};
RAT.Assessment = {};
RAT.Charts = {};
RAT.Nav = {};
RAT.Panels = {};
RAT.Info = {};
///////////////////
//RAT Variables
///////////////////
RAT.practiceInfomation = {
    about: {
        name: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: 00000,
        phonenumber: 5555551234
    },
    associates: [{
        name: "",
        type: "",
        address: ""
    }],
    assetinventory: [{
        assetid: "",
        description: "",
        hasephi: "",
        responsibleparty: "",
    }],
    users: [{
        firstname: "",
        lastname: "",
        login: "",
        // password:"",
    }],
    answers: [],
}
RAT.currentUser = null;
RAT.glossDictionary = {};
RAT.data = [];
//TODO make this more resiliant
RAT.Platform = navigator.platform.indexOf('Mac') !== -1 || navigator.platform.indexOf('Win') !== -1 ? "desktop" : "mobile";
RAT.Loader = $("#loader");

RAT.Initialize = function() {
    // if (!RAT.Utils.isDesktop()) {
    //     RAT.Utils.snapshot = cordova.require('org.dscape.snapshot.Snapshot');
    // }
    RAT.Data.loadData();
    RAT.Panels.loadWelcome();
    RAT.Utils.showHidePlatformElements();
}
////////////////////////
//UTILS
////////////////////////
RAT.Utils.openExternalLink = function(link) {
    console.log('going to: ' + link);
    if (RAT.Utils.isDesktop()) {
        var gui = require('nw.gui');
        gui.Shell.openExternal(encodeURI(link));
    } else {
        window.open(encodeURI(link), "_system");
    }
    return false;
}
RAT.Utils.isDesktop = function() {
    return RAT.Platform === 'desktop';
}

RAT.Utils.chooseFile = function(name, callback) {
    var chooser = $(name);
    chooser.change(function(evt) {
        callback(evt, this);
    });
    chooser.trigger('click');
}

/* data table model{
  sSelector:"Stuff",
  asTableHeadings:[
  {
      sTitle:"Column tittle",
      mData:dataName
  }
  ],
  aoTAbleData:[{}]
}
*/

RAT.Utils.createTableFromJSON = function(oDatatable, sDom, scrollY) {

    if (!sDom) sDom = 'C<"clear">lfrtip';
    if (scrollY == undefined) scrollY = '425px';
    var colData = [];
    for (var k in oDatatable.asTableHeadings) {
        var data = oDatatable.asTableHeadings[k];
        colData.push({
            "sTitle": data.sTitle,
            "mData": data.mData,
            "mRender": data.mRender,
            "bSearchable": true
        });
    }

    var tbl = $(oDatatable.sSelector).dataTable({
        "sDom": sDom,
        "mData": oDatatable.aoTableData,
        "aoColumns": colData,
        "bAutoWidth": false,
        "oLanguage": {
            "sSearch": "Search all Columns:"
        },
        "oFeatures": {},
        "bPaginate": false,
        "sScrollY": scrollY
    });
    tbl.fnAddData(oDatatable.aoTableData);
    return tbl;
}

RAT.Utils.formatPhoneNumber = function(s) {
    var s2 = ("" + s).replace(/\D/g, '');
    var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
}

RAT.Utils.leftPanelLoadContent = function(filePath, callback) {
    $("#right-panel").css("display", "inline");
    $("#left-panel").css("display", "inline");
    $("#full-panel").css("display", "none");
    $("#left-panel").load(filePath, callback);
}

RAT.Utils.loadFullScreenContent = function(filePath, callback) {
    $("#right-panel").css("display", "none");
    $("#left-panel").css("display", "none");
    $("#full-panel").css("display", "block");
    $("#full-panel").load(filePath, callback);
}

RAT.Utils.loadFloatingPanelContent = function(filePath, callback) {
    $("#floating-panel").css("display", "inline-block");
    $("#floating-panel-content").load(filePath, callback);
}

RAT.Utils.rightPanelLoadContent = function(filePath, callback) {
    $("#right-panel").css("display", "inline");
    $("#left-panel").css("display", "inline");
    $("#full-panel").css("display", "none");
    $("#right-panel").load(filePath, callback);
}

RAT.Utils.closeFloatingPanel = function() {
    $("#floating-panel").css("display", "none");
    $("#floating-panel-content").html("");
}


RAT.Utils.capture = function(fileName, filePath, data) {

    if (RAT.Utils.isDesktop()) {
        RAT.Utils.captureDesktop(fileName, filePath, data);
    } else {
        //TODO add in printing for ios
        RAT.Utils.captureMobile(fileName, filePath, data);
    }
}

RAT.Utils.captureDesktop = function(fileName, filePath, data) {

    var fs = require('fs'),
        childProcess = require('child_process');
    var path = process.cwd();
    var fullPath = filePath + '/' + fileName + '.pdf';

    fs.exists(fullPath, function(exists) {

        if (exists) fs.unlinkSync(fullPath);
        if (!fs.existsSync('report')) {
            fs.mkdirSync('report');
        }

        fs.writeFile("report/report.html", data, function(err) {

            if (err) {
                fs.unlink("report/report.html");
                return;
            }
            var capture = require('capture');
            var phanbin = require('phantomjs').path;
            capture(['report/report.html'], {
                'format': 'pdf',
                'phantomBin': phanbin,
                'out': filePath,
                'paperFormat': 'letter',
                'paperOrientation': 'landscape',
                "fileName": fileName,
            }, function() {
                RAT.Reporting.showReport();
                $("#loader").html('');
            });
            // var scriptPath = path + '/js/vendor/capture.js';
            // args = [scriptPath, 'file://' + path + '/report/report.html', fullPath,
            //     '--paper-orientation', 'landscape', '--paper-margin', '0mm',
            //     '--paper-format', 'letter', '--viewport-height', 780, '--viewport-width', 1024
            // ]

            // childProcess.execFile(require('phantomjs').path, args, function(err, stdout, stderr) {

            //     if (err) {
            //         alert("There was an error exporting the report");
            //         console.log(err)
            //     } else {
            //         $("#loader").html('');
            //         RAT.Reporting.showReport();
            //     }
            // });
        });
    });
}

RAT.Utils.captureMobile = function(fileName, filePath, data) {
    //RAT.Utils.printPDF(data);

    if (device.major_version < 7) {
        var filePath = '';

        function gotFS(fs) {
            console.log("Got file system");
            fs.root.getFile("report.html", {
                create: true,
                exclusive: false
            }, gotFile, fail)
        }

        function gotFile(file) {
            console.log("Got file");
            filePath = file.fullPath
            console.log(file.fullPath);
            file.createWriter(gotWriter, fail);
        }

        function gotWriter(writer) {
            console.log("Got Writer")
            writer.onwriteend = function() {
                //alert("report created");
                window.open(filePath, "_blank");
                $('#loader').html('');
            }
            writer.write(data);
        }

        function fail(err) {
            console.log(err)
            alert(err.code)
            $('#loader').html('');
        };
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail)

    } else {
        RAT.Utils.printPDF(data);
    }
}
RAT.Utils.printPDF = function(data) {
    window.plugin.printer.isServiceAvailable(function(isAvailable) {
        //alert(isAvailable ? 'Service is available' : 'Service NOT available');
        if (isAvailable) {
            window.plugin.printer.print(data)
            $('#loader').html('');
        } else {
            alert("this feature is unavailable");
        }
    });
}

RAT.Utils.getImageDataURL = function(url, success, error) {
    var data, canvas, ctx;
    var img = new Image();
    img.onload = function() {
        // Create the canvas element.
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        // Get '2d' context and draw the image.
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // Get canvas data URL
        try {
            data = canvas.toDataURL();
            success({
                image: img,
                data: data
            });
        } catch (e) {
            error(e);
        }
    }
    // Load image URL.
    try {
        img.src = url;
    } catch (e) {
        error(e);
    }
}

RAT.Utils.showHidePlatformElements = function() {
    if (RAT.Utils.isDesktop()) {
        $('.desktop-hide').hide();
        $('.mobile-hide').show();
    } else {
        $('.mobile-hide').hide();
        $('.desktop-hide').show();
    }
}

////////////////////////
//Reporting
////////////////////////
//TODO: Safe for mobile
RAT.Reporting.showReport = function() {
    if (RAT.Utils.isDesktop()) {
        var gui = require('nw.gui');
        gui.Window.open('report/report.html', {
            "show": true
        });
    }
}

RAT.Reporting.generateReportTable = function() {
    var tableData = "";

    $("#loader").html("");
    // $("#loader").css("width",'12.75in !important')
    var entries = _.filter(RAT.practiceInfomation.answers, function(answer) {
        return !answer.isPlaceHolder;
    });
    var tables = [];
    for (var i = 0; i < entries.length;) {
        var MAX_TABLE_HEIGHT = 850;
        //create the table with the first entry
        $("#loader").append("<div class='page'><table id='reportTable" + i + "' class='reportTable'></table></div>");
        var data = [entries[i]];
        var tbl = RAT.Reporting.createReportTable(data, "#reportTable" + i);
        console.log(tbl);
        var dataTable = RAT.Utils.createTableFromJSON(tbl, '<"clear">lt', "890px");
        tables.push(dataTable);
        i++;
        //now we append elements to the table until we overflow
        while ($(dataTable)[0].offsetHeight < MAX_TABLE_HEIGHT) {
            //console.log($(dataTable)[0].offsetHeight)
            if (entries[i]) {
                //store the new objects index incase we need to roll back
                var newIndex = $(dataTable).dataTable().fnAddData(entries[i])[0];
                i++;
                $(dataTable).dataTable().fnDraw();

                if ($(dataTable)[0].offsetHeight > MAX_TABLE_HEIGHT) {
                    //roll back one
                    $(dataTable).dataTable().fnDeleteRow(newIndex);
                    $(dataTable).dataTable().fnDraw();
                    i--;
                    break;
                }
            } else {
                //nothing else to append so we are done
                break;
            }
        }
    }
    return $("#loader").html();
}

RAT.Reporting.exportPDF = function(fileName, filePath) {
    //build report
    $.get("html/report-template.html", function(data) {
        console.log("loaded report template")
        //var fileName = "HHS_Report-"+moment().format('M-D-YYYY');
        var reportData = templtr.getTemplate("reportTemplate")({
            data: RAT.practiceInfomation,
            formatPhoneNumber: RAT.Utils.formatPhoneNumber
        });
        var reportPage = data.replace("<%content%>", reportData);

        $('#loader').load("html/charts.html", function(chartData) {

            window.setTimeout(function() {
                //convert canvas elements to static images
                $('#loader canvas').each(function() {
                    $(this).attr("src", $(this)[0].toDataURL("image/png"));
                    $(this).changeElementType("img");
                });
                reportPage = reportPage.replace("<$charts$>", $("#chart-wrapper").html());
                reportPage = reportPage.replace("<%tables%>", RAT.Reporting.generateReportTable());
                reportPage = reportPage.replace("<$practiceinfo$>", RAT.Reporting.generatePracticeInfo());
                if (!RAT.Utils.isDesktop()) {
                    reportPage = reportPage.replace(/class="page"/g, 'class="page mobile"')
                }

                RAT.Utils.capture(fileName, filePath, reportPage);

            }, 4000)
        });
    });
}
// RAT.Reporting.embedCSS=function(data,path){
//   if(RAT.isDesktop()){
//     return RAT.Reporting.embedCSSDesktop(data,path)
//   }else{
//     return RAT.Reporting.embedCSSMobile(data,path)
//   }
// }

// RAT.Reporting.embedCSSDesktop=function(data){
//   return data;
// }
// RAT.Reporting.embedCSSMobile=function(data){
//   return data;
// }

RAT.Reporting.generatePracticeInfo = function() {
    var loader = $('#loader');
    loader.html('');

    //users
    loader.append(RAT.Reporting.generatePagesWithTemplate(RAT.practiceInfomation.users, 'userReportTemplate', 'users', 'Users', function(data) {
        return data.firstname !== "";
    }));
    loader.append(RAT.Reporting.generatePagesWithTemplate(RAT.practiceInfomation.associates, 'associateReportTemplate', 'associates', 'Associates', function(data) {
        return data.name !== "";
    }));
    loader.append(RAT.Reporting.generatePagesWithTemplate(RAT.practiceInfomation.assetinventory, 'inventoryReportTemplate', 'assets', 'Asset Inventory', function(data) {
        return data.assetid !== "";
    }));
    //associates

    //assets
    return (loader.html());
}

//Generates pages in the report using the template passed in.
//Templates are named and fetched using templtr
//the ID is the id of the div appended
//the validator is a function that is called to validate the object
//before it is passed to the template.
RAT.Reporting.generatePagesWithTemplate = function(data, template, id, title, validator) {

    var MAX_TABLE_HEIGHT = 850;

    //var htmlData = $('<div id="'+id+'" class="page'+RAT.Utils.isDesktop()?'':'mobile'+'"></div>');
    var htmlData = $('<div id="' + id + '" class="page"></div>');
    for (var i = 0; i < data.length; i++) {
        var pg = $('<div class=""><h3>' + title + '</h3></div>')
        htmlData.append(pg);


        while ($(pg)[0].offsetHeight < MAX_TABLE_HEIGHT) {
            if (data[i]) {
                if (validator) {
                    if (!validator(data[i])) {
                        i++;
                        continue;
                    }
                }

                pg.append(templtr.getTemplate(template)({
                    data: data[i]
                }));
                i++;
                if ($(pg)[0].offsetHeight > MAX_TABLE_HEIGHT) {
                    //remove the last one appeded
                    pg.last().remove()
                    i--;
                    break;
                }
            } else {
                //nothing else to append so we are done
                break;
            }
        }
    }
    return htmlData;
}

RAT.Reporting.exportExcel = function(filePath) {

    //TODO: Make mobile Safe
    var officegen = require('officegen');
    var excel = officegen.makegen('xlsx');
    var tbl = $("#report-table").dataTable().fnGetData();
    var workSheet = excel.makeNewSheet();
    workSheet.name = "REPORT";

    var nameindex = 0
    workSheet.data[0] = [];
    // for (var name in tbl[0]) {
    //     if (name === 'isPlaceHolder') continue;
    //     workSheet.data[0][nameindex] = name;
    //     nameindex++;
    // }
    workSheet.data[0][0] = "ID";
    workSheet.data[0][1] = "Answer"; //item.answer ? "Yes" : "No";
    workSheet.data[0][2] = "Reason"; //item.reason ? item.reason : "";
    workSheet.data[0][3] = "Flagged" //item.flagged ? "Yes" : "No";
    workSheet.data[0][4] = "Explanation"; //item.explanation;
    workSheet.data[0][5] = "Notes"; //item.notes;
    workSheet.data[0][6] = "Remediation"; //item.remediation;
    workSheet.data[0][7] = "Likelihood"; //item.likelihood;
    workSheet.data[0][8] = "Impact"; //item.impact;
    workSheet.data[0][9] = "Timestamp"; //item.timestamp;
    workSheet.data[0][10] = "Risklevel"; //item.risklevel;
    workSheet.data[0][11] = "Citation"; //RAT.Assessment.getQuestionFromID(item.id).Citation;

    for (var i = 0; i < tbl.length; i++) {
        item = tbl[i];
        var trueIndex = i + 1;
        if (!workSheet.data[trueIndex]) {
            workSheet.data[trueIndex] = [];
        }

        workSheet.data[trueIndex][0] = item.id;
        workSheet.data[trueIndex][1] = item.answer ? "Yes" : "No";
        workSheet.data[trueIndex][2] = item.answer ? "N/A" : item.reason ? item.reason : "";
        workSheet.data[trueIndex][3] = item.flagged ? "Yes" : "No";
        workSheet.data[trueIndex][4] = item.explanation;
        workSheet.data[trueIndex][5] = item.notes;
        workSheet.data[trueIndex][6] = item.remediation;
        workSheet.data[trueIndex][7] = item.likelihood;
        workSheet.data[trueIndex][8] = item.impact;
        workSheet.data[trueIndex][9] = item.timestamp;
        workSheet.data[trueIndex][10] = item.risklevel;
        workSheet.data[trueIndex][11] = RAT.Assessment.getQuestionFromID(item.id).Citation;

    }

    var fs = require('fs');
    var out = fs.createWriteStream(filePath);

    out.on('error', function(err) {
        console.log(err);
    });

    excel.generate(out);
}

RAT.Reporting.createReportTable = function(data, selector) {
    var table = {
        sSelector: selector,
        asTableHeadings: [{
            sTitle: "ID",
            mData: "id",
            mRender: function(data, type, full) {
                return '<div class="jumpToQuestion" data-jumpTo=' + '"' + full.id + '"' + '>' + full.id + "</div>";
            }
        }, {
            sTitle: "Citation",
            mData: "citation",
            mRender: function(data, type, full) {
                return _.findWhere(RAT.Data.qData, {
                    ID: full.id
                }).Citation;
            }
        }, {
            sTitle: "Answer",
            mData: "answer",
            mRender: function(data, type, full) {
                return !full.isPlaceHolder ? full.answer ? "Yes" : "No" : "N/A"
            }
        }, {
            sTitle: "Flagged",
            mData: "flagged",
            mRender: function(data, type, full) {
                return full.flagged ? "&#x2713;" : "&nbsp;"
            }
        }, {
            sTitle: "Risk Level",
            mData: "risklevel",
            mRender: function(data, type, full) {
                return '<div class="' + full.risklevel + '">' + full.risklevel + "</div>"
            }
        }, {
            sTitle: "Current Activities",
            mData: "explanation"
        }, {
            sTitle: "Notes",
            mData: "notes"
        }, {
            sTitle: "Remediation",
            mData: "remediation"
        }, {
            sTitle: "Reason",
            mData: "reason",
            mRender: function(data, type, full) {
                return full.answer || !full.reason ? "N/A" : full.reason;
            },

        }, {
            sTitle: "Last Edit",
            mData: "timestamp"
        }, ],
        aoTableData: data,
    }



    return table;
}

RAT.Reporting.runReport = function() {

    RAT.Assessment.fillInAnswers();
    //TODO move this into a proper html file to load in.
    $("#floating-panel-content").html("");
    $("#floating-panel").css("display", "inline-block");
    if (RAT.Utils.isDesktop()) {
        $("#floating-panel-content").append("<div id='table-chart-toggle' class='buttons'>Chart View</div>")
    }
    if (RAT.Utils.isDesktop() || device.major_version >= 7) {
        $("#floating-panel-content").append("<div id='export-report-pdf' onclick='RAT.Reporting.Dialogs.exportPDFDialog()' class='buttons'><p class='mobile-hide'>Export PDF</p><p class='desktop-hide'>Print</p></div>")
    } else {
        $("#floating-panel-content").append("<div id='export-report-pdf' onclick='RAT.Reporting.Dialogs.exportPDFDialog()' class='buttons desktop-hide'><p>Show Report</p></div>")
    }

    $("#floating-panel-content").append("<div id='export-report-excel' onclick='RAT.Reporting.Dialogs.exportExcelDialog()' class='buttons mobile-hide'><p>Export Excel</p></div>")
    $("#table-chart-toggle").click(function() {
        RAT.Panels.loadCharts();
    })
    $("#floating-panel-content").append("<table id='report-table'></table>")
    RAT.Utils.showHidePlatformElements();


    var table = RAT.Reporting.createReportTable(_.filter(RAT.practiceInfomation.answers, function(answer) {
        return !answer.isPlaceHolder;
    }), "#report-table")
    RAT.Utils.createTableFromJSON(table);

    $(".jumpToQuestion").each(function() {
        $(this).click(function() {
            jumpTo($(this).attr("data-jumpTo"));
            closeFloatingPanel();
        });
    });
}

///////////////////////
//Exporting Dialogs
///////////////////////
RAT.Reporting.Dialogs.exportPDFDialog = function() {
    if (RAT.Utils.isDesktop()) {
        var path = require('path');
        $('body').append("<input style='display:none;' id='saveAs' type='file' nwsaveas='Report-" + moment().format('M-D-YYYY') + ".pdf' />")
        RAT.Utils.chooseFile('#saveAs', function(evt, val) {
            var fullPath = $(val).val();
            var parts = fullPath.split(path.sep);
            var fileName = parts[parts.length - 1];
            fileName = fileName.replace('.pdf', '');
            parts = parts.splice(0, parts.length - 1);
            var filePath = parts.join(path.sep);
            console.log("FilePath: " + filePath, "File Name: " + fileName);
            RAT.Reporting.exportPDF(fileName, filePath)
            $('#saveAs').remove();
        });
    } else {
        console.log("Exporting for mobile");
        RAT.Reporting.exportPDF("HHS-RAT-Report-" + moment().format('M-D-YYYY') + ".pdf", "/hhs/reports/")
    }
}

RAT.Reporting.Dialogs.exportExcelDialog = function() {
    $('body').append("<input style='display:none;' id='saveAs' type='file' nwsaveas='Report-" + moment().format('M-D-YYYY') + ".xlsx' />")
    RAT.Utils.chooseFile('#saveAs', function(evt, val) {
        var fullPath = $(val).val();
        if (!fullPath.match(".xlsx")) {
            fullPath += ".xlsx";
        }
        RAT.Reporting.exportExcel(fullPath);
        $('#saveAs').remove();
    });
}
///////////////////////
//Data
///////////////////////
RAT.Data.loadData = function() {
    if (localStorage.info != undefined) {
        RAT.practiceInfomation = $.parseJSON(localStorage.info);
    }
}

RAT.Data.saveData = function() {
    localStorage.info = JSON.stringify(RAT.practiceInfomation);
}

///////////////////////
//Assessment
///////////////////////

///////////
//Variables
///////////
RAT.Assessment.currentAnswer = null;
RAT.Assessment.currentQuestion = 0;
RAT.Assessment.isNavigatorOpen = false;

////////////
//Functions
////////////
RAT.Assessment.logout = function() {
    RAT.Utils.leftPanelLoadContent('html/welcome.html', null);
    RAT.Utils.rightPanelLoadContent('html/practiceInfomation.html', null)
    RAT.currentUser = "None";
    $("#current-user").html("Current User: " + RAT.currentUser);
}

RAT.Assessment.login = function() {
    $("#current-user").html("Current User: " + RAT.currentUser);
    RAT.Utils.loadFullScreenContent('html/information.html', null);
}

RAT.Assessment.answer = function() {
    this.id = "";
    this.answer = ""; //yes/no
    this.reason = "";
    this.flagged = false;
    this.explanation = "";
    this.notes = "";
    this.remediation = "";
    this.likelihood = "";
    this.impact = "";
    this.timestamp = "";
    this.risklevel = "";
    this.isPlaceHolder = true;
}

RAT.Assessment.getQuestionFromID = function(id) {
    return _.findWhere(RAT.Data.qData, {
        "ID": id
    });
}

RAT.Assessment.isQuestionComplete = function(question) {
    if (question.answer === "" || question.isPlaceHolder) {
        return false;
    } else return true;
}

RAT.Assessment.isQuestionNumberComplete = function(number) {
    var question = _.findWhere(RAT.practiceInfomation.answers, {
        "id": number
    });
    if (!question) return false;
    else return RAT.Assessment.isQuestionComplete(question);
}

RAT.Assessment.showDetailsPage = function(page) {
    $('#input-catagories').find(".tab").hide();
    $("#input-catagories").children("ul").children("li").each(function() {
        if ($(this).children("div").attr('page') == page) {
            $(this).addClass("selected-tab");
        } else {
            $(this).removeClass("selected-tab");
        }
    });
    $("#" + page).show();
}

RAT.Assessment.stampAnswer = function() {
    RAT.Assessment.currentAnswer.timestamp = "[" + RAT.currentUser + "]" + moment().format('l h:mm:ss a');
    RAT.Data.saveData();
}

RAT.Assessment.jumpTo = function(questionID) {
    console.log(questionID);
    RAT.Assessment.currentQuestion = _.indexOf(RAT.Data.qData, _.findWhere(RAT.Data.qData, {
        "ID": questionID
    }));
    RAT.Assessment.loadQuestion();
}

RAT.Assessment.fillInAnswers = function() {
    for (var i = 0; i < RAT.practiceInfomation.answers.length; i++) {
        if (!RAT.practiceInfomation.answers[i]) {
            RAT.practiceInfomation.answers[i] = new RAT.Assessment.answer();
            RAT.practiceInfomation.answers[i].id = RAT.Data.qData[i].ID;
        }
    }
}

RAT.Assessment.loadRelatedInfo = function(questionData) {
    $("#considerations").html(questionData.ThingsToConsider);
    $("#threats").html(questionData.Threats);
    $("#safeguards").html(questionData.Safeguards);
}

RAT.Assessment.loadQuestion = function() {

    if (RAT.Assessment.currentQuestion == RAT.Data.qData.length - 1) {
        $('#next-button').css('visibility', 'hidden');
    } else {
        $('#next-button').css('visibility', 'visible');
    }
    if (RAT.Assessment.currentQuestion == 0) {
        $('#prev-button').css('visibility', 'hidden');
    } else {
        $('#prev-button').css('visibility', 'visible');
    }

    if (RAT.practiceInfomation.answers[RAT.Assessment.currentQuestion] && !RAT.practiceInfomation.answers[RAT.Assessment.currentQuestion].isPlaceHolder) {
        RAT.Assessment.currentAnswer = RAT.practiceInfomation.answers[RAT.Assessment.currentQuestion];
        RAT.Assessment.currentAnswer.id = RAT.Data.qData[RAT.Assessment.currentQuestion].ID;
        RAT.Assessment.loadAnswer();
    } else {
        $("#answer-container").html("");
        RAT.Assessment.currentAnswer = undefined;
    }
    RAT.Assessment.fillInAnswers();
    $("#question-container").html(templtr.getTemplate("questionTemplate")({
        question: RAT.Data.qData[RAT.Assessment.currentQuestion],
        answer: RAT.Assessment.currentAnswer
    }));

    RAT.Assessment.loadRelatedInfo(RAT.Data.qData[RAT.Assessment.currentQuestion]);
    RAT.Assessment.highlightTerms();

    $("#question-container").find("input").change(function() {

        if (RAT.practiceInfomation.answers[RAT.Assessment.currentQuestion] == undefined) {
            RAT.practiceInfomation.answers[RAT.Assessment.currentQuestion] = new RAT.Assessment.answer();
        }

        RAT.Assessment.currentAnswer = RAT.practiceInfomation.answers[RAT.Assessment.currentQuestion];
        switch ($(this).attr("type")) {
            case "radio":

                RAT.Assessment.currentAnswer.id = RAT.Data.qData[RAT.Assessment.currentQuestion].ID;
                RAT.Assessment.currentAnswer.isPlaceHolder = false;
                RAT.Assessment.currentAnswer.answer = $('input[name=question-answer]:checked', '#question-container').val() == "No" ? false : true;
                RAT.Assessment.stampAnswer();
                RAT.Assessment.loadAnswer();
                RAT.Assessment.calculateCompletion();

                break;
            case "checkbox":
                RAT.Assessment.currentAnswer.flagged = $(this).prop('checked');
                RAT.Assessment.stampAnswer();
                break;
        }
        if (RAT.Nav.isNavigatorOpen) RAT.Nav.reloadNavigator();
    });
}

RAT.Assessment.highlightTerms = function() {
    for (var entry in RAT.Data.glossaryDictionary) {
        var Term = RAT.Data.glossaryDictionary[entry].Term;
        $('#question-content-container').highlight(Term);
        // $('#question').highlight(glossaryDictionary[entry].Term);
        $('#considerations').highlight(Term);
        $('#threats').highlight(Term);
        $('#safeguards').highlight(Term);
    }
    $('.highlight').each(function() {
        var term = RAT.Data.glossaryDictionary[this.innerText.toLowerCase()];
        $(this).attr("title", "<b>" + term.Term + ": </b>" + term.Definition);
        $(this).click(function() {
            RAT.Panels.loadGlossary(term)
        });
    });
    $(document).tooltip({
        content: function() {
            return $(this).prop('title');
        }
    });
}

RAT.Assessment.loadAnswer = function() {

    $("#answer-container").html(templtr.getTemplate("answerTemplate")({
        data: RAT.Data.qData[RAT.Assessment.currentQuestion],
        answer: RAT.Assessment.currentAnswer
    }));

    $("#input-catagories").children("ul").find("div").click(function() {
        RAT.Assessment.showDetailsPage($(this).attr('page'))
    })

    $("#answer-container").find("input").change(function() {
        switch ($(this).attr("type")) {
            case "radio":
                RAT.Assessment.currentAnswer.reason = $('input[name=reason]:checked', '#reason').attr("data-reason");
                RAT.Assessment.currentAnswer.likelihood = $('input[name=likelihood-selection]:checked', '#answer-container').attr("data-value");
                RAT.Assessment.currentAnswer.impact = $('input[name=impact-selection]:checked', '#answer-container').attr("data-value");
                RAT.Assessment.calculateRiskLevel();
                RAT.Assessment.stampAnswer();

                break;
        }
    });
    $('#activites-box').blur(function() {
        RAT.Assessment.currentAnswer.explanation = $(this).val();
        RAT.Assessment.stampAnswer();

    });

    $('#note-add').click(function() {
        if (RAT.Assessment.currentAnswer.notes == "") {
            RAT.Assessment.currentAnswer.notes = RAT.currentUser + ": " + $("#note-input").val();
        } else {
            RAT.Assessment.currentAnswer.notes = RAT.Assessment.currentAnswer.notes + "<br>" + RAT.currentUser + ": " + $('#note-input').val();
        }
        $('#note-display').html(RAT.Assessment.currentAnswer.notes);
        $('#note-input').val("");
        RAT.Assessment.stampAnswer();

    });
    $('#remediation-box').blur(function() {
        RAT.Assessment.currentAnswer.remediation = $(this).val();
        RAT.Assessment.stampAnswer();
    });
    RAT.Assessment.showDetailsPage("current-activities");
}

RAT.Assessment.calculateCompletion = function() {
    var answers = _.where(RAT.practiceInfomation.answers, {
        "isPlaceHolder": false
    })
    $("#progress-bar-filler").css("width", (answers.length / RAT.Data.qData.length) * 100 + '%')
}

RAT.Assessment.calculateRiskLevel = function() {
    var currentImpact = RAT.Assessment.currentAnswer.impact;
    var currentLikelihood = RAT.Assessment.currentAnswer.likelihood;
    if (currentImpact === "Low" || currentLikelihood === "Low") {
        RAT.Assessment.currentAnswer.risklevel = "Low";
    } else if (currentImpact == "High" && currentLikelihood == "High") {
        RAT.Assessment.currentAnswer.risklevel = "High";
    } else {
        RAT.Assessment.currentAnswer.risklevel = "Medium";
    }
}

RAT.Assessment.showRelatedInfo = function() {
    RAT.Nav.isNavigatorOpen = false;
    RAT.Utils.rightPanelLoadContent('html/relatedinformation.html', function() {
        RAT.Assessment.loadQuestion();
    });
}


/////////////////
//Panels
/////////////////
RAT.Panels.loadWelcome = function() {
    RAT.Utils.leftPanelLoadContent('html/welcome.html', null);
    RAT.Utils.rightPanelLoadContent('html/practiceInfomation.html', null)
}

RAT.Panels.loadNavigator = function() {
    RAT.Utils.rightPanelLoadContent("html/navigator.html", null);
    RAT.Nav.isNavigatorOpen = true;
}

RAT.Panels.loadAssessment = function() {
    RAT.Utils.leftPanelLoadContent('html/assesment.html', null);
}

RAT.Panels.loadCharts = function() {
    RAT.Utils.loadFloatingPanelContent('html/charts.html', null);
}

RAT.Panels.loadGlossary = function(term) {
    $("#floating-panel").css("display", "inline-block");
    $("#floating-panel-content").append("<table class='fill' id='glossary-table'></table>")
    var glossData = [];
    if (term == undefined) {
        for (entry in RAT.Data.glossaryDictionary) {
            glossData.push(RAT.Data.glossaryDictionary[entry]);
        }
    } else {
        glossData.push(term);
    }
    var table = {
        sSelector: "#glossary-table",
        asTableHeadings: [{
            sTitle: "Term",
            mData: "Term"
        }, {
            sTitle: "Citation",
            mData: "Citation"
        }, {
            sTitle: "Definition",
            mData: "Definition"
        }, {
            sTitle: "Discussion",
            mData: "Discussion"
        }],
        aoTableData: glossData
    }
    var tbl = RAT.Utils.createTableFromJSON(table);
}

////////////////////
//Charts
////////////////////
RAT.Charts.init = function(callBack) {
    $("#table-chart-toggle").click(function() {
        RAT.Reporting.runReport();
    })
    var chartData = {};
    var practiceInfomation = RAT.practiceInfomation;
    for (var i = 0; i < practiceInfomation.answers.length; i++) {
        var answer = practiceInfomation.answers[i];
        if (!chartData[answer.id[0]]) {
            chartData[answer.id[0]] = {};
        }
        if (!chartData[answer.id[0]][answer.risklevel]) {
            chartData[answer.id[0]][answer.risklevel] = 0;
        }
        chartData[answer.id[0]][answer.risklevel]++
        if (!chartData[answer.risklevel]) {
            chartData[answer.risklevel] = 0;
        }
        chartData[answer.risklevel]++;
    }
    var pieData = ["A", "P", "T"];
    for (var pd = 0; pd < pieData.length; pd++) {
        if (!chartData[pieData[pd]]) {
            chartData[pieData[pd]] = {};
        }
        dounutData = [{
            value: chartData[pieData[pd]].Low ? chartData[pieData[pd]].Low : 0,
            color: "#188A00",
        }, {
            value: chartData[pieData[pd]].Medium ? chartData[pieData[pd]].Medium : 0,
            color: "#FFA500",
        }, {
            value: chartData[pieData[pd]].High ? chartData[pieData[pd]].High : 0,
            color: "#FF0000",
        }, ]

        new Chart($("#" + pieData[pd] + "-pie")[0].getContext("2d")).Doughnut(dounutData, {
            animationEasing: "linear",
            animationSteps: 50,
        });

    }

    dounutData = [{
        value: chartData.Low ? chartData.Low : 0,
        color: "#188A00",
    }, {
        value: chartData.Medium ? chartData.Medium : 0,
        color: "#FFA500",
    }, {
        value: chartData.High ? chartData.High : 0,
        color: "#FF0000",
    }, ]
    new Chart($("#full-pie")[0].getContext("2d")).Doughnut(dounutData, {
        animationEasing: "linear",
        animationSteps: 50,
    });
    $("#astats").html(templtr.getTemplate("statsTemplate")({
        data: chartData.A
    }));
    $("#pstats").html(templtr.getTemplate("statsTemplate")({
        data: chartData.P
    }));
    $("#tstats").html(templtr.getTemplate("statsTemplate")({
        data: chartData.T
    }));
    $("#cstats").html(templtr.getTemplate("statsTemplate")({
        data: chartData
    }));

    callBack ? callBack() : "";
}

////////////////////
//Navigator
////////////////////
RAT.Nav.calculateNavigatorCompletion = function() {
    var catagoryResult = {};
    var navData = RAT.Data.navData;
    for (var i = 0; i < navData.length; i++) {
        var catagory = {};
        catagory.Catagory = navData[i].Catagory;
        catagory.total = navData[i].Admin.length + navData[i].Physical.length + navData[i].Tech.length;
        catagory["Admin"] = {}
        catagory["Admin"]["complete"] = 0;
        catagory["Admin"].total = navData[i].Admin.length;
        catagory["Admin"]["Qdata"] = [];

        catagory["Physical"] = {};
        catagory["Physical"]["complete"] = 0;
        catagory["Physical"].total = navData[i].Physical.length;
        catagory["Physical"]["Qdata"] = [];

        catagory["Tech"] = {}
        catagory["Tech"]["complete"] = 0;
        catagory["Tech"].total = navData[i].Tech.length;
        catagory["Tech"]["Qdata"] = []

        for (var a = 0; a < navData[i].Admin.length; a++) {
            var data = {}
            data["number"] = navData[i].Admin[a];
            var question = _.findWhere(RAT.practiceInfomation.answers, {
                "id": navData[i].Admin[a]
            });
            data["complete"] = question ? RAT.Assessment.isQuestionComplete(question) : false;
            data["complete"] ? catagory["Admin"].complete++ : "";
            catagory["Admin"]["Qdata"].push(data);
        }
        for (var a = 0; a < navData[i].Physical.length; a++) {
            var data = {}
            data["number"] = navData[i].Physical[a];
            var question = _.findWhere(RAT.practiceInfomation.answers, {
                "id": navData[i].Physical[a]
            });
            data["complete"] = question ? RAT.Assessment.isQuestionComplete(question) : false;
            data["complete"] ? catagory["Physical"].complete++ : "";
            catagory["Physical"]["Qdata"].push(data);
        }
        for (var a = 0; a < navData[i].Tech.length; a++) {
            var data = {}
            data["number"] = navData[i].Tech[a];
            var question = _.findWhere(RAT.practiceInfomation.answers, {
                "id": navData[i].Tech[a]
            });
            data["complete"] = question ? RAT.Assessment.isQuestionComplete(question) : false;
            data["complete"] ? catagory["Tech"].complete++ : "";
            catagory["Tech"]["Qdata"].push(data);
        }

        catagory.complete = catagory["Admin"].complete + catagory["Physical"].complete + catagory["Tech"].complete
        catagoryResult[navData[i].Catagory] = catagory;

    }
    return catagoryResult;
}

RAT.Nav.getOpenNodes = function() {
    var nodes = [];
    $("#navigator").find(".jstree-open").each(function() {

        nodes.push($(this).attr("id"));
    });
    return nodes;
}

RAT.Nav.reloadNavigator = function() {

    RAT.Nav.loadNavigator(RAT.Nav.getOpenNodes());
}

RAT.Nav.loadNavigator = function(openNodes) {
    if (openNodes == undefined) openNodes = [];
    $("#navigator").html(templtr.getTemplate("navTemplate")({
        data: RAT.Nav.calculateNavigatorCompletion()
    }))
    $("#navigator").jstree({
        "plugins": ["themes", "html_data", "ui", "crrm", "hotkeys"],
        "core": {
            "animation": 500,
            "initially_open": openNodes
        },
        "themes": {
            "theme": "apple",
            "icons": false,
        },
    })
    $("#navigator").jstree("set_theme", "apple");
}

////////////////////
//Information page
////////////////////
RAT.Info.currentPage = null;

RAT.Info.closeCurrentPage = function() {
    if (!RAT.Info.currentPage) return;

    $(RAT.Info.currentPage).removeClass("selected-tab");
    var PageName = RAT.Info.currentPage.attr("id");
    switch (PageName) {
        case "aboutpractice":
            RAT.Info.unloadAboutPractice();
            break;
        case "associates":
            RAT.Info.unloadAssociates();
            break;
        case "inventory":
            RAT.Info.unloadAssets();
            break;
        case "users":
            RAT.Info.unloadAssets();
            break;
    }
    RAT.Data.saveData();
}
RAT.Info.gotoPage = function(PageName) {

    $("#" + PageName).addClass("selected-tab");
    RAT.Info.currentPage = $("#" + PageName);
    switch (PageName) {
        case "aboutpractice":
            RAT.Info.loadAboutPractice();
            break;
        case "associates":
            RAT.Info.loadAssociates();
            break;
        case "inventory":
            RAT.Info.loadAssets();
            break;
        case "users":
            RAT.Info.loadUsers();
            break;
    }
}
//About practice questions
RAT.Info.unloadAboutPractice = function() {
    RAT.practiceInfomation.about.name = $("#name").val();
    RAT.practiceInfomation.about.address1 = $("#address1").val();
    RAT.practiceInfomation.about.address2 = $("#address2").val();
    RAT.practiceInfomation.about.city = $("#city").val();
    RAT.practiceInfomation.about.state = $("#state").val();
    RAT.practiceInfomation.about.zip = $("#zip").val();
    RAT.practiceInfomation.about.phonenumber = $("#telephone").val();
}
RAT.Info.loadAboutPractice = function() {
    $("#practice-questions-content").html(templtr.getTemplate("aboutPracticeTemplate")({
        data: RAT.practiceInfomation.about
    }));
    $("#state").val($("#state").attr("data-value"));
}

//////////////////////////////////////////////////////////////////
//associate entries
//////////////////////////////////////////////////////////////////
RAT.Info.unloadAssociates = function() {
    $(".associate-entry").each(function(index) {
        RAT.practiceInfomation.associates[index].name = $(this).children(".associateName").val();
        RAT.practiceInfomation.associates[index].type = $(this).children(".associateType").val();
        RAT.practiceInfomation.associates[index].address = $(this).children(".associateAddress").val();

    });
}
RAT.Info.loadAssociates = function() {
    $("#practice-questions-content").html(templtr.getTemplate("associatesTemplate")({
        associates: RAT.practiceInfomation.associates
    }));

    $("#practice-questions-content").find("input").blur(function() {
        RAT.Info.checkNeedsNewAssociate();
        RAT.Info.checkNeedsRemoveAssociateRow();
        $("#practice-questions-content-wrapper").scrollTop($("#practice-questions-content-wrapper")[0].scrollHeight);
    });
}

RAT.Info.checkNeedsRemoveAssociateRow = function() {
    $("#practice-questions-content").children(".associate-entry").each(function(index) {
        var remove = true;
        $(this).children("input").each(function() {
            if ($(this).val() != "") {
                remove = false;
                return;
            }
        });
        if (remove && index != $("#practice-questions-content").children(".associate-entry").length - 1) {
            RAT.practiceInfomation.associates.splice(index, 1);
            RAT.Info.loadAssociates();
        }
    });
}

RAT.Info.checkNeedsNewAssociate = function() {
    var needsNew = true;
    $("#practice-questions-content").children(".associate-entry").each(function(index) {
        $(this).children("input").each(function() {
            if ($(this).val() == "") {
                needsNew = false;
                return;
            }
        });
    });
    if (needsNew) {
        RAT.Info.unloadAssociates();
        RAT.practiceInfomation.associates.push({
            name: "",
            type: "",
            address: ""
        });
        RAT.Info.loadAssociates();
    }
}
////////////////////////////////////////////////////////////////////////////////
//Asset entries
////////////////////////////////////////////////////////////////////////////////
RAT.Info.unloadAssets = function() {
    $(".asset-entry").each(function(index) {
        RAT.practiceInfomation.assetinventory[index].assetid = $(this).children(".assetid").val();
        RAT.practiceInfomation.assetinventory[index].description = $(this).children(".assetdescription").val();
        RAT.practiceInfomation.assetinventory[index].hasephi = $(this).children(".assetephi").val();
        RAT.practiceInfomation.assetinventory[index].responsibleparty = $(this).children(".responsibleparty").val();

    });
}
RAT.Info.loadAssets = function() {
    $("#practice-questions-content").html(templtr.getTemplate("assetTemplate")({
        assets: RAT.practiceInfomation.assetinventory
    }));

    $("#practice-questions-content").find("input").blur(function() {

        RAT.Info.checkNeedsNewAsset();
        RAT.Info.checkNeedsRemoveAssetRow();
        $("#practice-questions-content-wrapper").scrollTop($("#practice-questions-content-wrapper")[0].scrollHeight);

    });
}

RAT.Info.checkNeedsRemoveAssetRow = function() {
    $("#practice-questions-content").children(".asset-entry").each(function(index) {
        var remove = true;
        $(this).children("input").each(function() {
            if ($(this).val() != "") {
                remove = false;
                return;
            }
        });
        if (remove && index != $("#practice-questions-content").children(".asset-entry").length - 1) {
            RAT.practiceInfomation.associates.splice(index, 1);
            RAT.Info.loadAssets();
        }
    });
}

RAT.Info.checkNeedsNewAsset = function() {
    console.log("checking if user needs another box");
    var needsNew = true;
    $("#practice-questions-content").children(".asset-entry").each(function(index) {
        $(this).children("input").each(function() {
            if ($(this).val() == "") {
                needsNew = false;
                return;
            }
        });
    });
    if (needsNew) {
        console.log("Creating new assets")
        RAT.Info.unloadAssets();
        RAT.practiceInfomation.assetinventory.push({
            assetid: "",
            description: "",
            hasephi: "",
            responsibleparty: ""
        });
        RAT.Info.loadAssets();
    }
}

/////////////////////////////////////////////////////////////////////
//Users
/////////////////////////////////////////////////////////////////////
RAT.Info.unloadUsers = function() {
    console.log("saving stuff")
    $(".user-entry").each(function(index) {
        RAT.practiceInfomation.users[index].firstname = $(this).children(".firstname").val();
        RAT.practiceInfomation.users[index].lastname = $(this).children(".lastname").val();
        RAT.practiceInfomation.users[index].login = $(this).children(".login").val();

    });
}
RAT.Info.loadUsers = function() {
    $("#practice-questions-content").html(templtr.getTemplate("userTemplate")({
        users: RAT.practiceInfomation.users
    }));

    $("#practice-questions-content").find("input").blur(function() {
        RAT.Info.checkNeedsNewUser();
        RAT.Info.checkNeedsRemoveUserRow();
        $("#practice-questions-content-wrapper").scrollTop($("#practice-questions-content-wrapper")[0].scrollHeight);
    });

    $("#practice-questions-content").find(".buttons").click(function() {
        RAT.currentUser = $(this).parent().find(".login").val();
        RAT.Assessment.login();
    });

    $(".user-entry").dblclick(function() {
        var self = this;
        $(this).addClass("selected");
        $(this).children(".buttons").html("Finished");
        $(this).children(".buttons").unbind('click');
        $(this).children(".buttons").click(function() {

            $(this).unbind('click');
            $(this).click(function() {
                RAT.currentUser = $(this).parent().find(".login").val();
                $("#current-user").html("Current User: " + RAT.currentUser)
                RAT.login();
            });
            RAT.Info.unloadUsers();
            $(this).children(".buttons").html("Login");

            $(self).removeClass("selected");
            RAT.info.loadUsers();
        });
    });
}

RAT.Info.checkNeedsRemoveUserRow = function() {
    $("#practice-questions-content").children(".user-entry").each(function(index) {
        var remove = true;
        $(this).children("input").each(function() {
            if ($(this).val() != "") {
                remove = false;
                return;
            }
        });
        if (remove && index != $("#practice-questions-content").children(".user-entry").length - 1) {
            RAT.practiceInfomation.users.splice(index, 1);
            RAT.Info.loadUsers();
        }
    });
}

RAT.Info.checkNeedsNewUser = function() {
    var needsNew = true;
    $("#practice-questions-content").children(".user-entry").each(function(index) {
        $(this).children("input").each(function() {
            if ($(this).val() == "") {
                needsNew = false;
                return;
            }
        });
    });
    if (needsNew) {
        RAT.Info.unloadUsers();
        RAT.practiceInfomation.users.push({
            firstname: "",
            lastname: "",
            login: "",
        });
        RAT.Info.loadUsers();
    }
}