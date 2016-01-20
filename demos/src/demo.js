const AvatarView =require('../../main').AvatarView;
let AView;
let AnotherView;

// get Parameters
document.addEventListener("DOMContentLoaded", function() {
	// "use strict";
	const token = document.getElementById('htmlToken').value;
  const piid = document.getElementById('htmlPIid').value;
	const url = document.getElementById('htmlURL').value;


	// make a new Avatar (Required)
	AView = new AvatarView(url, token, document.getElementById("largeAvatar"), "160px", true);
	console.log("new avatar")
	// make another view (a small header like avatar) (optional)
	AnotherView = new AvatarView(url, token, document.getElementById("smallAvatar"), "40px", false);

	// link the header to the profile view so that they will both change
	// on update of the first one (optional)
	AView.linkAvatarView(AnotherView);

	// when you decide which user to get the avatar for set the Pi Id (Required)
	AView.setUser(piid);



	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
