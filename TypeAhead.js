/**
 *	@author Tim Andrianoff
 *	@date September 28, 2012
 *
 *	TypeAhead is a class to create a type ahead search widget.
 *	It uses the JQuery library, and SFUtil.js, which must be loaded at the time of it's use.
 *
 *	The api used by TypeAhead can be changed via the api string passed to the constructor.
 *	For a different API, it is likelly neccessary to override the makeListItem method and possibly the
 *	render method via either replacement or inheritance. The class .resultValue is used to indicate the
 *	essential value of any entry in the type ahead result list. For this example, selecting a result
 *	simply enters its value into the input field.
 */

/**
 *	Construct the type ahead search widget.
 *
 *	@param taId the id of the div with class 'typeAhead' that this widget is associated with
 *	@param api the address to use when calling an api, on which queries to the api are appended
 *
 *	TypeAhead expects a corresponding <div/> with class 'typeAhead' that contains only an input with
 *	class 'typeAheadSearch'
 *
 *	The typeAhead div must have a unique id attribute that is passed to the TypeAhead constructor.
 */
function TypeAhead(taId, api) {

	this.minQueryLength = 0;		    // mininmum length query to search results
	this.maxResults  = 10;			    // maximum number of results to show
	this.emptyListMessage = "No Results"; // Display this if nothing is found
	
	var apiAddress = api;			    // api address to append queries to
	this.id = '#'+taId;				    // id of typeAhead div
	var search = 
		$(this.id +' .typeAheadSearch');// input element with querry string
	this.selectedId = -1; 				// id of selected list item
	this.numResults =  0;				// current number of returned search results

	// initialize Type Ahead result list
 	this.resultList = $('<ul/>');
 	this.resultList.addClass('taResultList');
	$(this.id).append(this.resultList);

	/**
	 *	Render an api response
	 *
	 *	@param response a JSON object containing the result of an api call
	 */
	this.render = function (response) {
		var res = response.Result;

		// hide old list and reset selection
		this.clearResults();

		// set cap displayed results
		this.numResults = res.length;
		if (res.length > this.maxResults) {
			this.numResults = this.maxResults;
		}

		// make list items from each result and add it to the result list
		for (var i = 0; i < this.numResults; i++) {
			var itemDiv = this.makeListItem(res[i],i, this);
			this.resultList.append(itemDiv); 
		}

		// Add a "no results" message if there aren't any results
		if (this.numResults === 0) {
			var emptyItem = $('<li/>');
			emptyItem.html(this.emptyListMessage);
			emptyItem.addClass('empty_message');
			this.resultList.append(emptyItem);
		}

		// redisplay list
		this.resultList.show();
	};

	/**
	 *	@return a JQuery element to append to the tyoe ahead result list
	 *
	 *	@param listItem a JSON object representing a query result.
	 *	@param id index of the result in the result list
	 *	@param self reference to the TypeAhead object to maintain scope in mouse handlers
	 */
	this.makeListItem = function(listItem,id, self) {
		var itemDiv = $('<li/>');
		itemDiv.addClass('resultItem');
		itemDiv.attr('id',id);
		if (id%2 === 0) {
			itemDiv.addClass('even_color');
		} else {
			itemDiv.addClass('odd_color');
		}

		// add brand name and image to result
		var listRow = 
			'<table><tr><td class="resultImage"><img src="'+listItem.LogoThumbnailUri+'" /></td>'
			+'<td><span class="resultValue">'+listItem.BrandName+'</span></td></tr></table>';
		itemDiv.html(listRow);

		var oldId = this.selectedId;
		itemDiv.hover(function() {
			var oldId = self.selectedId;
			self.selectedId = id;
			self.moveSelection(oldId);
		});

		itemDiv.mousedown(function() {
			self.handleSelection();
		});

		return itemDiv;
	};

	/**
	 *	Clears the contents of the type ahead search results.
	 */
	this.clearResults = function() {
		this.resultList.html('');
		this.resultList.hide();

		this.selectedId = -1;
		this.numResults = 0;
	}

	/**
	 *	submits a query to the api.
	 *
	 *	@param self a reference to this TypeAhead object to pass with the callback function.
	 *			doing this provides the appropriate scope for the callback function.
	 */
	this.fetch = function (self) {
		var val = search.val();
		// don't seach for strings below minimum length
		if (!val || val.length < this.minQueryLength) { 
			this.clearResults();
			return;
		}
		SFUtil.LoadJSONP(apiAddress+val,function(r){self.render(r)});
	};

	/**
	 *	Called when selectedId is changed, to move the selcted list item from the old item 
	 *	to the current one.
	 *
	 *	@param oldId the old selected id
	 */
	this.moveSelection = function(oldId) {
		$(this.id + ' #'+oldId+'.resultItem').removeClass("highlight_color");
		$(this.id + ' #'+this.selectedId+'.resultItem').addClass("highlight_color");
	};

	/******* EVENT HANDLERS *******/

	/**
	 *	Select next result, or wrap around
	 */
	this.handleDown = function() {
		var oldId = this.selectedId++;
		this.selectedId %= this.numResults;
		this.moveSelection(oldId);
	};

	/**
	 *	Select previous result, or wrap around
	 */
	this.handleUp = function() {
		var oldId = this.selectedId--;
		this.selectedId += this.numResults;
		this.selectedId %= this.numResults;
		this.moveSelection(oldId);
	};

	/**
	 *	Remove focus from the search on Enter, changing the input's value to
	 *	a selected result, if any.
	 */
	this.handleSelection = function() {
		if (this.selectedId >= 0) {
			// read the essential value of the seected item
			var selectedValue = 
				$(this.id+' #'+this.selectedId+'.resultItem' +' .resultValue').html();
			search.val(selectedValue);
		}
		search.blur();
	}

	/**
	 *	Handle keyboard events from the type ahead search input
	 *
	 *	@param e a keyboard event
	 */
	this.handleKeyboard = function(e, self) { 

	    var keynum; //  variable to contain the value of the key that was pressed
       
	    if(window.event) // IE
	    { keynum = e.keyCode;}
        else if(e.which) // other browsers
        { keynum = e.which;}

    	if (keynum === 40) { 		// Down
    		this.handleDown();
    	} else if (keynum === 38) { // Up
    		this.handleUp();
    	} else if (keynum === 13) { // Enter
    		this.handleSelection();
    	} else {
			this.fetch(self);
    	}
	};

	// Set up keyboard and blur (Loss of Focus) handling for this type ahead. The 'self' argument
	// is used to avoid scope problems after attaching functions to page elements
	(function(self) {
		search.keyup(function (e) {
			self.handleKeyboard(e, self);
		});
		search.blur(function (e) {
			self.clearResults();
		});
	}(this));
}