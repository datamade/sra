$(document).ready(function() {

    $.fn.dataTableExt.sErrMode = 'mute';
    $("#loader").load("html/templates.html", function() {
        templtr.loadTemplates();

        $("#loader").html("");

        $("#logout").click(function() {
            RAT.Assessment.logout();
        })
        RAT.Initialize();
    });
});

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // RAT.Initialize();
    if (!RAT.Utils.isDesktop()) {
        device.major_version = parseInt(device.version[0]);
        console(device.major_version);
    }
}