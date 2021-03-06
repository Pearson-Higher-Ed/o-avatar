const AvatarView =require('../../main').AvatarView;
const UProfileService = require("o-profile-service").UserProfileService;
let AView;
let CView;
let AnotherView;
let JustSetTheAvatarViaUrl;

// get Parameters
document.addEventListener("DOMContentLoaded", function() {
	// "use strict";
	let token = document.getElementById('htmlToken').value;
  let piid = document.getElementById('htmlPIid').value;
	let url = document.getElementById('htmlURL').value;

	// url is the userprofile service url
	let service = new UProfileService(url, token);

	document.getElementById("refreshButton").addEventListener("click", () => {
		token = document.getElementById('htmlToken').value;
	  piid = document.getElementById('htmlPIid').value;

		service.setToken(token);
		CView.setUser(piid);
		AView.setUser(piid);
	});




	// make a new Avatar (Required)
	AView = new AvatarView(service, document.getElementById("largeAvatar"), "160px", true, "english");
	console.log("new avatar")
	// make another view (a small header like avatar) (optional)
	AnotherView = new AvatarView(service, document.getElementById("smallAvatar"), "40px", false);

	// link the header to the profile view so that they will both change
	// on update of the first one (optional)
	AView.linkAvatarView(AnotherView);

	// an avatar in chinese for good measure
	CView = new AvatarView(service, document.getElementById("chineseAvatar"), "200px", true, "chinese");
	// the odd circumstance where we have two avatar editors linked together on the same page
	AView.linkAvatarView(CView);
	CView.linkAvatarView(AView);


	// when you decide which user to get the avatar for set the Pi Id (Required)
	AView.setUser(piid);
	CView.setUser(piid);
	JustSetTheAvatarViaUrl = new AvatarView(null, document.getElementById("viaURLAvatar"), "80px", false);
 	JustSetTheAvatarViaUrl.setImageFromURL("https://lh3.googleusercontent.com/-4VTFFjbVzjg/U_FvEuEzXxI/AAAAAAAAQdM/bRFkdVYqFW8/s400/%255BUNSET%255D");
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});

function refreshDemoData() {
	console.log("Hello world");
	return true;
};
