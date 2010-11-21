/**
 * label-proof-maker.js
 * Take a label, paste it (centered) into a new letter-size document, and save
 * as a PDF v4.
 */

//$.bp();

var activeDoc = activeDocument;

if (documents.length > 0)	{
	// STEP 0 : STORE SOME VAR INFO FOR LATER
	var nameSlice = activeDoc.name.toString().slice(0, ((activeDoc.name.toString().length)-3)),
		pdfName = new File(activeDoc.path.toString() + "/" + nameSlice);
		
	// STEP 1 : CLEAR ANY OLD SELECTIONS
	activeDoc.selection = null;
	
	// STEP 2 : UNLOCK ALL LAYERS
	var layerCount = activeDoc.layers.length;
	for (var i = 0; i < layerCount; i++) {
		activeDoc.layers[i].locked = false;
	}
	
	// STEP 3 : UNLOCK ALL ITEMS
	if (activeDocument.pageItems.length > 0) {
		theItems = activeDoc.pageItems;
		numItems = theItems.length;
		for (var i = 0; i < numItems; i++) {
			theItems[i].locked = false;
		}
	}
	
	// STEP 4 : FLATTEN ALL LAYERS
	var layerOne = activeDoc.layers[layerCount - 2],
		layerZero = activeDoc.layers[layerCount - 1];
	
	while (layerCount > 1) {
		if (layerOne.pageItems.length > 0) {
			theItems = layerOne.pageItems;
			itemCount = theItems.length;
			
			do {
				theItems[itemCount-1].moveToBeginning(layerZero);
			} while (--itemCount > 0);
			
			layerOne.remove();
			layerCount = activeDoc.layers.length;
			layerOne = activeDoc.layers[layerCount - 2];
			layerZero = activeDoc.layers[layerCount - 1];
		} else {
			layerOne.remove();
			layerCount = activeDoc.layers.length;
			layerOne = activeDoc.layers[(layerCount-2)];
			layerZero = activeDoc.layers[(layerCount-1)];
		}
	}
	
	// STEP 5 : CONVERT TEXT ITEMS TO OUTLINES
	// STEP 5A : SELECT ALL TEXT ART ITEMS
	if (activeDoc.textArtItems.length > 0) {
		theText = activeDoc.textArtItems;
		textCt = theText.length;
		
		for (var i = 0; i < textCt; i++) {
			thisText = theText[i];
			thisText.selected = true;
		}
	}
	
	// STEP 5B : CYCLE THRU SELECTION ELEMENTS & CREATE OUTLINES
	selectedText = activeDoc.selection;
	selectionCt = selectedText.length;
	for (var i = 0; i < selectionCt; i++) {
		if (selectedText[i].typename == "TextArtItem")	{
			selectedText[i].createOutline();
		}
	}
	
	// STEP 6A : DE-SELECT ALL...
	activeDoc.selection = null;
	
	// STEP 6B : ...SO YOU CAN SELECT ALL
	if (activeDoc.pageItems.length > 0) {
		theItems = activeDoc.pageItems;
		numItems = theItems.length;
		for (var i = 0; i < numItems; i++) {
			theItems[i].selected = true;
		}
	}
	
	// STEP 7 : CREATE SELECTION REFERENCE
	var kSelect = activeDoc.selection;
	
	// STEP 8A : CREATE NEW DOCUMENT...
	var pdfProof = documents.add(DocumentColorSpace.CMYK, 8.5 * 72, 11 * 72);
	
	// STEP 8B : ...AND POPULATE IT WITH "keySelection"
	for (var i = 0; i < kSelect.length; i++) {
		newItem = kSelect[i].duplicate();
		newItem.moveToEnd(pdfProof);
	}
	
	// STEP 9 : SAVE "pdfProof"
	var pdfOptions = new PDFSaveOptions;
	pdfOptions.compatibility = PDFCompatibility.ACROBAT4;
	pdfOptions.preserveEditability = false;
	// more options if necessary?
	pdfProof.saveAs(pdfName, pdfOptions);
	
	// STEP 10 : CLOSE "activeDoc" w/o saving changes
	// ...this is so that YOU can't close it and
	// accidentally save the flattened version
	activeDoc.close(SaveOptions.DONOTSAVECHANGES);
}