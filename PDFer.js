/**
 * PDFer.js
 * Clears the old selection, unlocks all layers (deletes invisibles), unlocks
 * all items (deletes invisibles), flattens the layers, prompts whether or not
 * you want to convert text to outlines, does/not convert text to outlines,
 * saves a PDF v4 with basically the same file name.
 */

//$.bp();

if (documents.length > 0)	{
	// STEP 0 : CLEAR ANY OLD SELECTIONS
	activeDocument.selection = null;
	
	// STEP 1 : UNLOCK ALL LAYERS; DELETE INVISIBLE LAYERS
	var layerCount = activeDocument.layers.length;
	for (var i = 0; i < layerCount; i++) {
		var layer = activeDocument.layers[i];
		layer.locked = false;
		if (layer.visible == false)	{
			layer.visible = true;
			layer.remove();
			layerCount = activeDocument.layers.length;
			i--;
		}
	}
	
	// STEP 2 : UNLOCK ALL ITEMS; DELETE INVISIBLE ITEMS
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
	
	// STEP 3 : FLATTEN ALL LAYERS
	var layerOne = activeDocument.layers[layerCount - 2];
	var layerZero = activeDocument.layers[layerCount - 1];
	while (layerCount > 1) {
		if (layerOne.pageItems.length > 0)	{
			theItems = layerOne.pageItems;
			itemCount = theItems.length;
			do {
				theItems[itemCount-1].moveToBeginning(layerZero);
			} while (--itemCount > 0);
		}
		layerOne.remove();
		layerCount = activeDocument.layers.length;
		layerOne = activeDocument.layers[layerCount - 2];
		layerZero = activeDocument.layers[layerCount - 1];
	}
	
	// STEP 4 : CONVERT FONTS TO OUTLINES?
	var yesOrNo = confirm("Do you want to convert text to outlines?");
	
	if (yesOrNo) {
		// STEP A : CONVERT UNGROUPED TEXT
		if (activeDocument.textArtItems.length > 0)	{
			theText = activeDocument.textArtItems;
			while (theText.length > 0) {
				theText[0].createOutline();
			}
		}
		// STEP B : CONVERT GROUPED TEXT
		if (activeDocument.groupItems.length > 0)	{
			theGroups = activeDocument.groupItems;
			for (var i = 0; i < theGroups.length; i++) {
				if (theGroups[i].textArtItems.length > 0) {
					groupedText = theGroups[i].textArtItems;
					while (groupedText.length > 0) {
						groupedText[0].createOutline();
					}
				}
			}
		}
	}
	
	// STEP 5 : SAVE VERSION AS PDF...
	// DECLARE FINAL VARIABLES
	var nameString = activeDocument.name.toString(),
		nameLength = nameString.length;
	
	fileName = nameString.slice(0, nameLength-3);
	pdfFileSpec = new File(fileName);
	
	// SAVE AS PDF 4
	pdfOptions = new PDFSaveOptions;
	pdfOptions.compatibility = PDFCompatibility.ACROBAT4;
	pdfOptions.preserveEditability = false;
	// add more later as necessary?
	activeDocument.saveAs(pdfFileSpec, pdfOptions);
}