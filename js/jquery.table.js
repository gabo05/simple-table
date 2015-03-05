function newNode (tag, content, attributes, data){
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
function removeNode (element, childName) {
    children = element.getElementsByTagName(childName);
    for(var i = 0; i < children.length; i++){
        element.removeChild(children[i]);
    }
}

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
            noRowsMessage: "No records to display",
            searchForm: false,
            searchOn: "submit" //submit, write
        }, options);
        
        
        return this.each(function(){
            var newSettings = $.extend({}, base_settings);
            newSettings.data = base_settings.data;
            
            var table;
            if(this.tagName.toLowerCase() === 'table')
                table = this;
            else{
                table = newNode('table',null,[{name:'class', value: 'table table-hover'}]);    
                this.appendChild(table);
            }
            
            var builder = new TableBuilder(table, newSettings);
            
            var director = new Table(builder);
            
            return director.build();
        });
    }
}(jQuery))
var Table = function (builder) {
    this.builder = builder;
    var self = this;
    this.build = function () {
        self.builder.clear();
        self.builder.buildHead();
        builder.buildBody();
        builder.buildPagination();
        return self.builder.get();
    }
}
var TableBuilder = function (table, settings) {
    this.table = table;
    this.settings = settings;
    var self = this;
    //Remove currents rows
    this.clear = function () {
        removeNode( self.table, 'tbody');
        if(settings.header)
            removeNode( self.table, 'thead');
    }
    //Create table header if not exists
    this.buildHead = function () {
        if (settings.header) {
            
            var columns =  self.settings.columns;
            var headTr = newNode('tr', '', [{name: "class", value: self.settings.headClass}]); 
            
            if (self.settings.enum) headTr.appendChild(newNode('td','#'));
            
            for (var i = 0; i < columns.length; i++) headTr.appendChild(newNode('td', columns[i]));
            
            var head = newNode('thead', headTr);
            
            self.table.appendChild(head);
        }
    }
    this.getPaginationSettings = function () {
        //Add pagination if is set
            var pageData;
            var start = 0;
            var end;
            //Pagination settings
            if (self.settings.pagination) {
                start = (self.settings.page - 1)*self.settings.size;
                end = start+self.settings.size;
                self.settings.noPages = (self.settings.data.length / self.settings.size).toFixed(0);
                pageData = self.settings.data.slice(start, end);
                
            }
            else
                pageData = self.settings.data;
        
        return {
            pageData: pageData, 
            start: start, 
            end: end
        };
    }
    this.buildBody = function () {
        //Create new body
        var body = document.createElement('tbody');
        var paginationSettings = self.getPaginationSettings();
        
        //Add Data Rows
        if (paginationSettings.pageData.length == 0) {
            
            var colspan = self.settings.columns.length + (self.settings.enum ? 1 : 0);
            
            noRows = newNode('tr', 
                                newNode('td',settings.noRowsMessage,[{name:"colspan", value: colspan}])
                            );
            body.appendChild(noRows);
        }
        else {
            for (var j = 0; j < paginationSettings.pageData.length; j++) {
                
                var row = paginationSettings.pageData[j];
                var tbRow = document.createElement('tr');
                
                //If enum rows is required
                if (self.settings.enum) tbRow.appendChild(newNode('td', paginationSettings.start+j+1));
                
                for (var k = 0; k < row.length; k++) tbRow.appendChild(newNode('td', row[k]));
                
                body.appendChild(tbRow);
            }
        }
        self.table.appendChild(body);
    }
    this.buildPagination = function () {
        var pageData = self.getPaginationSettings().pageData;
        if(settings.rePag && settings.pagination && pageData.length > 0){
            
            var pagesContainer = document.createElement('div');
            
            var pages = newNode('ul',null,[{name: "class", value: "pagination"}]);
            pagesContainer.appendChild(pages);
            //First Page
            pages.appendChild(self.createPageItem(newNode('span','«'), 1));
            //Page Numbers
            for(var i = 1; i<= settings.noPages; i++)  pages.appendChild(self.createPageItem(i, i));
            //Last Page
            pages.appendChild(self.createPageItem(newNode('span','»'), self.settings.noPages));
            //Do not create pagination every table load
            self.settings.rePag = false;
            //Add the pagination to the parent
            self.table.parentElement.appendChild(pagesContainer);
        }
    }
    this.createPageItem = function(content, page){
        var link = newNode('a', content, null, [{name: "page", value: page}]);
        
        $(link).click(function(){
            self.settings.page = page;
            self.settings.header = false;
            self.clear();
            self.buildBody();
        });
        
        return newNode('li', link);
    }
    this.get = function(){
        return self.table;
    }
}