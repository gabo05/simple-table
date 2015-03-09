//======================================
//CSS CONSTANTS
//======================================
CSS_HALF = 'col-lg-6';
CSS_BTN_DEFAULT = 'btn btn-default'
CSS_GROUP = 'input-group';
CSS_BTN_GROUP = 'input-group-btn';
CSS_TABLE = 'table table-hover';
CSS_HEAD_ROW = 'info';
CSS_PAGINATION = 'pagination';

//======================================
//END CSS CONSTANTS
//======================================
//======================================
//HTML CONSTANTS
//======================================
HTML_TABLE = 'table';
HTML_TABLE_HEAD = 'thead';
HTML_TABLE_BODY = 'tbody';
HTML_TABLE_FOOT = 'tfoot';
HTML_TABLE_ROW = 'tr';
HTML_TABLE_CELL = 'td';
HTML_LIST = 'ul';
HTML_LIST_ITEM = 'li';
HTML_DIV = 'div';
HTML_SPAN = 'span';
HTML_LINK = 'a';
//======================================
//END HTML CONSTATNS
//======================================
//======================================
//HTML Functions
//======================================
function newNode (tag, content, attributes, data){
    var element = document.createElement(tag);
    
    if(content !== undefined && content != null){
        if(content instanceof HTMLElement)
            element.appendChild(content);
        else
            if(typeof content === 'string' || typeof content === 'number'){
                element.innerHTML = content;
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
//======================================
//End HTML Functions
//======================================
//======================================
//Array extension functions
//======================================
//======================================
// Split the array in two arrays
// 0: matches 
// 1: no matches elements
//======================================
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
//======================================
//Sort the array by field
//======================================
Array.prototype.orderby = function(field){
    var newArray = this.slice(0);
    quicksort(newArray, field);
    return newArray;
}
var quicksort = function(arr, field, left, right){
    left = left || 0;
    right = right || arr.length - 1;
    var i = left, j = right;
    var tmp;
    var pivotInd = parseInt(((left + right) / 2).toFixed());
    var pivot = arr[pivotInd][field];
    
    /* partition */
      while (i <= j) {
            while (pivot.greaterThan(arr[i][field]))
                  i++;
            while (arr[j][field].greaterThan(pivot))
                  j--;
            if (i <= j) {
                  tmp = arr[i];
                  arr[i] = arr[j];
                  arr[j] = tmp;
                  i++;
                  j--;
            }
      }
 
      /* recursion */
      if (left < j)
            quicksort(arr, field, left, j);
      if (i < right)
            quicksort(arr, field, i, right);
}
String.prototype.greaterThan = function(other){
    return [this, other].sort()[0] === other; 
}
Number.prototype.greaterThan = function(other){
    return [this, other].sort()[0] === other;
}
//======================================
//Calculate the max of the elements of the array
//======================================
Array.prototype.max = function(field){
    var pmax = parseFloat(this[0][field]) || '';
    var index = pmax === '' ? -1 : 0;
    for(var i = 0; i < this.length; i++){
        aux = parseFloat(this[i][field]) || '';
        if(pmax === '' || aux > pmax){
            pmax = aux || '';
            index = i;
        }
    }
    return {value: pmax, index: index};
};
//======================================
//Calculate the min of the elements of the array
//======================================
Array.prototype.min = function(field){
    var pmin = parseFloat(this[0][field]) || '';
    var index = pmin === '' ? -1 : 0;
    for(var i = 0; i < this.length; i++){
        aux = parseFloat(this[i][field]) || '';
        if(pmin === '' || aux < pmin){
            pmin = aux || '';
            index = i;
        }
    }
    return {value: pmin, index: index};
};
//======================================
//Calculate the moda
//======================================
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
    return { value: this[values.max("matches").index][field], index: 0 };
};
//======================================
//Calculate the max of the elements of the array
//======================================
Array.prototype.median = function(field){
    var order = this.orderby(field);
    var n = this.length;
    value = n % 2 == 0 ? (this[n/2][field] + this[(n/2)-1][field]) / 2 : this[parseInt((n/2).toFixed(0))][field];
    
    return {value : value};
}
//======================================
//Calculate the average
//======================================
Array.prototype.average = function(field){
    return {value: this.sum(field).value / this.length};
};
//======================================
//Calculate the sum
//======================================
Array.prototype.sum = function(field){
    var psum = parseFloat(this[0][field]) || 0;
    for(var i = 1; i < this.length; i++){
        psum += parseFloat(this[i][field]) || 0;
    }
    return {value: psum};
};
//======================================
//End array extension functions
//======================================

//======================================
//Puggin function
//======================================
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
            reCalc: true,
            enum: true,
            headClass : CSS_HEAD_ROW,
            noRowsMessage: "No records to display",
            footer: [],
            searchForm: false,
            searchOn: "submit", //submit, write
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
//======================================
//End pluggin function
//======================================

//======================================
//Table Builder Director
//======================================
var Table = function (builder) {
    this.builder = builder;
    var self = this;
    this.build = function () {
        builder.clear();
        builder.buildHead();
        builder.buildBody();
        builder.buildFooter();
        builder.buildPagination();
        return self.builder.get();
    }
};
//======================================
//End Table Builder Director
//======================================

//======================================
//Table Builder
//======================================
var TableBuilder = function (table, settings) {
    this.table = table;
    this.settings = settings;
    var self = this;
    //Remove currents rows
    this.clear = function () {
        self.table.removeByTag(HTML_TABLE_BODY);
        if(settings.header)
            self.table.removeByTag(HTML_TABLE_HEAD);
        if(settings.reCalc)
            self.table.removeByTag(HTML_TABLE_FOOT);
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
                var p = (self.settings.data.length / self.settings.size);
                self.settings.noPages =  p > parseInt(p.toFixed(0)) ? parseInt(p.toFixed(0)) + 1 : parseInt(p.toFixed(0));
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
                
                var tbRow;
                if(row instanceof Array)
                    tbRow = self.buildFromArray(row, paginationSettings.start+j+1);
                else
                    tbRow = self.buildFromObject(row, paginationSettings.start+j+1);
                
                body.appendChild(tbRow);
            }
        }
        self.table.appendChild(body);
    }
    this.buildFromArray = function(row, noRow){
        var tbRow = document.createElement(HTML_TABLE_ROW);
        //If enum rows is required
        if (self.settings.enum && noRow) tbRow.appendChild(newNode(HTML_TABLE_CELL, noRow));
        //Add row data
        for (var k = 0; k < row.length; k++) if(row[k]) tbRow.appendChild(newNode(HTML_TABLE_CELL, row[k]));
        //
        return tbRow;
    }
    this.buildFromObject = function(row, noRow){
        var tbRow = document.createElement(HTML_TABLE_ROW);
        //If enum rows is required
        if (self.settings.enum && noRow) tbRow.appendChild(newNode(HTML_TABLE_CELL, noRow));
        //Add row data
        for (var k = 0; k < self.settings.columns.length; k++) 
            tbRow.appendChild(newNode(HTML_TABLE_CELL, row[self.settings.columns[k]] || ''));
        //
        return tbRow;
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
        if(self.settings.reCalc && self.settings.footer.length > 0 ){
            var isArray = self.settings.data[0] instanceof Array;
            var values = [];
            for(var i = 0; i < self.settings.footer.length; i++){
                var fs = self.settings.footer[i];
                var field = isArray ? self.settings.columns.indexOf(fs.field) : fs.field;
                var v = '';
                if(typeof fs.summary === 'string') v = data[fs.summary](field).value;
                
                else if(typeof fs.summary === 'function') v = fs.summary(data, field);
                
                if(typeof fs.condition === 'function' ) v = data.filterAndSplit(fs.condition)[0][0][field];
                
                values[fs.field] = fs.text ? fs.text.replace('{$}', v) : v;
            }
            self.settings.reCalc = false;
            self.table.appendChild(newNode(HTML_TABLE_FOOT, self.buildFromObject(values, ' ')));
        }
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
};
//======================================
//End Table Builder
//======================================