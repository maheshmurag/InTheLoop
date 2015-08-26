console.log('ITL Init');

var superchargedText = '<p>Supercharged by <a href="https://github.com/mash99/InTheLoop">InTheLoop</a></p>';
$('#footer').append(superchargedText);
$('#container_footer').append(superchargedText);


    //get tasks
    var taskElements = $("div[data-track-container|='Active Assignments']>div>div.ajax_accordion");
    var count = 0;
    taskElements.each(function(){
        var url = $('div.ajax_accordion_row', this).data('url');
        var info = $('div.ajax_accordion_row>table>tbody>tr>td', this);
        var taskName = info[3].innerText;
        var className = info[4].innerText;
        var regex = /\d{1,4}\/\d{1,4}\/\d{1,4}/g;
        var dueDate = info[5].innerText.match(regex);
        var completed  = $("div.hidden>a", info[1]).data('track-link') === "Done";
        console.log(className + ":" + taskName + "|" + dueDate + '|completed:' + completed);
        console.log('url: ' + url);

        /*
        $.ajax({
             url: url,
             tryCount : 0,
             retryLimit : 3,
             success: function(returned) {
                 console.log('task: ' + taskName);
                 var ret = $(returned);
                 if(ret.length == 0){
                     console.error('error loading assignment details');
                     this.tryCount++;
                     if (this.tryCount <= this.retryLimit) {
                         console.log('trying again');
                        $.ajax(this); //try again
                     }else alert('Could not load description for assignment: ' + taskName);
                     return;
                 }else{
                    var assignedDate = ret.find('.assignment-dates')[0].innerText.match(regex)[0];
                    var msg = ret.find('div.sllms-content-body')[0].innerText;
                    console.log(msg);
                 }
            }
        }); */
        
        if(!completed)count++;

    });

    console.log('final count: ' + count);
    chrome.runtime.sendMessage(count);
