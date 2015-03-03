var newNode = function(tag, content, attributes, data){
    var element = document.createElement(tag);
    
    if(content !== undefined && content != null){
        if(content instanceof HTMLElement)
            element.appendChild(content);
        else
            if(typeof content === 'string' || typeof content === 'number'){
                var nodeText = document.createTextNode(content);
                element.appendChild(nodeText);
            }
    }
    if(attributes !== undefined && attributes != null){
        for(var i = 0; i < attributes.length; i++){
            var attribute = attributes[i];
            element.setAttribute(attribute.name, attribute.value);
        }
    }
    if(data !== undefined && data != null){
        for(var i = 0; i < data.length; i++){
            var dt = data[i];
            element.dataset[dt.name] = dt.value;
        }
    }
    return element;
};
(function($){
    $.fn.SimpleTable = function(options){
        var base_settings = $.extend({
            columns: [],
            data: [],
            page: 1,
            size: 10,
            header: true,
            pagination: true,
            rePag: true,
            enum: true,
            headClass : "info",
            noRowsMessage: "No records to display"
        }, options);
        //Go to specific page
        var gotoPage = function(table, settings, page){
            settings.page = page;
            settings.header = false;
            loadTable(table, settings);
        }
        var loadTable = function(table, settings){
            //Remove currents rows
            var bodies = table.getElementsByTagName('tbody');
            for(var i = 0; i < bodies.length; i++){
                table.removeChild(bodies[i]);
            }
            //Create new body
            var body = document.createElement('tbody');
            //Create table header if not exists
            var heads;
            if(settings.header){
                heads = table.getElementsByTagName('thead');
                for(var i = 0; i < heads.length; i++){
                    table.removeChild(heads[i]);
                }
                var columns = settings.columns;
                
                var headTr = document.createElement('tr');
                headTr.className = settings.headClass;
                if(settings.enum){
                    var tdhc = newNode('td','#');
                    headTr.appendChild(tdhc);
                }
                for(var i = 0; i < columns.length; i++){
                    field = columns[i];
                    tdh = newNode('td', field);
                    headTr.appendChild(tdh);
                }
                var head = newNode('thead', headTr);
            }
            //Add pagination if is set
            var tableData;
            var start = 0;
            var end;
            //Pagination settings
            if(settings.pagination){
                start = (settings.page - 1)*settings.size;
                end = start+settings.size;
                tableData = settings.data.slice(start, end);
                settings.noPages = (settings.data.length / settings.size).toFixed(0);
            }
            else
                tableData = settings.data;
            
            //Pagination HTML
            if(settings.rePag && settings.pagination && tableData.length > 0){
                
                tableData = settings.data.slice(start, end);
                
                var pages = newNode('ul',null,[{name: "class", value: "pagination"}]);
                
                var pagesContainer = document.createElement('div');
                table.parentElement.appendChild(pagesContainer);
                pagesContainer.appendChild(pages);
                
                var firstPageLink = newNode('a', newNode('span','«'), null, [{name: "page", value: 1}]);
                $(firstPageLink).click(function(){
                    gotoPage(table, settings, this.dataset.page);
                });
                var firstPage = newNode('li', firstPageLink);
                
                pages.appendChild(firstPage);
                
                for(var i = 1; i<= settings.noPages; i++){
                    var pageLink = newNode('a', i, null, [{name: "page", value: i}]);
                    
                    $(pageLink).click(function(){
                        gotoPage(table, settings, this.dataset.page);
                    });
                    var pageItem = newNode('li', pageLink);
                    pages.appendChild(pageItem);
                }
                var lastPageLink = newNode('a', newNode('span','»'), null, [{name: "page", value: settings.noPages}])
                $(lastPageLink).click(function(){
                    gotoPage(table, settings, this.dataset.page);
                });
                var lastPage = newNode('li', lastPageLink);
                pages.appendChild(lastPage);
                settings.rePag = false;
            }
            //Add Data Rows
            if(tableData.length == 0){
                var colspan = columns.length + (settings.enum ? 1 : 0);
                noRows = newNode('tr', newNode('td',settings.noRowsMessage,[{name:"colspan", value: colspan}]));
                body.appendChild(noRows);
            }
            else
                for(var j = 0; j < tableData.length; j++){
                    var row = tableData[j];
                    var tbRow = document.createElement('tr');
                    //If enum rows is required
                    if(settings.enum){
                        var tdc = newNode('td', start+j+1);
                        tbRow.appendChild(tdc);
                    }
                    for(var k = 0; k < row.length; k++){
                        value = row[k];
                        td = newNode('td', value);
                        tbRow.appendChild(td);
                    }
                    body.appendChild(tbRow);
                }
            if(settings.header)
                table.appendChild(head);
            table.appendChild(body);
        }
        return this.each(function(){
            var newSettings = $.extend({}, base_settings);
            newSettings.data = base_settings.data;
            loadTable(this, newSettings);
        });
    }
}(jQuery))