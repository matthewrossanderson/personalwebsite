/*
Script: CountDownPro Timer
Description: Counts down or up from a date, fully customisable display, customisable events when countdown reaches zero! Development version - not to be used in a production environment.
Author: Andrew Urquhart
Home: http://andrewu.co.uk/clj/countdown/pro/
History:
20040317 1125UTC	v1		Andrew Urquhart		Based on countdown.js
20040331 1408BST	v1.3	"					Attempts to add to the currently window.onload schedule, rather than overriding it
20040507 1243BST	v1.4	"					Modified plural behaviour to act as a replacement for the mainlabel rather than a concatenation for those languages (e.g. Greek) that don't use concatenation for plurals but different words
20051231 2057GMT	v1.5	"					Switched to custom date format and custom date parser for better internationalisation and cross-browser compatibility (should fix reports of recent bugs in Mac browsers). Removed date parsing on every loop by storing event date object in global scope. Removed getElementById search on every loop by storing reference to DOM node in global scope.
20060101 1738GMT	v1.51	"					Made counter update 0.1s after the last whole second to ensure that we don't display the same second twice. Updated media playback - have it working in Op8,FF.
20070414 2313BST	v1.52	"					Added 'typeof CD_T' check to CD_T() incase references don't exist when the timeout resolves
20080913 1703BST	v1.53	"					Added functionality to trigger a function when a counter reaches zero
*/
// Configure according to meta elements
function CD_M(strTagId) {
	var objMeta = document.getElementsByTagName("meta");
	if (objMeta && objMeta.length) {
		// Loop over all meta tags
		for (var i=0; i<objMeta.length; ++i) {
			// Look for one that matches the counterId
			if (objMeta.item(i).scheme == strTagId) {
				// Match found, add meta data to collection
				var name	= objMeta.item(i).name;
				var content	= objMeta.item(i).content;
				if (name.indexOf("mindigits") > 0 || name.indexOf("hidezero") > 0) {
					// Content is an integer
					window[strTagId][name] = parseInt(content, 10);
				}
				else {
					// Content is a string
					window[strTagId][name]  = content;
				}
			}
		}
	}
}

// Update display
function CD_UD(strContent, objW) {
	objW.node.innerHTML = strContent;
}

// Tick loop
function CD_T(strTagId) {
	var objNow			= new Date();
	var objW			= window[strTagId];
	if (objW.msoffset) {
		// Correct for client's slow/fast clock
		objNow.setMilliseconds(objNow.getMilliseconds() + objW.msoffset);
	}
	CD_C(objNow, objW);

	// Has counter has reached zero and is an event defined?
	if (objW.intEvntDte <= objNow.valueOf()) {
		// Trigger a designated function
		if (objW.event_functionhandler && typeof window[objW.event_functionhandler] == "function") {
			window[objW.event_functionhandler](new Date(objW.intEvntDte));
			objW.event_functionhandler = "";
		}

		if (objW.event_msg || objW.event_redirecturl) {
			var msg = "<span id=\"" + strTagId + "_complete\">" + objW.event_msg + "</span>";

			if (objW.event_redirecturl) {
				// Redirect to a URI
				location.href = objW.event_redirecturl;
			}
			else if (objW.event_audio_src) {
				// Show message and play tune, then stop.
				var strMimeType	= objW.event_audio_mimetype;
				var audioObject = "<object style=\"visibility: hidden;\" id=\"MediaPlayer\" width=\"2\" height=\"2\" data=\"" + objW.event_audio_src + "\" type=\"" + strMimeType + "\"></object>";
				CD_UD(msg + audioObject, objW);
			}
			else {
				// Just show message and stop.
				CD_UD(msg, objW);
			}
			return;
		}
	}

	// Keep ticking
	setTimeout("if(typeof CD_T=='function'){CD_T(\"" + strTagId + "\")}", 1100-objNow.getMilliseconds()); // We offset from 1100 so that our clock ticks every second (the millisecond correction each loop sees to that), but updates 0.1s after every whole second so that we don't accidentally read the same Date() twice in the same second
}

// Calculate new display value and call drawing routine
function CD_C(objNow, objW) {
	var intMS = objW.intEvntDte - objNow.valueOf();
	if (intMS <= 0) {
		intMS *= -1;
	}
	var intD = Math.floor(intMS/864E5);
	intMS = intMS - (intD*864E5);
	var intH = Math.floor(intMS/36E5);
	intMS = intMS - (intH*36E5);
	var intM = Math.floor(intMS/6E4);
	intMS = intMS - (intM*6E4);
	var intS = Math.floor(intMS/1E3);
	var strTmp = CD_F(intD, "d", objW) + CD_F(intH, "h", objW) + CD_F(intM, "m", objW) + CD_F(intS, "s", objW);
	CD_UD(strTmp, objW);
}

// Format date/time
function CD_F(intData, strPrefix, objW) {
	if (intData == 0 && objW[strPrefix + "_hidezero"]) {
		return "";
	}
	var strResult = "" + intData;
	var intMinDigits = objW[strPrefix + "_mindigits"];
	if (intData.toString().length < intMinDigits) {
		strResult = "0000000000" + strResult;
		strResult = strResult.substring(strResult.length, strResult.length - intMinDigits);
	}
	if (intData != 1) {
		strResult += objW[strPrefix + "_units"];
	}
	else {
		strResult += objW[strPrefix + "_unit"];
	}
	return objW[strPrefix + "_before"] + strResult + objW[strPrefix + "_after"];
}

// Get Date() object from 2006-01-01 00:00:00 GMT+00:00 date format
function CD_Parse(strDate) {
	// Pattern match to a countdown date
	var objReDte = /(\d{4})\-(\d{1,2})\-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{0,2})\s+GMT([+\-])(\d{1,2}):?(\d{1,2})?/;

	if (strDate.match(objReDte)) {
		// Start with a default date and build it up into the countdown date through Date setter methods
		var d = new Date(0);

		d.setUTCFullYear(+RegExp.$1,+RegExp.$2-1,+RegExp.$3); // Set YYYY-MM-DD directly as UTC
		d.setUTCHours(+RegExp.$4,+RegExp.$5,+RegExp.$6); // Set HH:MM:SS directly as UTC

		// If there is a timezone offset specified then we need to compensate for the offset from UTC
		var tzs	= (RegExp.$7 == "-" ? -1 : 1); // Timezone sign
		var tzh = +RegExp.$8; // Get requested timezone offset HH (offset ahead of UTC)
		var tzm = +RegExp.$9; // Get requested timezone offset MM (offset ahead of UTC)
		if (tzh) {
			d.setUTCHours(d.getUTCHours() - tzh*tzs); // Compensate for timezone HH offset from UTC
		}
		if (tzm) {
			d.setUTCMinutes(d.getUTCMinutes() - tzm*tzs); // Compensate for timezone MM offset, depending on whether the requested MM offset is ahead or behind of UTC
		}
		return d; // Date now correctly parsed into a Date object correctly offset from UTC internally regardless of users current timezone.
	}
	else {
		return NaN; // Didn't match required date format
	};
}

// Entry point onload
function CD_Init() {
	var strTagPrefix	= "countdown";
	var objElem			= true; // temp value
	if (document.getElementById) {
		for (var i=1; objElem; ++i) {
			var strTagId = strTagPrefix + i;
			objElem = document.getElementById(strTagId);

			if (objElem && (typeof objElem.innerHTML) != 'undefined') {
				// OK, found a counter, start it ticking
				var strDate	= objElem.innerHTML;
				var objDate	= CD_Parse(strDate);
				if (!isNaN(objDate)) {
					var objW = window[strTagId] = new Object();
					objW.intEvntDte		= objDate.valueOf();
					objW.node			= objElem; // Handle to DOM element

					// Default formatting data
					objW.servertime		= "";
					objW.d_mindigits	= 1;
					objW.d_unit			= " day";
					objW.d_units		= " days";
					objW.d_before		= "";
					objW.d_after		= " ";
					objW.d_hidezero		= 0;
					objW.h_mindigits	= 2;
					objW.h_unit			= "h";
					objW.h_units		= "h";
					objW.h_before		= "";
					objW.h_after		= " ";
					objW.h_hidezero		= 0;
					objW.m_mindigits	= 2;
					objW.m_unit			= "m";
					objW.m_units		= "m";
					objW.m_before		= "";
					objW.m_after		= " ";
					objW.m_hidezero		= 0;
					objW.s_mindigits	= 2;
					objW.s_unit			= "s";
					objW.s_units		= "s";
					objW.s_before		= "";
					objW.s_after		= " ";
					objW.s_hidezero		= 0;
					objW.event_msg		= "";
					objW.event_audio_src		= "";
					objW.event_audio_mimetype	= "";
					objW.event_redirecturl		= "";
					objW.event_functionhandler	= "";

					// User-defined formatting data, overrides data in global-scope object objW
					CD_M(strTagId);

					// Calculate client-server time offset (ms)
					if (objW.servertime) {
						var objSrvrTm = CD_Parse(objW.servertime);
						if (isNaN(objSrvrTm)) {
							// Bad severtime date format, show subtle error
							objElem.innerHTML = strDate + "**";
							continue;
						}
						else {
							objW.msoffset = parseInt((objSrvrTm.valueOf() - (new Date()).valueOf())/1000, 10) * 1000; // MS truncated as causes non-integer second display update issue
						}
					}
					else {
						objW.msoffset = 0;
					}

					// Start ticking
					CD_T(strTagId);

					// Make visible (if hidden)
					if (objElem.style) {
						objElem.style.visibility = "visible";
					}
				}
				else {
					// Bad date format, show subtle error
					objElem.innerHTML = strDate + "<a href=\"http://andrewu.co.uk/clj/countdown/pro/\" title=\"CountdownPro Error: Invalid date format used, check documentation (see link)\">*</a>";
				}
			}
		}
	}
}

// Try not to commandeer the default onload handler if possible
if (window.attachEvent) {
	window.attachEvent('onload', CD_Init);
}
else if (window.addEventListener) {
	window.addEventListener("load", CD_Init, false);
}
else {
	window.onload = CD_Init;
}
