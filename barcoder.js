/**
 * barcoder.js
 * Takes a text selection in Illustrator 10, as pasted from the clipboard
 * output of the Elfring BarUPC Utility Demo; changes the font to approximately
 * 56pt "UPCA c Sample", and converts the selected text to outlines (so any
 * instance of "2" or "8" can be fixed).
 */

//$.bp();

function barcoder(){
	var theText = activeDocument.selection[0],
		codeFont = 'UPCAcSample',
		fontCode = 0;
	
	// STEP 1 : CHECK THAT "codeName" IS AVAILABLE
	if (textFaces.length > 0)	{
		var possessed = false,
			testedFont;
		
		for (var i = 0;  i < textFaces.length && !possessed; i++) {
			testedFont = textFaces[i];
			if (testedFont.name === codeFont) {
				fontCode = i;
				possessed = true;
			}
		}
		
		if (!possessed) {
			alert('System does not have "' + codeFont.toString() + '" loaded.  Script cannot continue properly.');
		}
	}
	
	// STEP 2 : CHANGE SELECTION'S FONT
	theText.textRange().font = textFaces[fontCode].name;
	theText.height = 0.9 * 72;
	theText.width = 1.4 * 72;
	
	// STEP 3 : CONVERT BARCODE TO OUTLINE
	theText.createOutline();
}

if (documents.length > 0) {
	// STEP 0 : CHECK THE SELECTION
	// 1st >> That it's just one item
	if (activeDocument.selection.length > 1) {
		alert("You cannot have more than one item selected when running this script.");
	}
	
	// 2nd >> That the selection is of type "textArtItem"
	if (activeDocument.selection[0] instanceof TextArtItem)	{
		// run the function!
		barcoder();
	} else {
		alert("You must have text selected when running this script.");
	}
}
