/**
 * proof-maker.js
 * Clears old selections, unlocks all layers (deletes invisibles), unlocks all
 * items (deletes invisibles), flattens layers, converts text to outlines
 * (including grouped text), de/re-selects all, and essentially copies/pastes
 * the selection into a new letter-size, portrait-oriented document, saving the
 * new document as a PDF and closing the original without saving so you can't
 * save over the original and mess it up.
 */

//$.bp();

var activeDoc = activeDocument;

if (documents.length > 0) {
	// STEP 0 : STORE SOME VAR INFO FOR LATER
	var nameSlice = activeDoc.name.toString().slice(0, ((activeDoc.name.toString().length)-3)),
		pdfName = new File(activeDoc.path.toString() + "/" + nameSlice);
	
	// STEP 1 : CLEAR ANY OLD SELECTIONS
	activeDoc.selection = null;
	
	// STEP 2 : UNLOCK ALL LAYERS; DELETE INVISIBLE LAYERS
	var layerCount = activeDocument.layers.length;
	for (var i = 0; i < layerCount; i++) {
		var theLayer = activeDocument.layers[i];
		theLayer.locked = false;
		if (theLayer.visible == false)	{
			theLayer.visible = true;
			theLayer.remove();
			layerCount = activeDocument.layers.length;
			i--;
		}
	}
	
	// STEP 3 : UNLOCK ALL ITEMS; DELETE INVISIBLE ITEMS
	if (activeDocument.pageItems.length > 0) {
		theItems = activeDocument.pageItems;
		numItems = theItems.length;
		for (var i = 0; i < numItems; i++) {
			var item = theItems[i];
			if (item.typename != "TextPath_PathItems")	{
				item.locked = false;
				if (item.hidden == true)	{
					item.hidden = false;
					item.remove();
					numItems = theItems.length;
					i--;
				}
			}
		}
	}
	
	// STEP 4 : FLATTEN ALL LAYERS
	var layerOne = activeDoc.layers[layerCount - 2],
		layerZero = activeDoc.layers[layerCount - 1];
	
	while (layerCount > 1) {
		if (layerOne.pageItems.length > 0)	{
			theItems = layerOne.pageItems;
			itemCount = theItems.length;
			do {
				theItems[itemCount - 1].moveToBeginning(layerZero);
			}	while (--itemCount > 0);
		}
		layerOne.remove();
		layerCount = activeDoc.layers.length;
		layerOne = activeDoc.layers[(layerCount-2)];
		layerZero = activeDoc.layers[(layerCount-1)];
	}
	
	// STEP 5 : CONVERT TEXT TO OUTLINES
	// STEP A : CONVERT UNGROUPED TEXT
	if (activeDocument.textArtItems.length > 0) {
		theText = activeDocument.textArtItems;
		while (theText.length > 0) {
			theText[0].createOutline();
		}
	}
	
	// STEP B : CONVERT GROUPED TEXT
	if (activeDocument.groupItems.length > 0) {
		theGroups = activeDocument.groupItems;
		for (var i=0; i < theGroups.length; i++)	{
			if (theGroups[i].textArtItems.length > 0)	{
				groupedText = theGroups[i].textArtItems;
				while (groupedText.length > 0)	{
					groupedText[0].createOutline();
				}
			}
		}
	}
	
	// STEP 6A : DE-SELECT ALL...
	activeDoc.selection = null;
	
	// STEP 6B : ...SO YOU CAN SELECT ALL
	if (activeDoc.pageItems.length > 0)	{
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
	for (var i = 0; i < kS elect.length; i++) {
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