const AvatarView =require('../../main').AvatarView;
let AView;
let AnotherView;
let JustSetTheAvatarViaUrl;

// get Parameters
document.addEventListener("DOMContentLoaded", function() {
	// "use strict";
	let token = document.getElementById('htmlToken').value;
  let piid = document.getElementById('htmlPIid').value;
	let url = document.getElementById('htmlURL').value;

	document.getElementById("refreshButton").addEventListener("click", () => {
		token = document.getElementById('htmlToken').value;
	  piid = document.getElementById('htmlPIid').value;

		AView.setToken(token);
		AView.setUser(piid);

	});

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

	JustSetTheAvatarViaUrl = new AvatarView(null, null, document.getElementById("viaURLAvatar"), "80px", false);
 	JustSetTheAvatarViaUrl.setImageFromURL("https://lh3.googleusercontent.com/-4VTFFjbVzjg/U_FvEuEzXxI/AAAAAAAAQdM/bRFkdVYqFW8/s400/%255BUNSET%255D");
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});

function refreshDemoData() {
	console.log("Hello world");
	return true;
};
