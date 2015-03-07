/*CSS CONSTANTS*/
CSS_HALF = 'col-lg-6';
CSS_BTN_DEFAULT = 'btn btn-default'
CSS_GROUP = 'input-group';
CSS_BTN_GROUP = 'input-group-btn';
CSS_TABLE = 'table table-hover';
CSS_HEAD_ROW = 'info';
CSS_PAGINATION = 'pagination';
/*END CSS CONSTANTS*/
/*HTML CONSTANTS*/
HTML_TABLE = 'table';
HTML_TABLE_HEAD = 'thead';
HTML_TABLE_BODY = 'tbody';
HTML_TABLE_ROW = 'tr';
HTML_TABLE_CELL = 'td';
HTML_LIST = 'ul';
HTML_LIST_ITEM = 'li';
HTML_DIV = 'div';
HTML_SPAN = 'span';
HTML_LINK = 'a';
/*END HTML CONSTATNS*/
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
}
Element.prototype.removeByTag = function (tagName) {
    children = this.getElementsByTagName(tagName);
    for(var i = 0; i < children.length; i++){
        this.removeChild(children[i]);
    }
};
Array.prototype.filterAndSplit = function (condition) {
    
    if(typeof condition === 'function'){
        var match = [], nomatch = [], both=[];

        for(var index = 0; index< this.length; index++){
            var ele = this[index];
            if(condition(ele))
                match.push(ele);
            else
                nomatch.push(ele);
        }

        both.push(match);
        both.push(nomatch);

        return both;
    }
    throw "Condition must be a function";
};
Array.prototype.max = function(field){
    var pmax = parseFloat(this[0][field]) || '';
    var index = -1;
    for(var i = 0; i < this.length; i++){
        aux = parseFloat(this[i][field]) || '';
        if(pmax === '' || aux > pmax)
            pmax = aux || '';
    }
    return {value: pmax, index: index};
}
Array.prototype.min = function(field){
    var pmin = parseFloat(this[0][field]) || '';
    var index = -1;
    for(var i = 0; i < this.length; i++){
        aux = parseFloat(this[i][field]) || '';
        if(pmin === '' || aux < pmin)
            pmin = aux || '';
    }
    return {value: pmin, index: index};
}
Array.prototype.moda = function(field){
    var values = [];
    var filtered = this;
    
    while(filtered.length != 0){
        var value = filtered[0][field];
        both = filtered.filterAndSplit(function(ele){
            return ele[field] == value; 
        });
        values.push({ value: value, matches: both[0].length });
        filtered = both[1];
    }
    return this[values.max("matches").index][field];
}
Array.prototype.average = function(field){
    return this.sum(field) / this.length;
}
Array.prototype.sum = function(field){
    var psum = parseFloat(this[0][field]) || 0;
    for(var i = 1; i < this.length; i++){
        psum += parseFloat(this[i][field]) || 0;
    }
    return psum;
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
            headClass : CSS_HEAD_ROW,
            noRowsMessage: "No records to display",
            searchForm: false,
            searchOn: "submit" //submit, write
        }, options);

        return this.each(function(){
            var newSettings = $.extend({}, base_settings);
            newSettings.data = base_settings.data;
            
            var table;
            if(this.tagName.toLowerCase() === HTML_TABLE)
                table = this;
            else{
                table = newNode(HTML_TABLE, null, [{name:'class', value: CSS_TABLE}]);    
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
        builder.clear();
        builder.buildHead();
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
        self.table.removeByTag(HTML_TABLE_BODY);
        if(settings.header)
            self.table.removeByTag(HTML_TABLE_HEAD);
    }
    //Create table header if not exists
    this.buildHead = function () {
        if (settings.header) {
            
            var columns =  self.settings.columns;
            var headTr = newNode(HTML_TABLE_ROW, '', [{name: "class", value: self.settings.headClass}]); 
            
            if (self.settings.enum) headTr.appendChild(newNode(HTML_TABLE_CELL,'#'));
            
            for (var i = 0; i < columns.length; i++) headTr.appendChild(newNode(HTML_TABLE_CELL, columns[i]));
            
            var head = newNode(HTML_TABLE_HEAD, headTr);
            
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
        var body = document.createElement(HTML_TABLE_BODY);
        var paginationSettings = self.getPaginationSettings();
        
        //Add Data Rows
        if (paginationSettings.pageData.length == 0) {
            
            var colspan = self.settings.columns.length + (self.settings.enum ? 1 : 0);
            
            noRows = newNode(HTML_TABLE_ROW, 
                                newNode(HTML_TABLE_CELL,settings.noRowsMessage,[{name:"colspan", value: colspan}])
                            );
            body.appendChild(noRows);
        }
        else {
            for (var j = 0; j < paginationSettings.pageData.length; j++) {
                
                var row = paginationSettings.pageData[j];
                var tbRow = document.createElement(HTML_TABLE_ROW);
                
                //If enum rows is required
                if (self.settings.enum) tbRow.appendChild(newNode(HTML_TABLE_CELL, paginationSettings.start+j+1));
                //Add row data
                for (var k = 0; k < row.length; k++) tbRow.appendChild(newNode(HTML_TABLE_CELL, row[k]));
                
                body.appendChild(tbRow);
            }
        }
        self.table.appendChild(body);
    }
    this.buildPagination = function () {
        var pageData = self.getPaginationSettings().pageData;
        if(settings.rePag && settings.pagination && pageData.length > 0){
            
            var pagesContainer = document.createElement(HTML_DIV);
            
            var pages = newNode(HTML_LIST, null, [{name: "class", value: CSS_PAGINATION}]);
            pagesContainer.appendChild(pages);
            //First Page
            pages.appendChild(self.createPageItem(newNode(HTML_SPAN, '«'), 1));
            //Page Numbers
            for(var i = 1; i<= settings.noPages; i++)  pages.appendChild(self.createPageItem(i, i));
            //Last Page
            pages.appendChild(self.createPageItem(newNode(HTML_SPAN, '»'), self.settings.noPages));
            //Do not create pagination every table load
            self.settings.rePag = false;
            //Add the pagination to the parent
            self.table.parentElement.appendChild(pagesContainer);
        }
    }
    this.buildSearchForm = function(){
        if(self.settings.searchForm) {
            
        }
    }
    this.buildFooter = function(){
        
    }
    this.createPageItem = function(content, page){
        var link = newNode(HTML_LINK, content, null, [{name: "page", value: page}]);
        
        $(link).click(function(){
            self.settings.page = page;
            self.settings.header = false;
            self.clear();
            self.buildBody();
        });
        
        return newNode(HTML_LIST_ITEM, link);
    }
    this.get = function(){
        return self.table;
    }
}