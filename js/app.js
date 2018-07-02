/*jslint browser: true*/
/*global $, jQuery, alert*/
/* eslint-disable no-new */
(function () {
    "use strict";
    var data,
        verbose,
        dependencies,
        chocolatey,
        x86,
        ignoreChecksum,
        preRelease,
        forceInstall,
        removeSound,
        removeSignature,
        removeCredits,
        myInstaller,
        downloadInstaller,
        myUninstaller,
        myUpdater,
        myProgram,
        myProgramName,
        qsRegex,
        filterValue,
        myCounter = 0,
        selectedPrograms = "",
        myPrograms = [],
        myDownload = [],
        checkPrivileges = "openfiles > NUL 2>&1\n"
            + "if %errorlevel%==0 (\n"
            + "        cls\n"
            + "        echo .\n"
            + "        echo .\n"
            + "        echo .\n"
            + "        echo .\n"
            + "        echo Administration permissions granted!\n"
            + "        echo ROCK ON!\n"
            + "        echo .\n"
            + "        echo .\n"
            + "\n"
            + " ) else (\n"
            + "        goto :noadmin\n"
            + ")\n",
        notAdmin = "\n"
            + ":noadmin\n"
            + "    echo You are not running as Administrator...\n"
            + "    echo Right now, for best compatibility and to ensure everything is installed perfectly, you need to execute this Batch as an Administrator\n"
            + "    echo.\n"
            + "    echo ###########################################################################\n"
            + "    echo ##                                                                       ##\n"
            + "    echo ##    Right-click and select ^'Run as Administrator^' and try again...   ##\n"
            + "    echo ##                                                                       ##\n"
            + "    echo ###########################################################################\n"
            + "    echo.\n"
            + "    echo Press any key to exit...\n"
            + '    powershell -c (New-Object Media.SoundPlayer "http://rockinstaller.com/administration.wav").PlaySync();\n'
            + '    powershell -c (New-Object Media.SoundPlayer "http://rockinstaller.com/not.wav").PlaySync();\n'
            + '    powershell -c (New-Object Media.SoundPlayer "http://rockinstaller.com/found.wav").PlaySync();\n'
            + "    pause > NUL\n"
            + "    exit\n",
        myTimerStart = "@echo off\nset STARTTIME=%TIME%\n",
        myTimerEnd = "\nset ENDTIME=%TIME%\nset /A STARTTIME=(1%STARTTIME:~0,2%-100)*360000 + (1%STARTTIME:~3,2%-100)*6000 + (1%STARTTIME:~6,2%-100)*100 + (1%STARTTIME:~9,2%-100)\nset /A ENDTIME=(1%ENDTIME:~0,2%-100)*360000 + (1%ENDTIME:~3,2%-100)*6000 + (1%ENDTIME:~6,2%-100)*100 + (1%ENDTIME:~9,2%-100)\nset /A DURATION=%ENDTIME%-%STARTTIME%\nif %ENDTIME% LSS %STARTTIME% set set /A DURATION=%STARTTIME%-%ENDTIME%\nset /A DURATIONH=%DURATION% / 360000\nset /A DURATIONM=(%DURATION% - %DURATIONH%*360000) / 6000\nset /A DURATIONS=(%DURATION% - %DURATIONH%*360000 - %DURATIONM%*6000) / 100\nset /A DURATIONHS=(%DURATION% - %DURATIONH%*360000 - %DURATIONM%*6000 - %DURATIONS%*100)\nif %DURATIONH% LSS 10 set DURATIONH=0%DURATIONH%\nif %DURATIONM% LSS 10 set DURATIONM=0%DURATIONM%\nif %DURATIONS% LSS 10 set DURATIONS=0%DURATIONS%\nif %DURATIONHS% LSS 10 set DURATIONHS=0%DURATIONHS%\n",
        myTimerMessage = "\necho We completed installing everything in %DURATIONH%:%DURATIONM%:%DURATIONS%,%DURATIONHS%\n\n",
        myTweaks = "",
        chocoInstaller = '',
        startBatch = "@ECHO OFF\nTitle Rock Installer Automation Script v.1.1.8 OCT 2016 & Color 0B\ncls\n",
        mySignature = "echo                        __                                         \n"
            + "echo                       /\\ \\                                        \n"
            + "echo    _ __   ___     ___ \\ \\ \\/'\\      ___ ___       __       ___  \n"
            + "echo   /\\`'__\\/ __`\\  /'___\\\\ \\ , /_   /' __` __`\\   /'__`\\   /' _ `\\  \n"
            + "echo   \\ \\ \\//\\ \\L\\ \\/\\ \\__/ \\ \\ \\\\`\\  /\\ \\/\\ \\/\\ \\ /\\ \\L\\.\\_ /\\ \\/\\ \\ \n"
            + "echo    \\ \\_\\\\ \\____/\\ \\____\\ \\ \\_\\ \\_\\\\ \\_\\ \\_\\ \\_\\\\ \\__/.\\_\\\\ \\_\\ \\_\\\n"
            + "echo     \\/_/ \\/___/  \\/____/  \\/_/\\/_/ \\/_/\\/_/\\/_/ \\/__/\\/_/ \\/_/\\/_/\n"
            + "echo .\n"
            + "echo .\n"
            + "echo .\n"
            + "echo                       Script Automation                   \n"
            + "echo                      ver 1.1.8 / OCT 2016            \n",

        myCoolSound = '\n@ECHO OFF\npowershell -c (New-Object Media.SoundPlayer "http://pedroferrari.com/rock223.wav").PlaySync();\n',
        myCredits = "\necho ."
            + "\necho ."
            + "\necho ."
            + "\necho ."
            + "\necho ========================================================="
            + "\necho # Author"
            + "\necho - Pedro Ferrari @thepedroferrari"
            + "\necho ."
            + "\necho # THANKS"
            + "\necho - Chocolatey Team"
            + "\necho ."
            + "\necho ."
            + "\necho # TECHNOLOGY"
            + "\necho CSS3, HTML5, JavaScript, jQuery, ECMA6"
            + "\necho Isotope"
            + "\necho Download.js @ http://danml.com/download.html"
            + "\necho Goran Andersson @ http://jsfiddle.net/Guffa/Askwb/"
            + "\necho Gyannd @ http://stackoverflow.com/users/1259558/gynnad"
            + "\necho ."
            + "\necho ."
            + "\necho ."
            + "\necho Support the project at http://rockinstaller.com"
            + "\necho This software is licensed under MIT";
    
    $.getJSON("app.json", function (json) {
        data = json;
        $.each(data.software, function (index, element) {
            $(".grid").append('<li itemscope itemtype="http://schema.org/SoftwareApplication" class="element-item ' + element.category + '" data-category="' + element.category + '" data-link="' + element.link + '" data-name="' + element.name + '"><img src="' + element.image + '" alt="' + element.name + ' logo" width=50 height=50 role="presentation" itemprop="image"><h4 class="name" itemprop="name">' + element.name + '</h4><div class="extras"><a class="info" href="https://chocolatey.org/packages/' + element.link + '" title="Read more about ' + element.name + ' at Chocolatey.org" itemprop="url" target="_blank" class="software-info"><i></i></a><a class="screen" href="https://www.google.com/search?q=software+' + element.name + '+screenshot&hl=en&site=imghp&num=100&source=lnms&tbm=isch&sa=X&ved=0" target="_blank"><i></i></a><a class="video" itemprop="video" itemscope itemtype="http://schema.org/VideoObject" href="https://www.youtube.com/results?search_query=' + element.name + '+software" target="_blank"><i></i></a><span class="btn bottom tipso_style code" data-clipboard-text="choco install ' + element.link + '" data-tipso-title="Click to Copy" data-tipso="choco install ' + element.link + '"><i></i></span><div class="visuallyhidden" itemprop="operatingSystems">Windows</div><div class="category visuallyhidden" itemprop="applicationCategory">' + element.category + '</div></div></li>');
            
            //Clipboard
            new Clipboard('.btn');
            jQuery('.bottom').tipso({
                speed             : 400,
                background        : '#005293',
                titleBackground   : '#1A3050',
                color             : '#ffffff',
                titleColor        : '#ffffff',
                position          : 'bottom'
            });
        });
        
        // Alerts
        
          // Add to array
        $('.grid').on('click', '.element-item', function () {
            $(".message").empty();
            $(this).toggleClass('selected');
            myProgram = $(this).attr("data-link");
            myProgramName = $(this).attr("data-name");
            
            myPrograms.push(myProgram);
            if (!$(this).hasClass("selected")) {
                myCounter -= 5;
                $(".message").append('<div class="alert alert-success" id="success-alert"><button type="button" class="close" data-dismiss="alert">x</button><strong>' + myProgramName + ' was <u>removed</u> from your download list.</strong></div>');
                $(".message").alert();
                $("#success-alert").fadeTo(2000, 2500).slideUp(500, function () {
                    $("#success-alert").slideUp(500);
                });
                myPrograms = jQuery.grep(myPrograms, function (value) {
                    return value !== myProgram;
                });
            } else {
                myCounter += 5;
                $(".message").append('<div class="alert alert-success" id="success-alert"><button type="button" class="close" data-dismiss="alert">x</button><strong>' + myProgramName + ' was <u>added</u> to your download list.</strong></div>');
                $(".message").alert();
                $("#success-alert").fadeTo(2000, 500).slideUp(500, function () {
                    $("#success-alert").slideUp(500);
                });
            }
        });
    });
      
    // Remove duplicates
    function unique(list) {
        var result = [];
        $.each(list, function (i, e) {
            if ($.inArray(e, result) === -1) { result.push(e); }
        });
        return result;
    }
    
    function checkForm() {
        verbose = $("input[name='verbose']:checked").val();
        dependencies = $("input[name='dependencies']:checked").val();
        if ($('#chocolatey').is(':checked')) {chocolatey = '\n@powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((new-object net.webclient).DownloadString(\'https://chocolatey.org/install.ps1\'))" && SET PATH=%PATH%;%ALLUSERSPROFILE%\\chocolatey\\bin\n'; } else { chocolatey = ""; }
        if ($('#x86').is(':checked')) { x86 = " --x86"; } else { x86 = ""; }
        if ($('#ignoreChecksum').is(':checked')) { ignoreChecksum = " --ignore-checksum"; } else { ignoreChecksum = ""; }
        if ($('#preRelease').is(':checked')) { preRelease = " -pre"; } else { preRelease = ""; }
        if ($('#forceInstall').is(':checked')) { forceInstall = " -f"; } else { forceInstall = ""; }
        if ($('#removeSound').is(':checked')) { removeSound = ""; } else { removeSound = myCoolSound; }
        if ($('#removeSignature').is(':checked')) { removeSignature = ""; } else { removeSignature = mySignature; }
        if ($('#removeCredits').is(':checked')) { removeCredits = ""; } else { removeCredits = myCredits; }
    }





      //INSTALLER
    $('#installer').on("click", function () {
        selectedPrograms = "";
        checkForm();
        $.each(unique(myPrograms), function (index, value) {
            selectedPrograms = selectedPrograms + value + " ";
        });
        myInstaller = "choco install " + selectedPrograms + " -y";
        downloadInstaller = (startBatch + checkPrivileges + removeSignature + removeSound + chocolatey + myTimerStart + myInstaller + verbose + dependencies + x86 + ignoreChecksum + preRelease + forceInstall + myTimerEnd + removeCredits + myTimerMessage + "\npause" + notAdmin);
        download(startBatch + checkPrivileges + removeSignature + removeSound + chocolatey + myTimerStart + myInstaller + verbose + dependencies + x86 + ignoreChecksum + preRelease + forceInstall + myTimerEnd + removeCredits + myTimerMessage + "\npause" + notAdmin, "rock.bat", "application/octet-stream");
    });


      // UNINSTALLER
    $('#uninstaller').on("click", function () {
        selectedPrograms = "";
        checkForm();
        $.each(unique(myPrograms), function (index, value) {
            selectedPrograms = selectedPrograms + value + " ";
        });
        myUninstaller = "choco uninstall " + selectedPrograms + "-y -r";
        download(checkPrivileges + myUninstaller + removeCredits + "\npause" + notAdmin, "rock-uninstaller.bat", "application/octet-stream");
    });


    // UPDATER
    $('#updater').on("click", function () {
        selectedPrograms = "";
        checkForm();
        $.each(unique(myPrograms), function (index, value) {
            selectedPrograms = selectedPrograms + value + " ";
        });
        myUpdater = "upgrade " + selectedPrograms + "-y -r";
        download(checkPrivileges + myUpdater + removeCredits + "\npause" + notAdmin, "rock-updater.bat", "application/octet-stream");
    });


    setTimeout(function () {
        var $grid = $('.grid').isotope({
            itemSelector: '.element-item',
            layoutMode: 'fitRows',
            filter: function () {
                return qsRegex ? $(this).text().match(qsRegex) : true;
            }
        });
        // use value of search field to filter
        var $quicksearch = $('.quicksearch').keyup(debounce(function () {
            qsRegex = new RegExp($quicksearch.val(), 'gi');
            $grid.isotope();
        }, 200));

        // debounce so filtering doesn't happen every millisecond
        function debounce(fn, threshold) {
            var timeout;
            return function debounced() {
                if (timeout) {
                    clearTimeout(timeout);
                }
                function delayed() {
                    fn();
                    timeout = null;
                }
                timeout = setTimeout(delayed, threshold || 200);
            };
        }
        // filter functions
        var filterFns = {
        // show if name ends with -ium
            ium: function () {
                var name = $(this).find('.name').text();
                return name.match(/$chr/);
            }
        };
        // bind filter on select change
        $('.selectpicker.filters-type').on('change', function () {
            // get filter value from option value
            filterValue = this.value;
            // use filterFn if matches value
            filterValue = filterFns[filterValue] || filterValue;
            $grid.isotope({ filter: filterValue });
        });
        // bind filter button click
        $('.filters-button-group').on('click', 'button', function () {
            filterValue = $(this).attr('data-filter');
            // use filterFn if matches value
            filterValue = filterFns[filterValue] || filterValue;
            $grid.isotope({ filter: filterValue });
        });
        // change is-checked class on buttons
        $('.button-group').each(function (i, buttonGroup) {
            var $buttonGroup = $(buttonGroup);
            $buttonGroup.on('click', 'button', function () {
                $buttonGroup.find('.is-checked').removeClass('is-checked');
                $(this).addClass('is-checked');
            });
        });
    }, 500);
    
    $('.selectpicker').selectpicker({
        style: 'btn-info',
        size: 16
    });
}(jQuery));