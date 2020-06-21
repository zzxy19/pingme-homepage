// This matrix was taken from https://gist.github.com/Lokno/df7c3bfdc9ad32558bb7
const colorMatrixLookup = {'Normal':[1,0,0,
                           0,1,0,
                           0,0,1],
// Red-Blind
'Protanopia':   [0.567,0.433,0.000,
                 0.558,0.442,0.000,
                 0.000,0.242,0.758],
// Red-Weak
'Protanomaly':  [0.817,0.183,0.000,
                 0.333,0.667,0.000,
                 0.000,0.125,0.875],
// Green-Blind
'Deuteranopia': [0.625,0.375,0.000,
                 0.700,0.300,0.000,
                 0.000,0.300,0.700],
// Green-Weak
'Deuteranomaly':[0.800,0.200,0.000,
                 0.258,0.742,0.000,
                 0.000,0.142,0.858],
// Blue-Blind
'Tritanopia':   [0.950,0.050,0.000,
                 0.000,0.433,0.567,
                 0.000,0.475,0.525],
// Blue-Weak
'Tritanomaly':  [0.967,0.033,0.00,
                 0.00,0.733,0.267,
                 0.00,0.183,0.817],
// Monochromacy
'Achromatopsia':[0.299,0.587,0.114,
                 0.299,0.587,0.114,
                 0.299,0.587,0.114],
// Blue Cone Monochromacy
'Achromatomaly':[0.618,0.320,0.062,
                 0.163,0.775,0.062,
                 0.163,0.320,0.516]};

var CANVAS_HEIGHT = 200;
var CANVAS_WIDTH = 300;
var colorBlindType = 'Deuteranomaly';

function displayImage(input) {
	if (input.files && input.files[0]) {
        var imageFile = input.files[0]
        var reader = new FileReader();
        reader.onload = function() {
        	var img = document.getElementById("origImage");
            img.src = reader.result;
        }
        reader.readAsDataURL(imageFile);
    }
}

function updateTypeSelection(selection) {
	colorBlindType = selection.options[selection.selectedIndex].value;
	console.log("Selected " + colorBlindType);
}

function renderImage() {
    var img = document.getElementById("origImage");
	console.log("Rendering canvas...");
	var c = document.getElementById("origCanvas");
	var ctx = c.getContext("2d");
	ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	const colorMatrix = colorMatrixLookup[colorBlindType];

  	originalImageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
 	modifiedImageData = applyFilter(originalImageData, increaseSaturationFilter, null);
 	cbOriginalImageData = applyFilter(originalImageData, colorBlindFilter, colorMatrix);
 	cbModifiedImageData = applyFilter(modifiedImageData, colorBlindFilter, colorMatrix);

  	var modifiedCanvas = document.getElementById("modifiedCanvas");
  	var modifiedCanvasCtx = modifiedCanvas.getContext("2d");
  	modifiedCanvasCtx.putImageData(modifiedImageData, 0, 0);

  	var cbOrigCanvas = document.getElementById("cbOrigCanvas");
  	var cbOrigCanvasCtx = cbOrigCanvas.getContext("2d");
  	cbOrigCanvasCtx.putImageData(cbOriginalImageData, 0, 0);

  	var cbModifiedCanvas = document.getElementById("cbModifiedCanvas");
  	var cbModifiedCanvasCtx = cbModifiedCanvas.getContext("2d");
  	cbModifiedCanvasCtx.putImageData(cbModifiedImageData, 0, 0);
}

/**
 * Applies the given filter to ImageData to generate a new ImageData.
 * param is for passing the colorblind matrix to the filter function.
 * For filters that don't need a param, you can pass null.
 */
function applyFilter(imageData, filter, param) {
	let i,r,g,b,adjustedRgb;
	var rgbaArray = new Uint8ClampedArray(imageData.data);
	var len = rgbaArray.length / 4;
	for (i = 0; i < len; i++) {
		r = rgbaArray[i*4]
		g = rgbaArray[i*4+1]
		b = rgbaArray[i*4+2]
		adjustedRgb = filter(r, g, b, param);
		rgbaArray[i*4] = adjustedRgb[0];
		rgbaArray[i*4+1] = adjustedRgb[1];
		rgbaArray[i*4+2] = adjustedRgb[2];
	}

  	var imageDataCopy = new ImageData(
	    rgbaArray,
	    imageData.width,
	    imageData.height
    );
  	return imageDataCopy;
}

function colorBlindFilter(r, g, b, matrix) {
	let newR, newG, newB;
	newR = matrix[0] * r + matrix[1] * g + matrix[2] * b;
	newG = matrix[3] * r + matrix[4] * g + matrix[5] * b;
	newB = matrix[6] * r + matrix[7] * g + matrix[8] * b;
	return [newR, newG, newB];
}

function increaseSaturationFilter(r, g, b, unusedParam) {
	let rgRatio,hsl,h,s,l,newRgb;
	let maxSaturation = false;
    if (r == 0 || g == 0) {
    	maxSaturation = true;
    } else {
    	rgRatio = 1.0 * r / g;
    	if (rgRatio > 1.0) {
    		rgRatio = 1.0 / rgRatio;
    	}
    }
	hsl = rgbToHsl(r, g, b);
	h = hsl[0];
	if (maxSaturation) {
		s = 1;
	} else {
		s = Math.pow(hsl[1], rgRatio / 3);
	}
	l = hsl[2]; //Math.sqrt(hsl[2]);
	newRgb = hslToRgb(h, s, l);
	return newRgb;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 *
 * This was taken from https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * and I believe the original author is https://gist.github.com/mjackson/5311256
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 *
 * This was taken from https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * and I believe the original author is https://gist.github.com/mjackson/5311256
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

