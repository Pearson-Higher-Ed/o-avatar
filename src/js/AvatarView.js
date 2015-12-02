// "use strict";

const view = requireText("../html/AvatarView.html");
const UProfileService = require("o-profile-service").UserProfileService;

const updateMsg = 'Update Profile Picture'
const loadingMsg = 'Loading Picture'
const noAvatarMsg = 'Choose an Avatar'
const unknownImage = "https://www.lariba.com/site/images/testimg/question.jpeg"
const loadingImage = "http://www.colorado.edu/Sociology/gimenez/graphics/gears.gif"

// *******************
function AvatarView(url, token,element, size, isEditable) {
	this.service = new UProfileService( url, token);

	this.elementlinks =[];
	this.profileData = {};
	this.myElement = element;

	this.addAvatarView(size,isEditable);
	return this;
}

// *******************
AvatarView.prototype.addAvatarView = function ( size, isEditable) {
	const container = document.createElement('div');
	container.innerHTML = view;

	this.myElement.appendChild(container);

	this.myElement.querySelector('.o-avatar_avatar-image').addEventListener('error', () => {
		console.log('error loading avatar');
		this.myElement.querySelector('.o-avatar_avatar-image').src = unknownImage;
		this.myElement.querySelector('.o-avatar_avatar-msg-button').textContent = noAvatarMsg;
	});

	this.myElement.querySelector(".o-avatar_avatar-msg-button").addEventListener("click", () => {
		this.myElement.querySelector(".o-avatar_avatar-edit-button").click();
		// this sends the click from the nice message button to the real button
	});

	this.myElement.querySelector(".o-avatar_avatar-edit-button").addEventListener("change", () => {
		this.addAvatar();
		// once the file is chosen this sets the avatar
	});
	console.log("size: "+ size)
	this.myElement.querySelector('.o-avatar_detail-avatar').style.height =size;
	this.myElement.querySelector('.o-avatar_detail-avatar').style.width = size;
	console.log("isEditable: "+ isEditable);
	if(isEditable === true){
			this.myElement.querySelector('.o-avatar_avatar-msg-button').style.visibility="visible";
	}else{
			this.myElement.querySelector('.o-avatar_avatar-msg-button').style.visibility="hidden";
	}
}

// *******************
// this function links the update of one avatar to another for use in multiple avatars on a page
AvatarView.prototype.linkAvatarView = function ( element) {
	this.elementlinks.push(element);
};


// *******************
AvatarView.prototype.updateCallback = function (err, text) {
	if (err !== null) {
		console.error("There has been an error setting profile: " + err.responseText + " "+ text)
		return;
	}
}

// *******************
AvatarView.prototype.setUser = function (id) {
	this.service.getProfile(id, this.parseUserProfile.bind(this));
}

// *******************
AvatarView.prototype.updateAvatar = function (id, data) {
	this.service.setProfile(id, data, this.parseUserProfile.bind(this));
};

// *******************
AvatarView.prototype.setToken = function (token) {
	this.service.token = token;
};

// *******************
AvatarView.prototype.parseUserProfile = function (err, text) {
	if (err !== null) {
		console.error("There has been an error getting avatar: " + err.responseText)
		return;
	}

	try {
		this.profileData = JSON.parse(text);
	}
	catch (e) {
		console.error(e, "userprofile json not well formed: " + text);
		this.profileData = {};
	}
	const pd = this.profileData;

	console.log('updating with avatar'+ pd.avatar);

	this.myElement.querySelector('.o-avatar_avatar-image').src = pd.avatar || "Add an Avatar"
	// set all avatars on the page
		// var avs =document.querySelectorAll('.o-avatar_avatar-image')
		let i=0;
		for(i =0; i < this.elementlinks.length; i++){
				console.log("updating some other link: " + this.elementlinks[i].myElement.querySelector('.o-avatar_avatar-image').src);
				this.elementlinks[i].myElement.querySelector('.o-avatar_avatar-image').src = pd.avatar || "Add an Avatar";
			};

};

// *******************
AvatarView.prototype.addAvatar = function () {
	const self = this;
	const fileSelected = self.myElement.querySelector(".o-avatar_avatar-edit-button").files;
	if (fileSelected.length > 0) {
		console.log("my files" + fileSelected[0].name);

		self.myElement.querySelector('.o-avatar_avatar-msg-button').textContent = loadingMsg;
		self.myElement.querySelector(".o-avatar_avatar-image").src = loadingImage;

		console.log('setting avatar in user profile')
		this.service.setAvatar(this.profileData.id, fileSelected[0], function (err, txt) {
		console.log("I have received a response from avatar, I will wait a couple of seconds before using it")
		// the avatar is not necessarily availble as soon as the response comes back from user Profile
		// it could take a few seconds for the avatar to be availble for use.
			setTimeout(function () {
				self.parseUserProfile(err, txt);
				self.myElement.querySelector('.o-avatar_avatar-msg-button').textContent = updateMsg;
			}, 2000);

		});

	}
};



module.exports = AvatarView;
