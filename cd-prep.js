/**
 * cd-prep.js
 * Clears existing selections, unlocks all layers and deletes invisibles,
 * flattens all layers, converts text to outlines (including grouped text),
 * saves versions of this as Illustrator 6, EPS v6, and as PDF v4.
 */

//$.bp();

if (documents.length > 0) {

  // STEP 1 : CLEAR ANY OLD SELECTIONS
  activeDocument.selection = null;
  
  // STEP 2 : UNLOCK ALL LAYERS; DELETE INVISIBLE LAYERS
  var layerCount = activeDocument.layers.length;
  for (var i = 0; i < layerCount; i++) {
    var currentLayer = activeDocument.layers[i];
    currentLayer.locked = false;
    if (!currentLayer.visible)  {
      currentLayer.visible = true;
      currentLayer.remove();
      layerCount = activeDocument.layers.length;
      i--;
    }
  }
  
  // STEP 3 : UNLOCK ALL ITEMS; DELETE INVISIBLE ITEMS
  if (activeDocument.pageItems.length > 0) {
    var theItems = activeDocument.pageItems,
      numItems = theItems.length;
    
    for (var i = 0; i < numItems; i++) {
      var currentItem = theItems[i];
      if (currentItem.typename != "TextPath_PathItems") {
        currentItem.locked = false;
        if (currentItem.hidden) {
          currentItem.hidden = false;
          currentItem.remove();
          numItems = theItems.length;
          i--;
        }
      }
    }
  }
  
  // STEP 4 : FLATTEN LAYERS
  var layerOne = activeDocument.layers[(layerCount-2)],
    layerZero = activeDocument.layers[(layerCount-1)];
  
  while (layerCount > 1) {
    if (layerOne.pageItems.length > 0) {
      theItems = layerOne.pageItems;
      itemCount = theItems.length;
      
      do {
        theItems[itemCount-1].moveToBeginning(layerZero);
      } while (--itemCount > 0);
      
      layerOne.remove();
      layerCount = activeDocument.layers.length;
      layerOne = activeDocument.layers[(layerCount-2)];
      layerZero = activeDocument.layers[(layerCount-1)];
    } else {
      layerOne.remove();
      layerCount = activeDocument.layers.length;
      layerOne = activeDocument.layers[(layerCount-2)];
      layerZero = activeDocument.layers[(layerCount-1)];
    }
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
    for (var i = 0; i < theGroups.length; i++) {
      if (theGroups[i].textArtItems.length > 0) {
        groupedText = theGroups[i].textArtItems;
        while (groupedText.length > 0) {
          groupedText[0].createOutline();
        }
      }
    }
  }
  
  // STEP 6 : SAVE VERSIONS AS...
  // DECLARE ASSORTED VARIABLES
  var nameString = activeDocument.name.toString(),
    fileName = nameString.slice(0, (nameString.length-3)),
    cdFolder = new Folder(activeDocument.path.toString() + "/CD_image");
  
  // STEP 6A : CREATE "CD_IMAGE" FOLDER
  if (!cdFolder.exists) {
    cdFolder.create();
  }
  
  // STEP 6B : ILLUSTRATOR 6
  var aiName = new File(cdFolder.fullName + "/" + fileName),
      aiOptions = new IllustratorSaveOptions();
  
  aiOptions.compatibility = Compatibility.ILLUSTRATOR6;
  aiOptions.compressed = false;
  aiOptions.flattenOutput = OutputFlattening.PRESERVEAPPEARANCE;
  activeDocument.saveAs(aiName, aiOptions);
  
  // STEP 6C : EPS 6
  var epsName = new File(cdFolder.fullName + "/" + fileName),
      epsOptions = new EPSSaveOptions();
  
  epsOptions.cmykPostScript = true;
  epsOptions.compatibility = Compatibility.ILLUSTRATOR6;
  epsOptions.flattenOutput = OutputFlattening.PRESERVEAPPEARANCE;
  activeDocument.saveAs(epsName, epsOptions);
  
  // STEP 6D : SAVE AS PDF 4
  var pdfName = new File(cdFolder.fullName + "/" + fileName),
      pdfOptions = new PDFSaveOptions();
  
  pdfOptions.compatibility = PDFCompatibility.ACROBAT4;
  pdfOptions.preserveEditability = false;
  // add more later as necessary?
  activeDocument.saveAs(pdfName, pdfOptions);
}
