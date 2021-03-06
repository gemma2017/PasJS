
var Pas =
{

    dragCursor: "move",
    stLeft: 50,
    stTop: 85,
    srcRow: 0,
    imageWidth: 0,
    imageHeight: 0,
    currentCard: 0,
    layout: null,
    offsetX: 0,
    offsetY: 0,
    targetObj: null,
    x: 0,
    y: 0,
    hist: null,
    histPos: 0,
    pasStr: null,
    histStr: null,
    charTab: null,
    destRow: -1,
    nJokers: 0,
    grab: false,
    clientX: 0,
    clientY: 0,
    getRow: function(dragBegin) {

        var rx = this.clientX;
        var ry = this.clientY;
        var row = -1;

        if (rx >= this.stLeft && rx < this.stLeft + this.imageWidth * 9) {
            row = Math.floor((rx - this.stLeft) / this.imageWidth);
            var y1 = this.stTop + this.imageHeight * (this.layout[row].length - 1) / 3;
            if (dragBegin != 0 && (ry < y1 || ry >= y1 + this.imageHeight))
                row = -1;
            return row;  
        }
        if (rx >= (this.stLeft + this.imageWidth * 9.5) && rx < (this.stLeft + this.imageWidth * 10.5)) 
        {
            if (ry >= this.stTop && ry < this.stTop + this.imageHeight * 4) 
            {
                if (dragBegin == 0)
                    row = Math.floor((ry - this.stTop) / this.imageHeight) + 9;
            }
            return row;  
        }      
        if (ry >= this.stTop && ry < (this.stTop + this.imageHeight * 2) && (rx >= this.stLeft + this.imageWidth * 11) && (rx < this.stLeft + this.imageWidth * 12))
            row = Math.floor( (ry - this.stTop) / this.imageHeight) + 13;
        return row;
    },

    canPlace: function(row) {
        var range;
        var srcRange;
        var suit;

        this.destRow = -1;
        this.nJokers = 0;
        if (row == this.srcRow) {
            return false;
        }
        if (row >= 13) {
            if (this.currentCard >= 52) {
                this.destRow = this.layout[13].length == 0 ? 13 : 14;
                return true;
            }
            return false;
        }
        if (row >= 9 && row < 13 && this.currentCard < 52) {// ???????????? ?? ????????
            row = (this.currentCard % 4) + 9;
            if (this.layout[row].length == 0)
                range = -1;
            else {
                range = this.layout[row][this.layout[row].length - 1];
                range = Math.floor(range / 4);
            }
            srcRange = Math.floor(this.currentCard / 4);
            if (srcRange - range == 1) {
                this.destRow = row;
                return true;
            }
            return false;
        }
        if (row >= 0 && row < 9) {
            var cardSuit = this.currentCard % 4 < 2 ? 0 : 1;
            var cardRange = Math.floor(this.currentCard / 4);
            // ?? ???????????? ?????? ???????????? ?????? ????????????, ?????????? ??????????????.	
            if (this.layout[row].length == 0)
                return this.currentCard < 52 ? true : false;

            // ?????????????? ?????????? ???????????????? ???????? ????????????, ???????????? ???? ?? ???????????? ??????
            if (this.currentCard >= 52)
                return this.layout[row].length != 0;

            var underCard = this.layout[row][this.layout[row].length - 1];
            if (underCard >= 52) {
                underCard = this.layout[row][this.layout[row].length - 2];
                if (underCard >= 52) {
                    underCard = this.layout[row][this.layout[row].length - 3];
                    range = Math.floor(underCard / 4);
                    suit = underCard % 4 < 2 ? 0 : 1;
                    return suit != cardSuit && range - cardRange == 3;
                }
                else {
                    range = Math.floor(underCard / 4);
                    suit = underCard % 4 < 2 ? 0 : 1;
                    return suit == cardSuit && range - cardRange == 2;
                }
            }
            var dRange = Math.floor(underCard / 4) - cardRange;
            if (dRange == 1) {
                return (underCard % 4 < 2 ? 0 : 1) != cardSuit;
            }
            else
                if (dRange == 2) {
                if ((underCard % 4 < 2 ? 0 : 1) == cardSuit) {// ???????? ???????? ???????? ???? 1 ????????????
                    if (this.layout[13].length != 0 || this.layout[14].length != 0) {
                        this.nJokers = 1;
                        return true;
                    }
                }
                return false;
            }
            else
                if (dRange == 3) {
                if ((underCard % 4 < 2 ? 0 : 1) != cardSuit) {// ???????? ???????? 2 ??????????????
                    if (this.layout[13].length != 0 && this.layout[14].length != 0) {
                        this.nJokers = 2;
                        return true;
                    }
                }
            }
        }
        return false;
    },

    dropCard: function(e) {
        if (this.targetObj != null) {
            var evtobj = window.event ? window.event : e;
            var row = this.getRow(0);
            if (row == -1) {// ?????????????? ???? ???????? ??????????
                row = this.srcRow;
            }
            else
                if (!this.canPlace(row)) {
                row = this.srcRow;
            }
            else {
                if (this.destRow != -1)
                    row = this.destRow;
            }

            // ???????????????????? ????????????????
            while (this.nJokers != 0) {
                var jr = this.layout[13].length != 0 ? 13 : 14;
                var jc = this.layout[jr].pop();
                this.layout[row].push(jc);

                this.setCardPlace(row);

                while (this.histPos != this.hist.length)
                    this.hist.pop();
                this.hist.push(jr);
                this.hist.push(row);
                this.histPos += 2;
                this.updateButtons();
                this.makeHistStr();
                this.updateCursor(this.srcRow);

                this.nJokers--;
            }



            this.layout[row].push(this.currentCard);
            this.setCardPlace(row);
            this.targetObj = null;
            if (row != this.srcRow) {
                while (this.histPos != this.hist.length)
                    this.hist.pop();
                this.hist.push(this.srcRow);
                this.hist.push(row);
                this.histPos += 2;
                this.updateButtons();
                this.makeHistStr();
                this.updateCursor(this.srcRow);

                if (this.srcRow >= 0 && this.srcRow < 9) {
                    while (this.layout[this.srcRow].length != 0) {
                        var cc = this.layout[this.srcRow].pop();
                        if (cc < 52) {
                            this.layout[this.srcRow].push(cc);
                            break;
                        }
                        else {
                            jr = this.layout[13].length == 0 ? 13 : 14;
                            this.layout[jr].push(cc);
                            this.setCardPlace(jr);
                            while (this.histPos != this.hist.length)
                                this.hist.pop();
                            this.hist.push(this.srcRow);
                            this.hist.push(jr);
                            this.histPos += 2;
                            this.updateButtons();
                            this.makeHistStr();
                            this.updateCursor(this.srcRow);
                        }
                    }
                }

            }
        }
    },

    updateCursor: function(row) {
        if (row < 9 && this.layout[row].length > 1) {// ???????????????????? ????????????
            var img = document.images[String(this.layout[row][this.layout[row].length - 1])];
            img.style.cursor = this.dragCursor;
        }
    },


    newLayout: function() {
        document.images["bk"].style.left = 0 + "px";
        document.images["bk"].style.top = 0 + "px";
        document.images["bk"].style.zIndex = -1;
        document.images["bk"].width = 1400;
        document.images["bk"].height = 1000;

        var i, row, col, card, style;
        this.hist = new Array();
        this.histPos = 0;
        this.layout = new Array(15);
        for (i = 0; i < 15; i++)
            this.layout[i] = new Array();

        //  ???????????????????????? ??????????
        var cards = new Array(54);
        for (i = 0; i < 54; i++)
            cards[i] = i;
        for (i = 0; i < 54; i++) {
            var mod = i >= 45 ? 54 : 52;
            var r = Math.floor(Math.random() * 100000);
            var num = r % (mod - i) + i;
            var t = cards[i];
            cards[i] = cards[num];
            cards[num] = t;
        }
        for (row = 0; row < 6; row++) {
            for (col = 0; col < 9; col++) {
                card = row * 9 + col;
                this.layout[col].push(cards[card]);
                style = document.images[String(cards[card])].style;
                style.top = (this.stTop + row * this.imageHeight / 3) + "px";
                style.left = (this.stLeft + col * this.imageWidth) + "px";
                style.zIndex = row + 1;
                style.cursor = row == 5 ? this.dragCursor : "default";
            }
        }
        for (i = 56; i < 60; i++) {
            style = document.images[String(i)].style;
            style.top = (this.stTop + this.imageHeight * (i - 56)) + "px";
            style.left = (this.stLeft + this.imageWidth * 9.5) + "px";
            style.zIndex = 0;
        }


        document.images["54"].style.left = (this.stLeft + this.imageWidth * 11) + "px";
        document.images["54"].style.top = this.stTop + "px";
        document.images["54"].style.zIndex = 0;
        document.images["54"].style.cursor = this.dragCursor;

        document.images["55"].style.left = (this.stLeft + this.imageWidth * 11) + "px";
        document.images["55"].style.top = (this.stTop + this.imageHeight) + "px";
        document.images["55"].style.zIndex = 0;
        document.images["55"].style.cursor = this.dragCursor;

        this.updateButtons();
        this.makeHistStr();

    },


    initialize: function() {
        document.ontouchstart = this.onLeftButtonDown;
        document.ontouchend = this.onLeftButtonUp;
        document.onmousedown    = this.onLeftButtonDown;
        document.onmouseup      = this.onLeftButtonUp;
        this.imageWidth = document.images["0"].width;
        this.imageHeight = document.images["0"].height;
        this.charTab = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
        this.newLayout();
        var par = document.images["0"].parentNode;
        for (var i = 1; i <= 9; i++) {
            var d = document.createElement('DIV');
            d.style.position = 'absolute';
            d.style.left = this.stLeft + (i - 1) * this.imageWidth + "px";
            d.style.top = this.stTop + "px";
            d.style.border = "solid 1px black";
            d.style.width = this.imageWidth - 1 + "px";
            d.style.height = this.imageHeight + "px";
            d.style.zIndex = 0;
            par.insertBefore(d, document.images["0"]);
        }
    },

    grabCard: function(e) {
        var evtobj = window.event ? window.event : e
        var row = this.getRow(1);
        if (row == -1)
	{
		console.log("row == -1");	
		return;
	}
        if (this.layout[row].length == 0)
            return;

        this.targetObj = window.event ? event.srcElement : e.target
        if (this.targetObj.className == "card") {
            this.srcRow = row;

            this.targetObj.style.zIndex = 200;
            if (isNaN(parseInt(this.targetObj.style.left))) {
                this.targetObj.style.left = 0;
            }
            if (isNaN(parseInt(this.targetObj.style.top))) {
                this.targetObj.style.top = 0;
            }
            this.offsetX = parseInt(this.targetObj.style.left)
            this.offsetY = parseInt(this.targetObj.style.top)
            this.x = this.clientX;
            this.y = this.clientY;
            this.currentCard = this.layout[row].pop();
            if (evtobj.preventDefault)
                evtobj.preventDefault();
            else
                evtobj.returnValue = false;
  	    console.log("document.ontouchmove = this.onMouseMove");	
            document.ontouchmove = this.onMouseMove;
            document.onmousemove = this.onMouseMove;
        }
        else {
            this.targetObj = null;
        }
    },

    moveCard: function(e) {
        var evtobj = window.event ? window.event : e
        if (this.targetObj != null) {
            this.targetObj.style.left = this.offsetX + this.clientX - this.x + "px";
            this.targetObj.style.top = this.offsetY + this.clientY - this.y + "px";
            return false;
        }
        return false;
    },

    setCardPlace: function(row) {
        var l, t;
        if (row < 9) {
            l = this.stLeft + this.imageWidth * row;
            t = this.stTop + this.imageHeight * (this.layout[row].length - 1) / 3;
        }
        else {
            l = this.stLeft + this.imageWidth * 9.5;
            if (row < 13)
                t = this.stTop + (row - 9) * this.imageHeight;
            else
            {
               l = this.stLeft + this.imageWidth * 11;
                t = this.stTop + this.imageHeight * (row - 13);
            }  
        }
        var img = document.images[String(this.layout[row][this.layout[row].length - 1])];
        img.style.left = l + "px";
        img.style.top = t + "px";
        img.style.zIndex = this.layout[row].length;
        img.style.cursor = row >= 9 && row < 13 ? "default" : this.dragCursor;
        if (row < 9 && this.layout[row].length > 1) {// ???????????????????? ????????????
            img = document.images[String(this.layout[row][this.layout[row].length - 2])];
            img.style.cursor = "default";
        }

    },

    goBack: function() {
        if (this.histPos > 1) {
            var card;
            var row = this.hist[this.histPos - 2];
            var prevRow = this.hist[this.histPos - 1];
            var tmpf = function(pas) {
                card = pas.layout[prevRow].pop();
                pas.histPos -= 2;
                pas.layout[row].push(card);
                pas.setCardPlace(row);
                pas.updateButtons();
                pas.updateCursor(prevRow);
            };
            tmpf(this);
            while (this.hist.length >= 2) {
                row = this.hist[this.histPos - 2];
                prevRow = this.hist[this.histPos - 1];
                if (row >= 13 && row < 17 && prevRow < 9)
                    tmpf(this);
                else
                    break;
            }

        }
    },

    goAhead: function() {
        while (this.histPos < this.hist.length) {
            var prevRow = this.hist[this.histPos];
            var row = this.hist[this.histPos + 1];
            var card = this.layout[prevRow].pop();
            this.histPos += 2;
            this.layout[row].push(card);
            this.setCardPlace(row);
            this.updateButtons();
            this.updateCursor(prevRow);
            if (card < 52)
                break;
        }
    },
    updateButtons: function() {
        var btn = document.getElementById("btnBack");
        if (btn != null)
            btn.disabled = this.histPos == 0;
        btn = document.getElementById("btnForward");
        if (btn != null)
            btn.disabled = this.histPos == this.hist.length;
    },
    layout1: function() {
    },
    layout2: function() {
    },
    layout3: function() {
    },
    giveUp: function() {
    },
    makeHistStr: function() {
        var histTxt = document.getElementById("History");
        if (histTxt != null) {
            this.histStr = "";
            for (var i = 0; i < this.hist.length; i++) {
                this.histStr += this.charTab[this.hist[i]];
            }
            histTxt.value = this.histStr;
        }
    },
    setLayout: function(str) {
        this.hist = new Array();
        this.histPos = 0;

        var i;
        for (i = 0; i < 9; i++)
            for (j = 0; j < 6; j++) {
            var index = (j * 9 + i) * 2;
            var card = Number(str.slice(index, index + 2));
        }
        i = 0;
        while (str[i] != ":" && i < str.length)
            i++;
        while (i < str.length) {
            var s1 = str.charAt(i * 2);
            s1 = s1 >= 'A' ? s1 - 'A' + 10 : s1 - '0';
            var s2 = str.charAt(i * 2 + 1);
            s2 = s2 >= 'A' ? s2 - 'A' + 10 : s2 - '0';
            this.hist.push(s1);
            this.hist.push(s2);
            i += 2;
        }
        this.updateButtons();
        this.makeHistStr();
    },

    onMouseMove: function(e) {

	console.log("onMouseMove");
	 if(e.targetTouches != null)
	{
		if (e.targetTouches[0].pageY <= Pas.stTop)
        	    return;
        	e.preventDefault();
        	Pas.clientX = e.targetTouches[0].pageX;
        	Pas.clientY = e.targetTouches[0].pageY;
        	return Pas.moveCard(e);
	}
	else
	{
		if (e.clientX <= Pas.stTop)
        	    return;
        	e.preventDefault();
        	Pas.clientX = e.clientX;
        	Pas.clientY = e.clientY;
        	return Pas.moveCard(e);
	}
    },
    onLeftButtonDown: function(e) 
	{	
	if(e.targetTouches != null)
	{
		if (e.targetTouches[0].pageY <= Pas.stTop)
        	    return;
        	e.preventDefault();
        	Pas.clientX = e.targetTouches[0].pageX;
        	Pas.clientY = e.targetTouches[0].pageY;
        	if (true) 
		{
            		if (!Pas.grab) 
			{
                		Pas.grab = true;
                		Pas.grabCard(e);
            		}
        	}
	}
	else
	{	
		console.log(e.clientY);
		if (e.clientY <= Pas.stTop)
        	    return;
        	e.preventDefault();
        	Pas.clientX = e.clientX;
        	Pas.clientY = e.clientY;
        	if (true) 
		{
            		if (!Pas.grab) 
			{
                		Pas.grab = true;
                	Pas.grabCard(e);
            		}
        	}

	}
    },
    onLeftButtonUp: function(e) {
        if (true) 
	{
            if (Pas.grab) 
	    {
                Pas.grab = false;
                Pas.dropCard(e);
            }
        }
    },
    makeLayout:function( number )
    {
        var i,row,col,card,style;
        this.hist = new Array();
        this.histPos = 0;
        this.layout = new Array(15);
        for(i = 0; i < 15; i++)
            this.layout[i] = new Array();
        var cards;
	console.log(number);
	if( number == 1)		
		cards = new Array (40,49,20,19,32,26,38,24,39,31,1,16,47,29,17,18,23,15,9,25,46,37,41,30,42,27,44,14,28,48,3,36,10,11,43,12,34,7,51,33,5,35,8,0,21,52,2,22,13,50,6,45,53,4);
	else if(number == 2)	
		cards = new Array (40,49,20,19,32,26,38,24,39,31,1,16,47,29,17,18,23,15,9,25,46,37,41,30,42,27,44,14,28,48,3,36,10,11,43,12,34,7,51,33,5,35,8,0,21,52,2,22,13,50,6,45,53,4);
	else if(number == 3)	
		cards = new Array (18,11,42,37,15,4,47,9,2,32,6,5,16,38,27,24,17,21,29,35,1,45,46,13,44,34,14,3,25,49,26,51,19,40,39,31,48,36,43,41,20,10,30,7,33,23,8,0,28,52,53,12,22,50);
        for(row = 0; row < 6; row++)
        {
            for(col = 0; col < 9; col++)
            {
                card = row*9+col;
                this.layout[col].push(cards[card]);
                style = document.images[ String(cards[card])].style;
                style.top    = (this.stTop   + row*this.imageHeight/3 )+"px";
                style.left   = (this.stLeft + col*this.imageWidth )+"px";
                style.zIndex = row+1;
                style.cursor = row == 5 ? this.dragCursor : "default";
            }
        }
        for(i = 56; i < 60; i++)
        {
            style = document.images[String(i)].style;
            style.top    = ( this.stTop+this.imageHeight*(i-56) )+"px";
            style.left   = ( this.stLeft + this.imageWidth*9.5 )+"px";
            style.zIndex = 0;
        }
        document.images["54"].style.left = ( this.stLeft + this.imageWidth*11)+"px";
        document.images["54"].style.top  = this.stTop+"px";
        document.images["54"].style.zIndex = 0;
        document.images["54"].style.cursor = this.dragCursor;

        document.images["55"].style.left = (this.stLeft + this.imageWidth*11)+"px";
        document.images["55"].style.top  = ( this.stTop+this.imageHeight)+"px";
        document.images["55"].style.zIndex = 0;
        document.images["55"].style.cursor = this.dragCursor;
        this.updateButtons();
        this.makeHistStr();
    }
    
}
