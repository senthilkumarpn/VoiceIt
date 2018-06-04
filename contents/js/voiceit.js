/**
 * VoiceIt.js is a voice control, speech recognition and speech synthesis JavaScript library for Techoil /Shiptech Products
 * @requires {webkitSpeechRecognition && speechSynthesis && artyom.js}
 * @license MIT
 * @version 1.0.0
 * @copyright 2018 Inatech Info Solutions Ltd All Rights Reserved.
 * @author SenthilKumar P (https://github.com/senthilkumarpn) , Nagammai and Sanjai.
 */
var VoiceIt = (function () {
    class VoiceIt {
        constructor(options) {
            let _this = this;
            this.version = "1.1.0";
            this.defaultInit = {
                lang: "en-GB", // GreatBritain english
                continuous: true, // Listen forever
                soundex: true,// Use the soundex algorithm to increase accuracy
                debug: true, // Show messages in the console
                executionKeyword: "and do it now",
                listen: true, // Start to listen commands !,              
                obeyKeyword: "start again",
                // obeyKeyword: "hello maya",
                //name:"Maya",
            };
            this.voiceItProperties = {};
            this.voiceItProperties.debug = true;
            this.randomStartUpMsg = [
                this.greet,
                "Hey, good to see you again",
                "Hi " +this.userName+ ". I'm Techoil. Let's get started.What would you like me to do ?",
            ];
            this.initialize = options &&  options.initialize ? options.initialize : this.defaultInit;
            this.redirectOutputTo = options ? options.redirectOutputTo : {};
            this.$startListenBtn = options ? options.$startListenBtn : {};
            this.informationBarContainer = "body";
            this.voiceit = new Artyom();
            this.events = {
                default: {
                        BINDINGCOMPLETE: "bindingcomplete",
                        MOUSEDOW: "mousedown",
                        MOUSEUP: "mouseup",
                        MOUSEOVER: "mouseover",
                        CLICK: "click",
                        TOUCHSTART: "touchstart",
                        TOUCHEND: "touchend",
                },
                voiceit: {
                    SPEECH_SYNTHESIS_START:"SPEECH_SYNTHESIS_START",
                    SPEECH_SYNTHESIS_END: "SPEECH_SYNTHESIS_END",
                    TEXT_RECOGNIZED: "TEXT_RECOGNIZED",
                    COMMAND_RECOGNITION_START: "COMMAND_RECOGNITION_START",
                    COMMAND_RECOGNITION_END: "COMMAND_RECOGNITION_END",
                    COMMAND_MATCHED: "COMMAND_MATCHED",
                    NOT_COMMAND_MATCHED:"NOT_COMMAND_MATCHED",
                }
            } 
            this.buildDictionary();
        }

        initialCheck() {
            return { voice: this.voiceit.recognizingSupported(), speech: this.voiceit.speechSupported() };
        }
        buildDictionary() {
            let _this = this;
            this.cmdDictionary = [
                {
                    // indexes: ["Stop listening"],
                    indexes: ["Hold on *","hold an *"],
                    smart: true,
                    action: function (i) {
                        _this.voiceit.say("Bye see you later");
                        _this.voiceit.dontObey();
                        _this.showInfo("VoiceIt isn't listening anymore. Say 'start again'.");
                        _this.infoBar.$micImage.removeClass("active").addClass("pause");
                        _this.showHeaderInfo("Voiceit is not listening");
                        _this.debug("Techie isn't listening anymore","warn");
                    },
                    description:"Stop Listening",
                },
                {
                // indexes: ["hello maya"],
                   indexes: ["start again"],
                    smart: false,
                    action: function (i) {
                        _this.voiceit.say("Ok lets Continue");
                        _this.debug("Techie is started listening", "info");
                        _this.infoBar.$micImage.removeClass("pause").addClass("active");
                    },
                    description: "To Start again",
                },
                {
                    indexes: ["show available commands", "show available command","show me available commands"],
                    smart: false,
                    action: function (i) {
                        debugger;
                        _this.triggerAction("availableCommands");
                        _this.debug("List commands loaded in voice engine", "info");
                    },
                    description: "List commands loaded in voice engine",
                },
                {
                    indexes: ["* available commands","* available command"],
                    smart: true,
                    action: function (i,wild) {
                        debugger;
                        _this.triggerAction("availableCommands");
                        _this.debug("List commands loaded in voice engine", "info");
                    },
                    description: "List commands loaded in voice engine",
                },
                

            ];
            this.appDictionary = [
                {
                    indexes: ["* save my data"],
                    smart: true,
                    action: function (i) {
                        _this.triggerAction("savepreference");
                        _this.debug("Save Preference  Triggered", "info");
                    }
                },
                {
                    indexes: ["* clear filters", "* clear filter"],
                    smart: true,
                    action: function (i) {
                        _this.triggerAction("clearfilter");
                        _this.debug("clearfilter Triggered", "info");
                    },
                    description: "Clear Grid Filters",
                },
                {
                    indexes: ["clear filters", "clear filter"],
                    smart: false,
                    action: function (i) {
                        _this.triggerAction("clearfilter");
                        _this.debug("clearfilter Triggered", "info");
                    },
                    description: "Clear Grid Filters (Without wild card)",
                },
                {
                    indexes: ["* export Excel", "* download excel", "* export to excel"],
                    smart: true,
                    action: function (i) {
                        _this.triggerAction("exportxl");
                        _this.debug("exportxl Triggered", "info");
                    },
                    description: "Export Grid Data into Excell",
                },
                {
                    indexes: ["add new",],
                    smart: false,
                    action: function (i) {
                        _this.triggerAction("addnew");
                        _this.debug("addnew Triggered", "info");
                    },
                    description: "Execute Add Action in Grid",
                },
                {
                    indexes: ["* add new"],
                    smart: true,
                    action: function (i) {
                        _this.triggerAction("addnew");
                        _this.debug("addnew Triggered", "info");
                    },
                    description: "Execute Add Action in Grid",
                },
                {
                    indexes: ["search *"],
                    smart: true,
                    action: function (i, wildcard) {

                        wildcard = wildcard;// split unwanted characters literal here;
                        _this.triggerAction("search", wildcard);
                        _this.debug("search Triggered", "info");
                    },
                    description: "Search data in grid",
                },
                {
                    indexes: ["clear search"],
                    smart: false,
                    action: function (i) {

                        _this.triggerAction("clearsearch");
                        _this.debug("clearsearch Triggered", "info");
                    },
                    description: "Clear Search data in grid (without wildcard)",
                },
                {
                    indexes: ["clear search *", "* clear search", "clear search"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("clearsearch");
                        _this.debug("clearsearch Triggered", "info");
                    },
                    description: "Clear Search data in grid",
                },
                 {
                     indexes: ["go to global search"],
                     smart: false,
                     action: function (i, wildcard) {                       
                         _this.triggerAction("globalsearch");
                         _this.debug("globalsearch Triggered", "info");
                     },
                     description: "Global Search data in grid",
                 },
                  {
                      indexes: ["global filter *"],
                      smart: true,
                      action: function (i, wildcard) {
                          debugger;                         
                          _this.triggerAction("globalsearchfilter", wildcard);
                          _this.debug("globalsearchfilter Triggered", "info");
                      },
                      description: "Global Search data in grid",
                 },                 
                  {
                      indexes: ["go to next page", "navigate to next page", "go to the next page"],
                      smart: false,
                      action: function (i, wildcard) {

                          _this.triggerAction("nextpage");
                          _this.debug("nextpage Triggered", "info");
                      },
                      description: "Navigate to next page of grid ( without wild cards)",
                  },
                {
                    indexes: ["* go to next page", "* navigate to next page", "* go to the next page"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("nextpage");
                        _this.debug("nextpage Triggered", "info");
                    },
                    description: "Navigate to next page of grid",
                },
                {
                    indexes: ["go to previous page", "navigate to previous page"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("previouspage");
                        _this.debug("previouspage Triggered", "info");
                    },
                    description: "Navigate to previous page of grid",
                },
                {
                    indexes: ["* go to previous page", "* navigate to previous page"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("previouspage");
                        _this.debug("previouspage Triggered", "info");
                    },
                    description: "Navigate to previous page of grid",
                },
                {
                    indexes: ["go to page number *", "navigate to page number *", "go to page *", "navigate to page *"],
                    smart: true,
                    action: function (i, wildcard) {

                        wildcard = wildcard.replace("page", "").replace("page number", "").trim();
                        var num = parseInt(wildcard);
                        if (!isNaN(num)) {
                            num = --num; // since grid paging starts from 0;
                            _this.triggerAction("goto", num);
                            _this.debug("gotoPage Triggered", "info");
                            return;
                        }

                        var convertedNumber = _this.convertStringToNumber(wildcard);
                        if (!isNaN(convertedNumber)) {
                            convertedNumber = --convertedNumber;
                            _this.triggerAction("goto", convertedNumber);
                            _this.debug("gotoPage Triggered", "info");
                            return;
                        }
                        else {
                            _this.debug("In Valid page number Triggered", "warn");
                        }
                    },
                    description: "Navigate to particular pageNumber",
                },
                {
                    indexes: ["select row number *", "select a row number *"],
                    smart: true,
                    action: function (i, wildcard) {
                        debugger;
                        wildcard = wildcard.replace("row", "").replace("row number", "").trim();
                        var num = parseInt(wildcard);
                        if (!isNaN(num)) {
                            num = --num; // since grid paging starts from 0;
                            _this.triggerAction("selectrows", num);
                            _this.debug("selectrows Triggered", "info");
                            return;
                        }

                        var convertedNumber = _this.convertStringToNumber(wildcard);
                        if (!isNaN(convertedNumber)) {
                            convertedNumber = --convertedNumber;
                            _this.triggerAction("selectrows", convertedNumber);
                            _this.debug("selectrows Triggered", "info");
                            return;
                        }
                        else {
                            _this.debug("In Valid row number Triggered", "info");
                        }

                    },
                    description: "Select row in grid",
                },
                {
                    indexes: ["move up","move down"],
                    smart: false,
                    action: function (i) {
                        debugger;
                        switch (i) {
                            case 0:
                                _this.triggerAction("moveup");
                                break;
                            case 1:
                                _this.triggerAction("movedown");
                                break;
                        }
                        _this.debug("Move is triggerd", "info");
                    },
                    description: "clear row selection in grid",
                },
                {
                    indexes: ["clear selection"],
                    smart: false,
                    action: function (i) {
                        _this.triggerAction("clearselection");
                        _this.debug("clear selection Triggered", "info");
                    },
                    description: "clear row selection in grid",
                },
                {
                    indexes: ["edit selection"],
                    smart: false,
                    action: function (i) {
                        _this.triggerAction("editselection");
                        _this.debug("edit selection Triggered", "info");
                    },
                    description: "execute edit action on selected row in grid.",
                },
                {
                    indexes: ["copy selection"],
                    smart: false,
                    action: function (i) {
                        _this.triggerAction("copyselection");
                        _this.debug("copy selection Triggered", "info");
                    },
                    description: "execute copy action on selected row in grid.",
                },

                

                //refreshmenu
                {
                    indexes: ["* refresh menu", "* clear menu", '* reload menu'],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("refreshmenu");
                        _this.debug("refreshmenu Triggered", "info");
                    },
                    description: "Refresh Menu",
                },
                //refreshcache cache
                {
                    indexes: ["* refresh cache", "* clear cache", '* reload cache'],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("refreshcache");
                        _this.debug("refreshcache Triggered", "info");
                    },
                    description: "Refresh Cache",
                },
                //signout App
                {
                    indexes: ["* sign out", "sign out *", "* logout", "logout *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("signout");
                        _this.debug("signout Triggered", "info");
                    },
                    description: "Execute Sign out Action",
                },
                //scroll Events
                {
                    indexes: ["scroll down"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrolldown");
                        _this.debug("scrolldown Triggered", "info");
                    },
                    description: "Scroll Down page",
                },
                {
                    indexes: ["* scroll down", "scroll down *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrolldown");
                        _this.debug("scrolldown Triggered", "info");
                    },
                    description: "Scroll Down page",
                },
                {
                    indexes: ["scroll bottom"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrollbottom");
                        _this.debug("scrollbottom Triggered", "info");
                    },
                    description: "Scroll bottom page",
                },
                {
                    indexes: ["* scroll bottom", "scroll bottom *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrollbottom");
                        _this.debug("scrollbottom Triggered", "info");
                    },
                    description: "Scroll bottom page",
                },
                {
                    indexes: ["scroll top"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrolltop");
                        _this.debug("scrolltop Triggered", "info");
                    },
                    description: "Scroll top page",
                },
                {
                    indexes: ["* scroll top", "scroll top *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrolltop");
                        _this.debug("scrolltop Triggered", "info");
                    },
                    description: "Scroll top page",
                },

                {
                    indexes: ["scroll up"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrollup");
                        _this.debug("scrollup Triggered", "info");
                    },
                    description: "Scroll up page",
                },
                {
                    indexes: ["* scroll up", "scroll up *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrollup");
                        _this.debug("scrollup Triggered", "info");
                    },
                    description: "Scroll up page",
                },
                {
                    indexes: ["scroll right", "scroll right please"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrollright");
                        _this.debug("scrollright Triggered", "info");
                    },
                    description: "Scroll right page",
                },
                {
                    indexes: ["* scroll right", "scroll right *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrollright");
                        _this.debug("scrollright Triggered", "info");
                    },
                    description: "Scroll right page",
                },
                {
                    indexes: ["scroll left", "scroll left please"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrollleft");
                        _this.debug("scroll left Triggered", "info");
                    },
                    description: "Scroll left page",
                },
                {
                    indexes: ["* scroll left", "scroll left *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("scrollleft");
                        _this.debug("scrollleft Triggered", "info");
                    },
                    description: "Scroll left page",
                },
                {
                    indexes: ["go back"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("goback");
                        _this.debug("goback Triggered", "info");
                    },
                    description: "Go back to the page",
                },
                {
                    indexes: ["* go back", "go back *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("goback");
                        _this.debug("goback Triggered", "info");
                    },
                    description: "Go back to the page",
                },
                {
                    indexes: ["go forward"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("goforward");
                        _this.debug("goforward Triggered", "info");
                    },
                    description: "Go forward to the page",
                },
                {
                    indexes: ["* go forward", "go forward *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("goforward");
                        _this.debug("scrollright Triggered", "info");
                    },
                    description: "Go forward to the page",
                },
                {
                    indexes: ["refresh page"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("refreshpage");
                        _this.debug("refresh Triggered", "info");
                    },
                    description: "Go forward to the page",
                },
                {
                    indexes: ["* refresh page", "refresh page *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("refreshpage");
                        _this.debug("refresh Triggered", "info");
                    },
                    description: "Refresh page",
                },
                {
                    indexes: ["reload page"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("reloadpage");
                        _this.debug("reloadpage Triggered", "info");
                    },
                    description: "Reload Page(Full page load)",
                },
                {
                    indexes: ["* reload page", "reload page *"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("reloadpage");
                        _this.debug("reloadpage Triggered", "info");
                    },
                    description: "Reload Page(Full page load)",
                },
                {
                    indexes: ["open * "],
                    smart: true,
                    action: function (i, wildcard) {
                        debugger;
                        var data = wildcard.replace("master", "").trim();
                        _this.triggerAction("openpage", data);
                        _this.debug("openpage Triggered", "info");
                    },
                    description: "Open Menu - Usage 'Open *'",
                },
                 {
                     indexes: ["go to email log"],
                     smart: false,
                     action: function (i, wildcard) {
                         debugger;                        
                         _this.triggerAction("openemaillog");
                         _this.debug("openemaillog Triggered", "info");
                     },
                     description: "Open Email log - Usage 'Open *'",
                 },
                {
                    indexes: ["filter * "],
                    smart: true,
                    action: function (i, wildcard) {

                        //var data = wildcard.replace("master", "").trim();
                        //_this.triggerAction("openpage", data);
                        var $curGrid = _this.getCurrentGrid();

                        var filterData = [];

                        var commands = wildcard.split("and");
                        if (commands.length > 0) {
                            for (var i = 0; i < commands.length; i++) {
                                var command = commands[i].split("by");
                                var columnName = command[0].trim();
                                var searchValue = command[1].trim();
                                var data = getMatchingColumn(columnName, $curGrid);
                                if (data != null) {
                                    filterData.push(_this.createFilterProperties(searchValue, "CONTAINS", "stringfilter", data.datafield));
                                }
                            }
                        }
                        else {
                            command = wildcard.split("by");
                            var columnName = command[0].trim();
                            var searchValue = command[1].trim();

                            var data = getMatchingColumn(columnName, $curGrid);
                            if (data != null) {
                                filterData.push(_this.createFilterProperties(searchValue, "CONTAINS", "stringfilter", data.datafield));
                            }

                        }
                        if (filterData.length > 0) {
                            _this.applyGridFilter(filterData, $curGrid);
                        }
                        function getMatchingColumn(columnname, $curGrid) {
                            //var $curGrid = _this.getCurrentGrid()
                            var textData = new Array();
                            var columnDataField = null;
                            var cols = $curGrid.jqxGrid("columns");
                            for (var i = 0; i < cols.records.length; i++) {
                                textData[i] = cols.records[i];
                            }
                            var value = columnname, matchedIndex = null;
                            for (var i = 0; i < textData.length; i++) {
                                if (textData[i].text.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                                    matchedIndex = i;
                                    break;
                                }
                            }
                            if (matchedIndex != null) {
                                return textData[matchedIndex];
                            }
                            else {
                                return null;
                            }

                        }
                        _this.debug("Filter Triggered", "info");

                    },
                    description: "Filter Columns: Usage:( Filter columnname by value)",
                },
                {
                    indexes: ["escape popup", "escape model", "escape"],
                    smart: false,
                    action: function (i, wildcard) {

                        _this.triggerAction("escapemodel");
                        _this.debug("Escape Triggered", "info");
                    },
                    description: "Escape / Quit from Model",
                },
                {
                    indexes: ["* pnl value"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("report_dailypnl");
                        _this.debug("daily pnl value", "info");
                    },
                    description: "Show PNL Value of the day",
                },
                {
                    indexes: ["* exposure value"],
                    smart: true,
                    action: function (i, wildcard) {

                        _this.triggerAction("report_exposure");
                        _this.debug("exposure value", "info");
                    },
                    description: "Show Exposure Value of the day",
                },


                {
                    //The smart property of the command needs to be true
                    smart: true,
                    indexes: ["Repeat after me *"],
                    action: function (i, wildcard) {
                        // Speak alterable value
                        _this.voiceit.say(wildcard);
                        _this.debug("Repeat Triggered", "info");
                    },
                    description: "System will repeat whatever you say.",
                },
            ];
            this.moduleDictionary = [{
                moduleName: "trade",
                dictionary: [
                    {
                        indexes: ["select deal *"],
                        smart: true,
                        action: function (i, wildcard) {
                            _this.triggerAction("selectdeal", wildcard);
                            _this.debug("Deal type selected", "info");
                        },
                        description: "Select Deal in Trade Screen.",
                    },
                    {
                        indexes: ["add Product"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("addproduct");
                            _this.debug("Add Product Triggered", "info");
                        },
                        description: "Add Product in Trade Screen",
                    },
                    {
                        indexes: ["copy trade"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("copytrade");
                            _this.debug("copytrade Triggered", "info");
                        },
                        description: "Copy Trade",
                    },
                      {
                          indexes: ["confirmation email"],
                          smart: false,
                          action: function (i, wildcard) {
                              _this.triggerAction("confirmationemail");
                              _this.debug("confirmationemail Triggered", "info");
                          },
                          description: "open confirmation email",
                      },
                       {
                           indexes: ["send confirmation email"],
                           smart: false,
                           action: function (i, wildcard) {
                               _this.triggerAction("sendconfirmationemail");
                               _this.debug("sendconfirmationemail Triggered", "info");
                           },
                           description: "send confirmation email",
                       },
                       
                       {
                           indexes: ["print confirmation email"],
                           smart: false,
                           action: function (i, wildcard) {
                               _this.triggerAction("printconfirmationemail");
                               _this.debug("printconfirmationemail Triggered", "info");
                           },
                           description: "Print confirmation email",
                           },
                           {
                               indexes: ["Customer support"],
                               smart: false,
                               action: function (i, wildcard) {
                                   _this.triggerAction("Customersupport");
                                   _this.debug("Customersupport Triggered", "info");
                               },
                               description: "send email to Customersupport",
                               },
                    {
                        indexes: ["new trade"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("newtrade");
                            _this.debug("newtrade Triggered", "info");
                        },
                        description: "New Trade",
                    },
                    {
                        indexes: ["save trade"],
                        smart: false,
                        action: function (i) {
                            _this.triggerAction("savetrade");
                            _this.debug("Save Trade Triggered", "info");
                        },
                        description: "Save Trade in Trade Screen",
                    },
                    {
                        indexes: ["confirm trade"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("confirmTrade");
                            _this.debug("confirmTrade Triggered", "info");
                        },
                        description: "Confirm Trade in Trade Screen",
                    },

                    {
                        indexes: ["delete trade"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("deletetrade");
                            _this.debug("deletetrade Triggered", "info");
                        },
                        description: "Delete Trade in Trade Screen",
                    },
                    {
                        indexes: ["expand cost", "collapse cost", "expand costs", "collapse costs"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("expandaddcosts");
                            _this.debug("expandaddcosts", "info");
                        },
                        description: "Expand/Collapse Cost in Trade Screen",
                    },
                    {
                        indexes: ["expand notes", "collapse notes", "expand note", "collapse note"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("expandnotes");
                            _this.debug("expandnotes", "info");
                        },
                        description: "Expand/Collapse Notes in Trade Screen",
                    },
                    {
                        indexes: ["expand other details", "collapse other details", "expand other detail", "collapse other detail"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("expandotherdetails");
                            _this.debug("expandotherdetails", "info");
                        },
                        description: "Expand/Collapse other Details in Trade Screen",
                    },
                    {
                        indexes: ["expand documentations", "collapse documentations", "expand documentation", "collapse documentation"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("expanddocumentation");
                            _this.debug("expanddocumentation", "info");
                        },
                        description: "Expand/Collapse Documentation in Trade Screen",
                    },
                    {
                        indexes: ["expand audit logs", "collapse audit logs", "expand audit log", "collapse audit log"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("expandauditlog");
                            _this.debug("expand/Collapse auditlog", "info");
                        },
                        description: "Expand/Collapse Audit Logs in Trade Screen",
                    },
                    {
                        indexes: ["send email", "send trade mail", "send trade mails"],
                        smart: false,
                        action: function (i, wildcard) {
                            _this.triggerAction("traderecapmail");
                            _this.debug("traderecapmail auditlog", "info");
                        },
                        description: "Send Trade Email.",
                    },
                    {
                        indexes: ["enter special remarks *", "set special remarks *", "update special remarks *"],
                        smart: true,
                        action: function (i, wildcard) {
                            _this.triggerAction("traderemarks", wildcard);
                            _this.debug("traderemarks", "info");
                        },
                        description: "Enter special Remarks in trade Screen.",
                    },
                    {
                        indexes: ["set remark *", "set remarks *", "enter remark *","enter remarks *"],
                        smart: true,
                        action: function (i, wildcard) {
                            _this.triggerAction("traderemarks", wildcard);
                            _this.debug("traderemarks", "info");
                        },
                        description: "Enter special Remarks in trade Screen.",
                    },
                    {
                        indexes: ["enter internal comment *","enter internal comments *", "enter internal commands *"],
                        smart: true,
                        action: function (i, wildcard) {
                            _this.triggerAction("tradeinternalcomment", wildcard);
                            _this.debug("tradeinternalcomment", "info");
                        },
                        description: "Enter Internal comments.",
                    },
                    {
                        indexes: ["enter external comment *","enter external comments *", "enter external commands *"],
                        smart: true,
                        action: function (i, wildcard) {
                            _this.triggerAction("tradeexternalcomment", wildcard);
                            _this.debug("tradeexternalcomment", "info");
                        },
                        description: "Enter external comments.",
                    },



                ]
            }];
            this.commonDictionary = [
                {
                    indexes: ["Good morning"],
                    // action: function (i) {
                    smart: false,
                        action: function (i) {
                            _this.voiceit.say("Good morning" + _this.userName);
                            _this.debug("Good morning Triggered", "info");
                        }
                        
                    //}
                },
                {
                    indexes: ["good night"],
                    smart:false,
                    action: function (i) {
                        _this.debug("Good Night Triggered", "info");
                        _this.voiceit.say("Good night");
                    }
                },
                {
                    indexes: ["Take Screenshot *"],
                    action: function (i,wildcard) {
                        _this.triggerAction("takescreenshot", wildcard);
                        _this.debug("Good night Triggered", "info");

                    }
                },
                {
                    indexes: ["Thank you"],
                    smart: false,
                    action: function (i) {
                        _this.voiceit.say("You are welcome");
                        _this.debug("Thank you Triggered", "info");
                    }
                },

                 {
                     indexes: ["Thank you *"],
                     smart: true,
                     action: function (i) {
                         _this.voiceit.say("You are welcome");
                         _this.debug("Thank you Triggered", "info");
                     }
                 },
                   {
                       indexes: ["Hi"],
                       smart: false,
                       action: function (i) {
                           _this.voiceit.say("Hello " + _this.userName);
                           _this.debug("Thank you Triggered", "info");
                       }
                   },
            ];
            this.dictationDictionary = [
                {
                    dictationId: 'sample',
                    settings: {
                        continuous: true, // Don't stop never because i have https connection
                        onResult: function (text) {
                            _this.debug("Recognized text: ", text, "info");
                        },
                        onStart: function () {
                            _this.debug("Dictation Start", "info");
                        },
                        onEnd: function () {
                            _this.debug("Dictation End", "info");
                        }
                    }
                }
            ];

        }
        init(config) {
            let _this = this;
            let support = this.initialCheck();
            if (!support.voice || !support.speech) {
                if (!support.voice)
                    alert("SpeechRecognition is not supported in this browser.!");
                else if (!support.speech)
                    alert("speechSynthesis is not supported in this browser.!");
                return;
            }

            this.voiceit.addCommands(this.cmdDictionary);
            this.voiceit.addCommands(this.commonDictionary);
            this.voiceit.addCommands(this.appDictionary);
            this.loadModuleDictionary("trade");
            this.getMenuURLList();
            this.bindEvents();
            this.createInfoBar();
            if (this.redirectOutputTo) {
                this.voiceit.redirectRecognizedTextOutput(function(recognized, isFinal) {
                    if (isFinal) {
                        // Nothing
                        $(_this.redirectOutputTo).val("");
                        _this.showInfo("");
                    } else {
                        $(_this.redirectOutputTo).val(recognized);
                        _this.showInfo(recognized);
                    }
                });
            }
            //this.startListening(config);
        }
        loadModuleDictionary(moduleName) {
             
            var dictionary = this.moduleDictionary.filter(x => x.moduleName == moduleName)[0].dictionary;
            if (dictionary != null) {
                this.voiceit.addCommands(dictionary);
            }
            return dictionary;
        }
        startListening(config) {
            debugger;
            if (typeof (config) == 'object')
                this.voiceit.initialize(config);
            else
                this.voiceit.initialize(this.initialize);
            if (this._isVoiceItFirstTime()) {
                this.voiceit.sayRandom(this.randomStartUpMsg);    
            }
            this.showInfoBar();
            this.voiceit.obey();
            this.$startListenBtn.removeClass("ready").addClass("active");
            this.infoBar.$micImage.removeClass("pause").addClass("active");
            fnSetCache("techie", { name: 'techie',isListening:true });
        }
        _isVoiceItFirstTime() {
            if (hasValue(fnGetCache("techie"))) {
                return false;
            }
            else {
                return true;
            }
        }
        getVersion() {
            return "1.0.0"
        }
        debug(e, t) {
            var o = "[v" + this.getVersion() + "] VoiceIt.js";
            if (!0 === this.voiceItProperties.debug)
                switch (t) {
                    case "error":
                        console.log("%c" + o + ":%c " + e, "background: #C12127; color: black;", "color:black;");
                        break;
                    case "warn":
                        console.warn(e);
                        break;
                    case "info":
                        console.log("%c" + o + ":%c " + e, "background: #4285F4; color: #FFFFFF", "color:black;");
                        break;
                    default:
                        console.log("%c" + o + ":%c " + e, "background: #005454; color: #BFF8F8", "color:black;")
                }
        }
        async stopListening() {
            let _this=this;
            //if(_this.voiceit.isRecognizing()){
            //    _this.voiceit.fatality();
            //}
            //if(_this.voiceit.isSpeaking()){
            //    _this.voiceit.shutUp();
            //}
            //this.hideInfoBar();

            function resolveAfter2Seconds() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        if (_this.voiceit.isRecognizing()) {
                            _this.voiceit.fatality();
                        }
                        if (_this.voiceit.isSpeaking()) {
                            _this.voiceit.shutUp();
                        }
                        _this.$startListenBtn.removeClass("active").addClass("ready");
                        _this.infoBar.$micImage.removeClass("active").addClass("pause");
                        _this.hideInfoBar();
                        fnSetCache("techie", { name: 'techie', isListening: false });
                        resolve('stopped');
                    }, 1000);
                });
            }
            _this.debug("Calling StopListening", "info");
            var result = await resolveAfter2Seconds();
            _this.debug(result, "info");

        }
        speak(msg,forceStop) {
            let _this = this;
            if (forceStop == true) {
                if (_this.voiceit.isSpeaking()) {
                    _this.voiceit.shutUp();
                }
            }
            _this.voiceit.say(msg);
        }
        stopSpeak() {
             
            let _this = this;
            if (_this.voiceit.isSpeaking()) {
                _this.voiceit.shutUp();
            }
        }
        restartEngine(callback){
            //to Stop Everything and start all services again.
            let _this = this;
            _this.voiceit.restart().then(() => {
                if (typeof callback == 'function') {
                    callback();
                }
            });
        }
        //VoiceRecognition UI Events & Methods
        _createAppendStyles() {
            var css = 'h1 { background: red; }',
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');
            css = " .voice {                                                                                                       \
                        float: left;                                                                                                         \
                        width: 100%;                                                                                                        \
                        height: 80px;                                                                                                       \
                        background: rgba(250, 250, 250, 4);                                                                                  \
                        position: absolute;                                                                                                  \
                        bottom: 0;                                                                                                           \
                        left: 0;                                                                                                             \
                        z-index: 199;                                                                                                      \
                        box-shadow: 0px -1px 3px 0 rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.09);                                    \
                        }                                                                                                                    \
                        .mic {                                                                                                               \
                        width: 92px;                                                                                                         \
                        display: block;                                                                                                      \
                        float: right;                                                                                                        \
                        margin: 25px 20px 0 0;                                                                                               \
                        border-radius: 50%;                                                                                               \
                        box-shadow: 0px 0px 1px 2px #c3c3c3;                                                                               \
                        }                                                                                                                    \
                        .mic.image {                                                                                                         \
                        background: url(/content/image/mic.png);                                                                           \
                        background-repeat: no-repeat;                                                                                    \
                        background-size: auto;                                                                                             \
                        }                                                                                                                    \
                        .toggle-arrow {                                                                                                    \
                        background-image: url(/content/v2/images/collapse.png);                                                            \
                        width: 25px;                                                                                                         \
                        height: 25px;                                                                                                        \
                        position: absolute;                                                                                                  \
                        top: -25px;                                                                                                          \
                        right: 75px;                                                                                                         \
                        background-repeat: no-repeat;                                                                                    \
                        background-color: #fff;                                                                                            \
                        background-position: center;                                                                                       \
                        }                                                                                                                    \
                        .message {                                                                                                           \
                        width: 95%;                                                                                                         \
                        float: left;                                                                                                         \
                        margin-top: 32px;                                                                                                  \
                        margin-left: 5%;                                                                                                  \
                        }                                                                                                                    \
                        .message.massage-hint {                                                                                            \
                        font-size: 16px;                                                                                                   \
                        width: 15%;                                                                                                         \
                        float: left;                                                                                                         \
                        color: #0277b1;                                                                                                      \
                        }                                                                                                                    \
                        .message.massage-content {                                                                                         \
                        float: left;                                                                                                         \
                        width: 85%;                                                                                                         \
                        font-size: 19px;                                                                                                   \
                        color: #afafaf;                                                                                                      \
                        }                                                                                                                    \
                        svg {                                                                                                                \
                            display: block;                                                                                                  \
                            width: 100 %;                                                                                                    \
                            height: 100 %;                                                                                                   \
                            padding: 0;                                                                                                      \
                            margin: 0;                                                                                                       \
                            position: absolute;                                                                                              \
                        }                                                                                                                    \
                                                                                                                                             \
                        h1 {                                                                                                                 \
                            width: 100 %;                                                                                                    \
                            font - family: sans - serif;                                                                                     \
                            position: absolute;                                                                                              \
                            text - align: center;                                                                                            \
                            color: white;                                                                                                    \
                            font - size: 18px;                                                                                               \
                            top: 40 %;                                                                                                       \
                            opacity: 1;                                                                                                      \
                            transition: opacity 1s ease-in-out;                                                                              \
                            -moz - transition: opacity 1s ease-in-out;                                                                       \
                            -webkit - transition: opacity 1s ease-in-out;                                                                    \
                        }                                                                                                                    \
                                                                                                                                             \
                        h1 a {                                                                                                               \
                            color: #48b1f4;                                                                                                  \
                            text - decoration: none;                                                                                         \
                        }                                                                                                                    \
                                                                                                                                             \
                        path {                                                                                                               \
                            stroke - linecap: square;                                                                                        \
                            stroke: white;                                                                                                   \
                            stroke - width: 0.5px;                                                                                           \
                        }                                                                                                                    \
                    ";

            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);

        }
        createInfoBar() {
            let _this = this; 
            _this.infoBar = {};
            _this.infoBar.$infoContainer = $('<div class="voice" style="display: block;"><div id="voiceTogglerCont"><span class="toggle-arrow" id="voiceToggler"></span></div><section class="voiceInfo1"><div class="row"><div class="col-md-4"><div id="voiceInformation"><div class="message"><p class="massage-hint" id="voiceHeader"></p></div></div></div><div class="col-md-5"><div class="message"><p id="voiceInfo" class="massage-content">Welcome to Voiceit</p></div></div><div class="col-md-3"><div id="voiceMic"><span class="mic"><span class="imgCont" id="voiceImage" style="height: 60px; width: 60px; position: absolute;"><span class="image" style="height: 100%; width: 100%; position: inherit; background-position: center center; background-size: contain;"></span> </span></span></div><div id="voiceAnimator"></div></div></div></section></div>');
            _this.informationBarContainer ? $(_this.informationBarContainer).append(_this.infoBar.$infoContainer) : $("body").append(_this.infoBar.$infoContainer);
            _this.infoBar.$toggleArrow = $("#voiceToggler");
            _this.infoBar.$message = $('<div class="message"></div >');
            _this.infoBar.$messageHeader = $("#voiceHeader");
            _this.showHeaderInfo("Ready : Click Mic to Listen");
            _this.infoBar.$messageText = $("#voiceInfo");
            _this.showInfo("");// Intial Info goes here
            _this.infoBar.$mic = $("#voiceImage");
            _this.infoBar.$micImage = $("#voiceImage .image");
            
            //_this._createAppendStyles();
            _this.infoBar.$mic.find(".imgCont").css({
                height: "100px",
                width: "100px",
                position:"absolute",
            });
            _this.infoBar.$mic.find(".image").css({
                height: "100%",
                width: "100%",
                position: "inherit",
                backgroundPosition: "center",
                backgroundSize: "contain",
            });
            _this.infoBar.$toggleArrow.off().on("click", function () {
                if (_this.infoBar.$infoContainer.is(":visible")) {
                    _this.hideInfoBar();
                }
                else {
                    _this.showInfoBar();
                }
            });

            //var isAnimatorRequired = true;
            //if (isAnimatorRequired)
            //    _this.createVoiceAnimator($(document));
        }
        showInfoBar() {
            this.infoBar.$infoContainer.slideDown();
        }
        hideInfoBar() {
            this.infoBar.$infoContainer.slideUp();
        }
        showInfo(msg) {
            if (msg != null & msg != undefined) {
                this.infoBar.$messageText.text(msg);
            }
        }
        showHeaderInfo(msg) {
            if (msg != null & msg != undefined) {
                this.infoBar.$messageHeader.text(msg);
            }
        }
        bindEvents() {
            let _this = this;
             
            if(!!this.$startListenBtn){
                this.$startListenBtn.on(this.events.default.CLICK,function(){ // Toggle Listening/Not Listening.
                    if (_this.voiceit.isRecognizing()) {
                        _this.$startListenBtn.removeClass("active").addClass("ready");
                        _this.stopListening();
                    }
                    else {
                        _this.$startListenBtn.removeClass("ready").addClass("active");
                        _this.startListening();
                    }
                })
            }
            _this.voiceit.when(_this.events.voiceit.SPEECH_SYNTHESIS_START, function () {
                _this.showHeaderInfo("Speaking");
            });
            _this.voiceit.when(_this.events.voiceit.SPEECH_SYNTHESIS_END, function () {
                _this.showHeaderInfo("");
                
            });

            _this.voiceit.when(_this.events.voiceit.COMMAND_RECOGNITION_START, function () {
                // 
                _this.showInfoBar();
                _this.showHeaderInfo("Listening");
            });
            _this.voiceit.when(_this.events.voiceit.COMMAND_RECOGNITION_END,function (status) {
                if (status.code == "continuous_mode_enabled") {
                    _this.debug("You're using continuous mode, therefore this callbacks is more likely to don't be used", "info");
                } else if (status.code == "continuous_mode_disabled") {
                    _this.debug("The continuous mode is disabled. Voiceit will not listen anymore till the next initialization", "info");
                }
            });
            _this.voiceit.when(_this.events.voiceit.NOT_COMMAND_MATCHED, function () {
                _this.showHeaderInfo("Command Not Matched.!");
                setTimeout(function () {
                    _this.showHeaderInfo("");
                }, 500);

            });
            _this.voiceit.when(_this.events.voiceit.COMMAND_MATCHED, function () {
                /*
                var successCommand = ["Alright. Executing your command.", "Ok Executing your command", "Cool. Executing your command.", "Executing your command"];
                var randomeMessage = successCommand[(Math.floor(Math.random() * (successCommand.length - 0 + 1) + 0))];
                _this.speak(randomeMessage);
                _this.infoBar.$messageHeader.text("Command Matched.!");
                
                */
            });
            _this.voiceit.when(_this.events.voiceit.TEXT_RECOGNIZED, function (a) {
                _this.showInfo(a);
                
            });

            _this.voiceit.when("ERROR", function (error) {
                /* *****************
                info-blocked
                info-denied
                no-speech
                aborted
                audio-capture
                network
                not-allowed
                service-not-allowed
                bad-grammar
                language-not-supported
                recognition_overlap
                */
                if (error.code == "network") {
                    _this.debug("An error ocurred, voiceit cannot work without internet connection !", "info");
                }

                if (error.code == "audio-capture") {
                    _this.debug("An audio-capture error ocurred, voiceit cannot work without a microphone", "info");
                }

                if (error.code == "not-allowed") {
                    _this.debug("An audio not allowed, it seems the access to your microphone is denied", "info");
                }
                if (error.code == "recognition_overlap") {
                    _this.debug("recognition_overlap", "info");
                }
                _this.debug(error.message, "info");
            });


        }
        /**********************************************
        * showPrompts
        * @param {String} question
        * @param {Object} options options={isSmart:boolean,option:Array}
        * @param {Object} callbacklist callbacklist = {
                beforePrompt: fn,
                onStartPrompt: fn,
                onEndPrompt: fn,
                onMatchBefore: fn,
                onMatchAfter:fn,
            }
        * @returns {undefined}
        *************************************************/
        showPrompts(question, options, callbacklist) {
            let _this = this;
            debugger;
            /*
            callbacklist = {
                beforePrompt: fn,
                onStartPrompt: fn,
                onEndPrompt: fn,
                onMatchBefore: fn,
                onMatchAfter:fn,
            }
            */
            this.voiceit.newPrompt({
                question: question,
                //We set the smart property to true to accept wildcards
                smart: options.isSmart != undefined ? options.isSmart : false,
                options: options.option,
                beforePrompt: () => {
                    _this.debug("Before ask");
                    if (typeof callbacklist == "object") {
                        if (callbacklist.beforePrompt && typeof callbacklist.beforePrompt == 'function') {
                            (function(i, wildcard, callback) {
                                callback(i, wildcard);
                            })(i, wildcard, callbacklist.beforePrompt);
                        }
                    }
                },
                onStartPrompt: () => {
                    _this.debug("The prompt is being executed");
                    if (typeof callbacklist == "object") {
                        if (callbacklist.onStartPrompt && typeof callbacklist.onStartPrompt == 'function') {
                            (function(i, wildcard, callback) {
                                callback(i, wildcard);
                            })(i, wildcard, callbacklist.onStartPrompt);
                        }
                    }
                },
                onEndPrompt: () => {
                    _this.debug("The prompt has been executed succesfully");
                    if (typeof callbacklist == "object") {
                        if (callbacklist.onEndPrompt && typeof callbacklist.onEndPrompt == 'function') {
                            (function(i, wildcard, callback) {
                                callback(i, wildcard);
                            })(i, wildcard, callbacklist.onEndPrompt);
                        }
                    }

                },
                onMatch: (i, wildcard) => {// i returns the index of the given options
                    var action;
                     
                    action = () => {
                         
                        if (typeof callbacklist == "object") {
                            if (callbacklist.onMatchBefore && typeof callbacklist.onMatchBefore == 'function') {
                                (function(i, wildcard, callback) {
                                    callback(i, wildcard);
                                })(i, wildcard, callbacklist.onMatchBefore);
                            }
                        }
                        if (typeof callbacklist == "object") {
                            if (callbacklist.onMatchAfter && typeof callbacklist.onMatchAfter == 'function') {
                                (function(i, wildcard,callback) {
                                    callback(i, wildcard);
                                })(i, wildcard, callbacklist.onMatchAfter);
                            }
                        }
                    };

                    // A function needs to be returned in onMatch event
                    // in order to accomplish what you want to execute
                    return action;
                }
            });
        }
        addCommands(commands, dictionaryType) {
            if (typeof this[dictionaryType] != "undefined") {
                this[dictionaryType].push(commands);
                this.voiceit.addCommands(commands);
            }
        }
        get greet() {
            var today = new Date()
            var curHr = today.getHours();
            if (curHr < 12) {
                return 'good morning, ' + this.userName;
            } else if (curHr < 18) {
                return 'good afternoon, ' + this.userName;
            } else {
                return 'good evening, ' + this.userName ;
            }
        };
        get userName() {
            return $("#DisplayName").text();
        };
        //StartGridRelatedMethods
        /**
        * Get Current Listing screen Jquery Object
        * @returns {JQuery} JqueryObject
        */
        getCurrentGrid() {
            return $("[control-type='grid']");
        }
        //endGridRelatedMethods
        //FilterMethods
        applyGridFilter(filterData,$grid) {
            let _this = this;
            if (filterData.length > 0) {
                //_this.removeFilter($grid);
                _this.createFilter(filterData,$grid);
                return true;
            }


        }
        createFilterProperties(filtervalue, filtercondition, filterType, filterColumn) {
             
            let _this = this;
            /*
            var obj =[{
                filters:[{
                    filtervalue:'Addax',
                    filtercondition:'contains',
                    filterType:'stringfilter',
                    filter_or_operator:1,
                    filterColumn:'Counterparty'
                }],
                fnameFilterGroupOperator:'or',
            }];
            var stringcomparisonoperators = ['EMPTY', 'NOT_EMPTY', 'CONTAINS', 'CONTAINS_CASE_SENSITIVE',
            'DOES_NOT_CONTAIN', 'DOES_NOT_CONTAIN_CASE_SENSITIVE', 'STARTS_WITH', 'STARTS_WITH_CASE_SENSITIVE',
            'ENDS_WITH', 'ENDS_WITH_CASE_SENSITIVE', 'EQUAL', 'EQUAL_CASE_SENSITIVE', 'NULL', 'NOT_NULL'];
            var numericcomparisonoperators = ['EQUAL', 'NOT_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'NULL', 'NOT_NULL'];
            var datecomparisonoperators = ['EQUAL', 'NOT_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'NULL', 'NOT_NULL'];
            var booleancomparisonoperators = ['EQUAL', 'NOT_EQUAL'];
            */

            function getTemplate(type) {
                var filter = {
                    filtervalue: '',
                    filtercondition: 'contains',
                    filterType: '',
                    filter_or_operator: 1,
                    filterColumn: ''
                }
                var filterGroup = {
                    filters: [],
                    fnameFilterGroupOperator: 'and',
                };

                if (type == 'group') {
                    return $.extend(true, {}, filterGroup);
                }
                else if (type = 'filter') {
                    return $.extend(true, {}, filter);
                }
            }
            function setTemplate(template, obj, type) {
                if (type == 'group') {
                    if (obj.filters) {
                        template.filters.push(obj.filters);
                    }
                    if (obj.fnameFilterGroupOperator) {
                        template.fnameFilterGroupOperator = obj.fnameFilterGroupOperator;
                    }
                }
                else if (type == 'filter') {
                }
            }

            function _createFilterProperties(filtervalue, filtercondition, filterType, filterColumn) {
                let filterGroup = getTemplate("group");
                let filter = getTemplate("filter");
                filter.filtervalue = filtervalue;
                filter.filtercondition = filtercondition;
                filter.filterType = filterType;
                filter.filterColumn = filterColumn;
                filterGroup.filters.push(filter);
                return filterGroup;
            }

            return _createFilterProperties(filtervalue, filtercondition, filterType, filterColumn);

        }
        removeFilter($grid) {
            let _this = this;
             
            $("#divfilter" + $grid.attr('id')).html('');
            var filtersinfo = $grid.jqxGrid('getfilterinformation');
            $.each(filtersinfo, function (i, obj) {
                $grid.jqxGrid('removefilter', obj.filtercolumn, false);
            });
        }
        createFilter(filterData,$grid) {
            let _this = this;
             
            function formFilter(obj) {
                let fnameFilterGroup = new $.jqx.filter();
                fnameFilterGroup.operator = obj.fnameFilterGroupOperator;
                for (var i = 0; i < obj.filters.length; i++) {
                    let filter_or_operator = obj.filters[i].filter_or_operator;
                    let filtervalue = obj.filters[i].filtervalue;
                    let filtercondition = obj.filters[i].filtercondition;
                    let fnameFilter1 = fnameFilterGroup.createfilter(obj.filters[i].filterType, filtervalue, filtercondition);
                    fnameFilterGroup.addfilter(filter_or_operator, fnameFilter1);
                }
                return fnameFilterGroup;
            }
            function addFilter($grid, column, fnameFilterGroup) {
                $grid.jqxGrid('addfilter', column, fnameFilterGroup);
            }
            function applyFilter($grid) {
                $grid.jqxGrid('applyfilters');
            }
            function main(filterData) {
                 
                for (var i = 0; i < filterData.length; i++) {
                    var obj = filterData[i];
                    var fnameFilterGroup = formFilter(obj);
                    addFilter($grid, obj.filters[0].filterColumn, fnameFilterGroup);
                }
                applyFilter($grid);
            }
            main(filterData);
           
        }
//END-FilterMethods

/**
Convert String Literals to Numbers

*/
        convertStringToNumber(value){
            var hashtable = {
                0:['zero'],
                1:['one','first','i'],
                2:['second','2nd','ii'],
                3:['third','3rd','iii'],
                4:['four','fourth','4th','iv'],
                5:['five','fifth','5th','v'],
                6:['six','sixth','6th','vi'],
                7:['seven','7th','vii'],
                8:['eight','8th','viii'],
                9:['nine','nineth','9th','ix'],
                10:['ten','tenth','10th','x']
            },result=null;

            var data = Object.values(hashtable);
            for(var i=0;i<data.length;i++){
                if(data[i].indexOf(value.toLowerCase()) !=-1){
                    result = i;
                    break;
                }

            }
            return result;
        }
        /**
        * Get Menu Mapping List Dynamically
        * @returns {Array} MenuList
        */
        getMenuURLList() {
            var _this = this;
             _this.MenuList = [];

            $('ul .dropdown-menu li a').each(function (i, obj) {
                _this.MenuList.push({ menuName: obj.innerText ,url: obj.hash,});
             });
            return _this.MenuList;
        }
        /**
        * Trigger Action Buttons.
        *
        *
        * @param {String} Action
        * @param {String} value
        * @returns {undefined}
        */
        triggerAction(Action, value) {
            var _this = this;
            //Private Methods
            var isControlEnabled = function(ID) {
                return $("#" + ID).attr("aria-disabled") == "false" ? true : false;
            }

            switch (Action.toLowerCase()) {
                //Grid Events
                case 'savepreference': 
                     
                    var $gridElement = this.getCurrentGrid();
                    var $button = $("#btnSaveState" + $gridElement.attr('id'));
                    $button.trigger("click");
                    break;
                case 'exportxl':
                    var $gridElement = this.getCurrentGrid();
                    var $button = $("#btnExportExcel" + $gridElement.attr('id'));
                    $button.trigger("click");
                    break;
                case 'clearfilter':
                    var $gridElement = this.getCurrentGrid();
                    var $button = $("#btnclearfilter" + $gridElement.attr('id'));
                    $button.trigger("click");
                    break;
                case 'addnew':
                    var $gridElement = this.getCurrentGrid();
                    var $button = $("#btnAddNew" + $gridElement.attr('id'));
                    $button.trigger("click");
                    break;
                case 'search':
                    var $button = $("#btnSearch");
                    var $searchinput = $("#txtFiltervalue");
                    $searchinput.val(value);
                    $button.trigger("click");
                    break;
                case 'clearsearch':
                    var $button = $("#btnClear");
                    var $searchinput = $("#txtFiltervalue");
                    //$searchinput.val("");
                    $button.trigger("click");
                    break;
                case 'nextpage':
                    var $gridElement = this.getCurrentGrid();
                    $gridElement.jqxGrid('gotonextpage');

                    break;
                case 'previouspage':
                    var $gridElement = this.getCurrentGrid();
                    $gridElement.jqxGrid('gotoprevpage');
                    break;
                case 'goto':
                    var $gridElement = this.getCurrentGrid();
                    $gridElement.jqxGrid('gotopage', value);
                    break;
                case 'showrows':
                    break;
                case 'selectrows':
                    var $gridElement = this.getCurrentGrid();
                    if (!isNaN(value)) {
                        $gridElement.jqxGrid('clearselection');
                        $gridElement.jqxGrid('selectrow', value);
                    }
                    else {
                        _this.debug("Value is not a number", "info");
                    }
                    break;
                case 'moveup':
                    debugger;
                    var $gridElement = this.getCurrentGrid();
                    if ($gridElement.jqxGrid('getselectedrowindex') != -1) {
                        var row = $gridElement.jqxGrid('getselectedrowindex') - 1;
                        $gridElement.jqxGrid('clearselection');
                        $gridElement.jqxGrid('selectrow', row);
                    }
                    else {
                        _this.debug("First select row to move ", "info");
                    }
                    break;
                case 'movedown':
                    var $gridElement = this.getCurrentGrid();
                    if ($gridElement.jqxGrid('getselectedrowindex') != -1) {
                        var row = $gridElement.jqxGrid('getselectedrowindex') + 1;
                        $gridElement.jqxGrid('clearselection');
                        $gridElement.jqxGrid('selectrow', row);
                    }
                    else {
                        _this.debug("First select row to move ", "info");
                    }
                    break;

                case 'clearselection':
                    var $gridElement = this.getCurrentGrid();
                        $gridElement.jqxGrid('clearselection');
                        break;
                case 'editselection':
                    var $gridElement = this.getCurrentGrid();
                    var selectedRowIndex = $gridElement.jqxGrid('getselectedrowindex');
                    var gridId = $gridElement.attr("id");
                    var $editCell = $("#row" + selectedRowIndex +""+ gridId +" [role='gridcell']").filter((a, b) => {
                        return $(b).find(".fa-pencil").length > 0
                    })
                    $editCell.find('.fa-pencil').parent().trigger("click");
                    break;
                case 'copyselection':
                    var $gridElement = this.getCurrentGrid();
                    var selectedRowIndex = $gridElement.jqxGrid('getselectedrowindex');
                    var gridId = $gridElement.attr("id");
                    var $editCell = $("#row" + selectedRowIndex + "" + gridId + " [role='gridcell']").filter((a, b) => {
                        return $(b).find(".fa-copy").length > 0
                    })
                    $editCell.find('.fa-copy').parent().trigger("click");
                    break;
                case 'escapemodel':
                    $(".modal:visible").modal("hide");
                    $('.modal-backdrop').hide(); 
                    break;
                //Menu Events
                case 'refreshmenu':
                    var $button = $("#refreshMenu");
                    $button.trigger("click");
                    break;
                case 'refreshcache':
                    var $button = $("#refreshCache");
                    $button.trigger("click");
                    break;
                case 'signout':
                    var $button = $(".navbar-right-userprofile ul[role='menu'] .fa-sign-out").parent();
                    $button.trigger("click");
                    break;
                case 'userprofile':
                    var $button = $(".navbar-right-userprofile ul[role='menu'] .fa-userst").parent();
                    $button.trigger("click");
                    break;
                case 'globalsearch':
                    debugger;
                    $("#voiceModel").remove();
                    var globalSearchMethods = _this._GlobalSearchfn();
                    _this.showModel("Global Search", globalSearchMethods.searchContent().Content);
                    $("#btnglobalSearch").click(globalSearchMethods.ClickSearch);
                    globalSearchMethods.ClickSearch();
                    break;
                case 'globalsearchfilter':
                    debugger;
                    var controlId = 'GlobalsearchPopup', companyValue, counterpartyValue;
                    function getValues(keyword, string) {
                        if (string.indexOf(keyword) > -1) {
                            return string.replace(keyword, "").replace("by", "").trim();
                        }
                        return null;
                    }
                    if (value.indexOf('and') > -1) { // two commands
                        var t1 = value.split("and")[0], t2 = value.split("and")[1];
                        companyValue = getValues("company", t1) ? getValues("company", t1) : getValues("company", t2) ? getValues("company", t2) : null;
                        counterpartyValue = getValues("counterparty", t1) ? getValues("counterparty", t1) : getValues("counterparty", t2) ? getValues("counterparty", t2) : null;
                    }
                    else
                    {
                        companyValue = getValues("company", value) ? getValues("company", value) : null;
                        counterpartyValue = getValues("counterparty", value) ? getValues("counterparty", value) : null;
                    }
                    var GSCompany = companyValue, GSCounterparty = counterpartyValue;
                    $("#voiceModel").remove();
                    var globalSearchMethods = _this._GlobalSearchfn();
                    _this.showModel("Global Search", globalSearchMethods.searchContent().Content);
                    $("#btnglobalSearch").click(globalSearchMethods.ClickSearch);
                    $("#" + globalSearchMethods.searchContent().globalsearchCompany).val(GSCompany);
                    $("#" + globalSearchMethods.searchContent().globalsearchCounterparty).val(GSCounterparty);
                    globalSearchMethods.ClickSearch();
                    break;
                case 'openemaillog':
                    debugger;
                    _this.openURL(location.origin + '/Master/Emaillog/SearchEmaillog');
                    break;
                case 'openpage':
                    debugger;
                    if (_this.MenuList.length < 15) {
                        _this.getMenuURLList();
                    }
                    var menu = _this.MenuList.filter(x => x.menuName == value)[0];
                    if (menu != null) { // Exact Match
                        _this.openURL(location.origin + "/V2/" + menu.url);
                    }
                    else {
                        var matchingMenu = [];
                        _this.MenuList.forEach(function (obj, index) {
                            if (obj.menuName.toLowerCase().indexOf(value.toLowerCase()) != -1)
                                matchingMenu.push(obj);

                        });

                        if (matchingMenu != null && matchingMenu.length > 0) { // Exact Match
                            _this.openURL(location.origin + "/V2/" + matchingMenu[0].url);
                        }
                        //createDialog to show matchingMenu : Did you you mean?
                    }
                    break;
                //ScrollEvents
                case 'scrollbottom':
                    $("html, body").animate({ scrollTop: $(document).height() - $(window).height() });
                    break;
                case 'scrolltop':
                    $("html, body").animate({ scrollTop: 0 });
                    break;
                case 'scrollup':
                    $(document).scrollTop($(document).scrollTop() - 150);
                    break;
                case 'scrolldown':
                    $(document).scrollTop($(document).scrollTop() + 150);
                    break;
                case 'scrollleft': 
                    var scrollthreshold = 350;
                    var $gridElement = this.getCurrentGrid();
                    $gridElement.jqxGrid('scrolloffset', 0, $gridElement.jqxGrid('scrollposition').left - scrollthreshold);
                    break;
                case 'scrollright':
                    var scrollthreshold = 350;
                    var $gridElement = this.getCurrentGrid();
                    $gridElement.jqxGrid('scrolloffset', 0, $gridElement.jqxGrid('scrollposition').left + scrollthreshold);
                    break;
                //Browser Navigation Events
                case 'goback':
                    history.back();
                    break;
                case 'goforward':
                    history.forward();
                    break;
                case 'refreshpage':
                    location.reload(false);
                    break;
                case 'reloadpage':
                    location.reload(true);
                    break;
                //Trade Screen Events
                case 'selectdeal':
                    if (value.toLowerCase().indexOf('sell') > -1 || value.toLowerCase().indexOf('cell') > -1) {
                        var controlId = "radioBuy";
                        if (isControlEnabled(controlId)) {
                            model.Sell(true);
                        }
                        else {
                            _this.speak("You can not edit disabled controls");
                        }
                    }
                    else if (value.toLowerCase().indexOf('buy') > -1 || value.toLowerCase().indexOf('by') > -1) {
                        var controlId = "radioSell";
                        if (isControlEnabled(controlId)) {
                            model.Buy(true);
                        }
                        else {
                            _this.speak("You can not edit disabled controls");
                        }
                    }
                    break;
                case 'addproduct':
                    var controlId = 'imageids'; // Need to check click method execution contition.
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'copytrade':
                    var controlId = 'btnCopyDeal';
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'confirmationemail':
                    var controlId='TradeRecapEmail'
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'sendconfirmationemail':
                    var controlId = 'btnSendEmail'
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'customersupport':
                    var controlId = 'Customersupport'
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'printconfirmationemail':
                   // window.print();
                    var controlId = 'btnPrint'
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    //event.keyCode = 13;
                    break;
                    
                case 'newtrade':
                    var controlId = 'btnNewDeal';
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'savetrade':
                    var controlId = 'btnSaveDeal';
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'deletetrade':
                    var controlId = 'btnDeleted';
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'markaslost':
                    var controlId = 'btnLost';
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'confirmTrade':
                    var controlId = 'btnConfirmed';
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).trigger("click");
                    break;
                case 'expandaddcosts':
                    $("#AccordionOne").trigger("click");
                    break;
                case 'expandnotes': 
                    $("#AccordionTwo").trigger("click");
                    break; 
                case 'expandotherdetails':
                    $("#AccordionThree").trigger("click");
                    break;
                case 'expanddocumentation':
                    $("#AccordionFour").trigger("click");
                    break;
                case 'expandauditlog':
                    $("#AccordionFive").trigger("click");
                    break;
                case 'traderecapmail':
                    var controlId = 'TradeRecapEmail';
                    if ($("#" + controlId).parent().css("display") !="none")
                        $("#" + controlId).trigger("click");
                    break; 
                case 'traderemarks':                   
                    var controlId = 'txtSpecialRemarks'
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).val(value).trigger("blur");
                    break;
                case 'tradeinternalcomment':
                    var controlId = 'txtFinanceNotes'
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).val(value).trigger("blur");
                    break;
                case 'tradeexternalcomment':
                    var controlId = 'txtModificationNotes'
                    if ($("#" + controlId).prop("disabled") == false || $("#" + controlId).attr("disabled") != 'disabled')
                        $("#" + controlId).val(value).trigger("blur");
                    break;
                     

                //END TRADE EVENTS
                //ReportSettings
                case 'report_dailypnl':
                    var tempURL = GetOAuthURL("http://localhost:9001/V2" + "/MarineServiceRestFul.svc/CommonService/remoteProcessorService");
                    var url = GetOAuthURL(serviceURL + "/MarineServiceRestFul.svc/CommonService/remoteProcessorService");
                    var _data = {
                        recognized: '',
                        ActionName: "getdailypnl",
                    };
                    var data = _this.remoteProcessorService(tempURL, _data, { async: true }, function (result) {
                        debugger;
                        var resultData = JSON.parse(result.value);
                        var msg = Number(resultData.PnL).toString() ;
                        _this.speak("Today's PNL is " + msg);
                    });
                    break;
                case 'report_exposure':
                    var tempURL = GetOAuthURL("http://localhost:9001/V2" + "/MarineServiceRestFul.svc/CommonService/remoteProcessorService");
                    var url = GetOAuthURL(serviceURL + "/MarineServiceRestFul.svc/CommonService/remoteProcessorService");
                    var _data = {
                        recognized: '',
                        ActionName: "getexposure",
                    };
                    var data = _this.remoteProcessorService(tempURL, _data, { async: true }, function (result) {
                        debugger;
                        var resultData = JSON.parse(result.value);
                        var msg = Number(resultData.VolumeExposure).toString() + " " + resultData.VolumeUOM;
                        //_this.speak("Today's EXPOSURE is " + Number(result.value).toString());
                        _this.speak("Today's EXPOSURE is " + msg);
                    });
                    break;
                //Utitity Commands
                case 'availablecommands':
                    var message = '<table><thead><tr><th>SNo</th><th>Command</th><th>Description</th></tr></thead><tbody>';
                    var commands = _this.voiceit.getAvailableCommands();
                    for (var i = 0; i < commands.length; i++) {
                        var desc = commands[i].description ? commands[i].description : "",
                            c = commands[i].indexes;
                        message += "<tr style='border: 1px solid black;'><td>" + (i+1) + "</td><td>" + c + "</td><td>" + desc + "</td></tr>";
                    }
                    message+="</tbody></table>"
                    _this.showModel("Glossary of Voice commands", message);
                    break;
                case 'takescreenshot':
                    _this.takeScreenShot().generate();
                    break;
            }
        }

        openURL(url) {
            debugger;
            let _this = this;
            _this.stopListening().then(function () {
                fnSetCache("techie", { name: 'techie', isListening: true });
                window.open(url);
            });
        }
        showModel(header, message) {
            debugger;
            if ($("#voiceModel").length == 0) {
                var $myModel = $('<div class="modal fade" id="voiceModel" role="dialog"><div class="modal-dialog"><div class="modal-content">           \
                            <div class="modal-header">                                                                                                  \
                                <button type="button" class="close" data-dismiss="modal">&times;</button>                                               \
                                <h4 class="modal-title" id="voiceModelHeader"></h4>                                                                     \
                            </div>                                                                                                                      \
                            <div class="modal-body">                                                                                                    \
                                <div id="voiceModelMessage"></div>                                                                                      \
                            </div>                                                                                                                      \
                            <div class="modal-footer">                                                                                                  \
                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>                                       \
                            </div>                                                                                                                      \
                        </div>                                                                                                                          \
                    </div>                                                                                                                              \
                </div>');                                                                                                                               
                $myModel.find("#voiceModelHeader").html(header);
                $myModel.find("#voiceModelMessage").html(message);
                $("body").append($myModel);
                $('.modal-backdrop').hide(); 
                $myModel.modal("show");
            }
            else {
                $("#voiceModelHeader").html(header);
                $("#voiceModelMessage").html(message);
                $("#voiceModel").modal("show");
            }
        }
        _GlobalSearchfn() {
            /*PRIVATE METHODS***********************************/
            function searchContent() {

                var searchContent = '<div role="form" class="form-horizontal">                                                        \
                        <div class="col-md-12">                                                                                         \
                            <div class="row">                                                                                           \
                                Counterparty Name :<input type="text" name="globalsearchCounterparty" id="globalsearchCounterparty" value="" />                       \
                                Company Name:<input type="text" name="globalsearchCompany" id="globalsearchCompany" value="" />                             \
                                <input type="button" class="buttonOne" value="Search" id="btnglobalSearch" />   \
                            </div><br />                                                                                                \
                        </div>                                                                                                          \
                        <div class="row">                                                                                               \
                            <div id="list" width="100%"></div><br />                                                                    \
                        </div>                                                                                                          \
                        <div class="row">                                                                                               \
                            <div id="listSwap" width="100%"></div><br />                                                                \
                        </div>                                                                                                          \
                        <div class="row">                                                                                               \
                            <div id="listEnquiry"></div>                                                                                \
                        </div>                                                                                                          \
                        <div class="row">                                                                                               \
                                                                                                                                        \
                        </div>                                                                                                          \
                    </div>';      
                return {
                    Content: searchContent,
                    globalsearchCounterparty: "globalsearchCounterparty",
                    globalsearchCompany:"globalsearchCompany",

                };
            }
            function ClickSearch() {
                LoadProcurementOrder();
                LoadEnquiry();
                LoadSwap();
            }
            function LoadProcurementOrder() {
                debugger;
                var I1 = $("#globalsearchCounterparty").val().trim();
                var I2 = $("#globalsearchCompany").val().trim();
                var source = {
                    datatype: "json",
                    datafields: [
                        { name: 'ProcurementOrderId' },
                        { name: 'RequestId' },
                        { name: 'OrderDate' },
                        { name: 'VesselName' },
                        { name: 'CompanyName' },
                        { name: 'CounterpartyName' },
                        { name: 'StatusCode' },
                        { name: 'LastUpdatedBy' }],
                    data: { 'CounterpartyName': I1, 'CompanyName': I2 },
                    url: '/Admin/GetAdminData'
                };

                var dataAdapter = new $.jqx.dataAdapter(source, { contentType: 'application/json; charset=utf-8' });
                var cellsrenderer = function (row, column, value) {
                    return '<div><a href="javascript:void(0)" onclick="fnEditPhysicalDealList(\'' + value + '\')">' + value + '</a></div>'
                }
                $("#list").jqxGrid({
                    width: '100%',
                    height: '320px',
                    source: dataAdapter,
                    theme: 'advanced',
                    columns: [
                        { text: 'ProcurementOrderId', datafield: 'ProcurementOrderId', cellsrenderer: cellsrenderer, width: 250 },
                        { text: 'RequestId', datafield: 'RequestId', width: 200 },
                        { text: 'OrderDate', datafield: 'OrderDate', width: 150 },
                        { text: 'VesselName', datafield: 'VesselName', width: 250 },
                        { text: 'CompanyName', datafield: 'CompanyName', width: 200 },
                        { text: 'CounterpartyName', datafield: 'CounterpartyName', width: 200 },
                        { text: 'StatusCode', datafield: 'StatusCode', width: 150 },
                        { text: 'LastUpdatedBy', datafield: 'LastUpdatedBy', width: 250 }

                    ],
                    pageable: true,
                    filterable: true,
                    sortable: true
                });
            }
            function LoadEnquiry() {
                var I1 = $("#globalsearchCounterparty").val().trim();
                var I2 = $("#globalsearchCompany").val().trim();
                var source1 = {
                    datatype: "json",
                    datafields: [
                        { name: 'RequestId' },
                        { name: 'Requestdate' },
                        { name: 'VesselName' },
                        { name: 'CompanyName' },
                        { name: 'CounterpartyName' },
                        { name: 'StatusCode' },
                        { name: 'LastUpdatedBy' }],
                    data: { 'CounterpartyName': I1, 'CompanyName': I2 },
                    url: '/Admin/GetEnquiryData'
                };

                var dataAdapter1 = new $.jqx.dataAdapter(source1, { contentType: 'application/json; charset=utf-8' });
                var cellsrenderer = function (row, column, value) {
                    return '<div><a href="javascript:void(0)" onclick="fnEditEnquiryList(\'' + value + '\')">' + value + '</a></div>'
                }
                $("#listEnquiry").jqxGrid({
                    width: '100%',
                    height: '320px',
                    source: dataAdapter1,
                    theme: 'advanced',
                    columns: [
                        { text: 'RequestId', datafield: 'RequestId', cellsrenderer: cellsrenderer, width: 200 },
                        { text: 'Requestdate', datafield: 'Requestdate', width: 150 },
                        { text: 'VesselName', datafield: 'VesselName', width: 250 },
                        { text: 'CompanyName', datafield: 'CompanyName', width: 200 },
                        { text: 'CounterpartyName', datafield: 'CounterpartyName', width: 200 },
                        { text: 'StatusCode', datafield: 'StatusCode', width: 150 },
                        { text: 'LastUpdatedBy', datafield: 'LastUpdatedBy', width: 250 }

                    ],
                    pageable: true,
                    filterable: true,
                    sortable: true
                });
            }
            function LoadSwap() {
                var I1 = $("#globalsearchCounterparty").val().trim();
                var I2 = $("#globalsearchCompany").val().trim();
                var source = {
                    datatype: "json",
                    datafields: [
                        { name: 'ProcurementDealId' },
                        { name: 'DealDate' },
                        { name: 'CompanyName' },
                        { name: 'CounterpartyName' },
                        { name: 'StatusCode' },
                        { name: 'LastUpdatedBy' }],
                    data: { 'CounterpartyName': I1, 'CompanyName': I2 },
                    url: '/Admin/GetSwapData'
                };

                var dataAdapter = new $.jqx.dataAdapter(source, { contentType: 'application/json; charset=utf-8' });
                var cellsrenderer = function (row, column, value) {
                    return '<div><a href="javascript:void(0)" onclick="fnEditSwapDealList(\'' + value + '\')">' + value + '</a></div>'
                }
                $("#listSwap").jqxGrid({
                    width: '100%',
                    height: '320px',
                    source: dataAdapter,
                    theme: 'advanced',
                    columns: [
                        { text: 'ProcurementDealId', datafield: 'ProcurementDealId', cellsrenderer: cellsrenderer, width: 250 },
                        { text: 'DealDate', datafield: 'DealDate', width: 150 },
                        { text: 'CompanyName', datafield: 'CompanyName', width: 200 },
                        { text: 'CounterpartyName', datafield: 'CounterpartyName', width: 200 },
                        { text: 'StatusCode', datafield: 'StatusCode', width: 150 },
                        { text: 'LastUpdatedBy', datafield: 'LastUpdatedBy', width: 250 }

                    ],
                    pageable: true,
                    filterable: true,
                    sortable: true
                });
            }
                    /************************************/
            return {
                ClickSearch: ClickSearch,
                LoadProcurementOrder: LoadProcurementOrder,
                LoadEnquiry: LoadEnquiry,
                LoadSwap: LoadSwap,
                searchContent: searchContent
            }
        }
        /**
        Simulate Instruction
        */
        simulateVoice(commandText) {
            let _this = this;
            _this.voiceit.simulateInstruction(commandText); //Simulat
        }
        remoteProcessorService(serviceURL, data, serviceConfig, callback) {
            debugger;
            let _this = this;
            var result = null;
            if (serviceConfig && serviceConfig.async == true) {
                _this.speak("Be relax .we will update you as soon as data comes in");
            }
            var _data = "recognized=" + data.recognized + "&ActionName=" + data.ActionName;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: serviceURL,
                data: _data,
                async: serviceConfig && serviceConfig.async ? serviceConfig.async : false,
                //processData: true,
                dataType: "json",
                processData: false,
                success: function (response) {
                     
                    result = JSON.parse(response.d);
                    if (typeof (callback) == 'function') {
                        callback(result);
                    }
                },
                error: function (a, b, c) {
                }
            });
            return result;
        }
        createVoiceAnimator($voiceAnimatorContainer) {
            debugger;
            let _this=this;
            if ($voiceAnimatorContainer && $voiceAnimatorContainer.length>0) {
                var voiceAnimCont = $("<div id='voiceAnimatorCont'></div>");
                voiceAnimCont.append(getSVG());
                $voiceAnimatorContainer.append(voiceAnimCont);
                voiceAnimator('voicevisualizer','voiceMasker');
            }
            function getSVG(){
                return $('<svg preserveAspectRatio="none" id="voicevisualizer" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">  \
                <defs>                                                                                                                                              \
                    <mask id="voiceMasker">                                                                                                                                \
                        <g id="maskGroup">                                                                                                                          \
                        </g>                                                                                                                                        \
                    </mask>                                                                                                                                         \
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">                                                                                \
                        <stop offset="0%" style="stop-color:#ff0a0a;stop-opacity:1" />                                                                              \
                        <stop offset="20%" style="stop-color:#f1ff0a;stop-opacity:1" />                                                                             \
                        <stop offset="90%" style="stop-color:#d923b9;stop-opacity:1" />                                                                             \
                        <stop offset="100%" style="stop-color:#050d61;stop-opacity:1" />                                                                            \
                    </linearGradient>                                                                                                                               \
                </defs>                                                                                                                                             \
                <rect x="0" y="0" width="100%" height="100%" fill="url(#gradient)" mask="url(#mask)"></rect>                                                        \
            </svg>');
            }
            function voiceAnimator(visualizerId, maskId) {
                "use strict";
                var paths = document.getElementsByTagName('path');
                var visualizer = document.getElementById(visualizerId);
                var mask = visualizer.getElementById(maskId);
                var h = document.getElementsByTagName('h1')[0];
                var path;
                var report = 0;

                var soundAllowed = function(stream) {
                    //Audio stops listening in FF without // window.persistAudioStream = stream;
                    //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
                    //https://support.mozilla.org/en-US/questions/984179
                    window.persistAudioStream = stream;
                    h.innerHTML = "Thanks";
                    h.setAttribute('style', 'opacity: 0;');
                    var audioContent = new AudioContext();
                    var audioStream = audioContent.createMediaStreamSource(stream);
                    var analyser = audioContent.createAnalyser();
                    audioStream.connect(analyser);
                    analyser.fftSize = 1024;

                    var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
                    visualizer.setAttribute('viewBox', '0 0 255 255');

                    //Through the frequencyArray has a length longer than 255, there seems to be no
                    //significant data after this point. Not worth visualizing.
                    for (var i = 0; i < 255; i++) {
                        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('stroke-dasharray', '4,1');
                        mask.appendChild(path);
                    }
                    var doDraw = function() {
                        requestAnimationFrame(doDraw);
                        analyser.getByteFrequencyData(frequencyArray);
                        var adjustedLength;
                        for (var i = 0; i < 255; i++) {
                            adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                            paths[i].setAttribute('d', 'M ' + (i) + ',255 l 0,-' + adjustedLength);
                        }

                    }
                    doDraw();
                }

                var soundNotAllowed = function (error) {
                    _this.debug("fail", "info");
                    h.innerHTML = "You must allow your microphone.";
                }

                //window.navigator = window.navigator || {};
                navigator.getUserMedia =  navigator.getUserMedia       ||
                                          navigator.webkitGetUserMedia ||
                                          navigator.mozGetUserMedia    ||
                                          null;
                navigator.getUserMedia({ audio: true }, soundAllowed, soundNotAllowed);
            }

        }
        //Utility Methods
        takeScreenShot() {
            var Obj = {};
            (function (exports) {
                function urlsToAbsolute(nodeList) {
                    if (!nodeList.length) {
                        return [];
                    }
                    var attrName = 'href';
                    if (nodeList[0].__proto__ === HTMLImageElement.prototype || nodeList[0].__proto__ === HTMLScriptElement.prototype) {
                        attrName = 'src';
                    }
                    nodeList = [].map.call(nodeList, function (el, i) {
                        var attr = el.getAttribute(attrName);
                        if (!attr) {
                            return;
                        }
                        var absURL = /^(https?|data):/i.test(attr);
                        if (absURL) {
                            return el;
                        } else {
                            return el;
                        }
                    });
                    return nodeList;
                }

                function screenshotPage() {
                    urlsToAbsolute(document.images);
                    urlsToAbsolute(document.querySelectorAll("link[rel='stylesheet']"));
                    var screenshot = document.documentElement.cloneNode(true);
                    var b = document.createElement('base');
                    b.href = document.location.protocol + '//' + location.host;
                    var head = screenshot.querySelector('head');
                    head.insertBefore(b, head.firstChild);
                    screenshot.style.pointerEvents = 'none';
                    screenshot.style.overflow = 'hidden';
                    screenshot.style.webkitUserSelect = 'none';
                    screenshot.style.mozUserSelect = 'none';
                    screenshot.style.msUserSelect = 'none';
                    screenshot.style.oUserSelect = 'none';
                    screenshot.style.userSelect = 'none';
                    screenshot.dataset.scrollX = window.scrollX;
                    screenshot.dataset.scrollY = window.scrollY;
                    var script = document.createElement('script');
                    script.textContent = '(' + addOnPageLoad_.toString() + ')();';
                    screenshot.querySelector('body').appendChild(script);
                    var blob = new Blob([screenshot.outerHTML], {
                        type: 'text/html'
                    });
                    return blob;
                }

                function addOnPageLoad_() {
                    window.addEventListener('DOMContentLoaded', function (e) {
                        var scrollX = document.documentElement.dataset.scrollX || 0;
                        var scrollY = document.documentElement.dataset.scrollY || 0;
                        window.scrollTo(scrollX, scrollY);
                    });
                }

                function generate() {
                    window.URL = window.URL || window.webkitURL;
                    window.open(window.URL.createObjectURL(screenshotPage()));
                    /*
                    var blob1 = screenshotPage();
                    var ObjectURL = window.URL.createObjectURL(blob1);
                    //window.open(ObjectURL);
                   //var  blob = new Blob([json], { type: "octet/stream" }),

                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    url = window.URL.createObjectURL(blob1);
                    a.href = url;
                    a.download = "filename";// fileName;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    */
                }
                exports.screenshotPage = screenshotPage;
                exports.generate = generate;
            })(Obj);  
            return Obj;
        }
        //END Utility Methods

    }

    //Start-NavigationMethods
    /**
    * Navigate to particular Enquiry ID
    *
    *
    * @param {String} EnquiryId EnqueryId to navigate
    * @returns {undefined}
    */
    var fnNav_EnquiryLink = function (EnquiryId) {
        let Url = location.origin + '/V2/#/Enquiry/Enquiry/EnquiryDetails?enquiryId=' + EnquiryId;
        window.open(Url);
    }
    /**
    * Navigate to particular Delivery Details
    *
    *
    * @param {String} TradeId TradeId to navigate
    * @param {String} DelScheduleId
    * @returns {undefined}
    */
    var fnNav_DeliveryDetailRedirect = function (TradeId, DelScheduleId) {
        window.open('#/Operation/Operation/OpsDeliverySchedule?TradeId=' + TradeId + '&DeliveryId=' + DelScheduleId);
    }
    /**
    * Navigate to particular Delivery Details
    *
    *
    * @param {String} MovementId MovementId to navigate
    * @param {String} DelScheduleId
    * @param {String} TradeId Trade Id
    * @returns {undefined}
    */
    var fnNav_MovementRedirect = function (MovId, DelDetailId, TradeId) {
        if (hasValue(MovId) && MovId != '-')
            window.open('/V2/#/Operation/Operation/Movements?TradeId=' + TradeId + '&DeliveryId=' + DelDetailId + '&MovementId=' + MovId);
    }
    window.fnEditPhysicalDealList=function(val) {
        var Url = location.origin + '/V2/#/Contract/PhysicalDeal/PhysicalDealDetail?dealId=' + val;
        techie.openURL(Url);
    }
    window.fnEditSwapDealList = function (val) {
        var Url = location.origin + '/V2/#/Contract/Swap/SwapDetail?DealId=' + val;
        techie.openURL(Url);
    }
    window.fnEditEnquiryList = function (val) {
        var Url = location.origin + '/V2/#/Enquiry/Enquiry/EnquiryDetails?enquiryId=' + val;
        techie.openURL(Url);
    }
    //End-NavigationMethods

    return VoiceIt;
})($, window);
let techie, artyome;
$(document).ready(function () {
    debugger;
    techie = new VoiceIt({ redirectOutputTo: "#output", $startListenBtn: $("#voiceit") });
    artyom = techie.voiceit;
    techie.init();
    var techieCache = fnGetCache("techie")
    if (hasValue(techieCache) && techieCache.isListening == true) {
        techie.startListening();
    }
});


