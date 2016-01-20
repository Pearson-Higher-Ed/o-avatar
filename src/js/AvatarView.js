// "use strict";

const view = requireText("../html/AvatarView.html");
const UProfileService = require("o-profile-service").UserProfileService;

const updateMsg = 'Update Picture'
const loadingMsg = 'Loading Picture'
const noAvatarMsg = 'Add A Picture'
const unknownImage = "https://www.lariba.com/site/images/testimg/question.jpeg"

// *******************
function AvatarView(url, token,element, size, isEditable) {
	this.service = new UProfileService( url, token);

	this.elementlinks =[];
	this.profileData = {};
	this.myElement = element;
	this.emptyPicture = true;

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
		this.myElement.querySelector('.o-avatar_avatar-msg-msg').textContent = noAvatarMsg;
	});
	let elem =	this.myElement.querySelector(".o-avatar_avatar-update-choice");
	this.myElement.querySelector(".o-avatar_avatar-msg-button").addEventListener("click", () => {
		if(this.emptyPicture){
				this.myElement.querySelector(".o-avatar_avatar-edit-button").click();
		}else{
			if( elem.style.display==='block'){
				elem.style.display='none';
			}else{
				elem.style.display ='block';
			}
		}
		// this sends the click from the nice message button to the real button
	});

	// if avatar change button is pushed go to the input (which is hidden) and click that
	this.myElement.querySelector(".o-avatar_avatar-update-change").addEventListener("click", () => {
		this.myElement.querySelector(".o-avatar_avatar-edit-button").click();
		// this sends the click from the nice message button to the real button
	});

	this.myElement.querySelector(".o-avatar_avatar-update-delete").addEventListener("click", () => {
		this.removeAvatar();
		this.myElement.querySelector(".o-avatar_avatar-update-choice").style.display='none';
	});

	this.myElement.querySelector(".o-avatar_avatar-edit-button").addEventListener("change", () => {
		this.addAvatar();
		this.myElement.querySelector(".o-avatar_avatar-update-choice").style.display='none';
		// once the file is chosen this sets the avatar
	});
	console.log("size: "+ Math.floor((parseInt(size) )) +"px")
	this.myElement.querySelector('.o-avatar_avatar').style.height = size;
	this.myElement.querySelector('.o-avatar_avatar').style.width = size;
	this.myElement.querySelector('.o-loader').style.width = Math.floor((parseInt(size)*.9 )) +"px";
	this.myElement.querySelector('.o-loader').style.height =Math.floor((parseInt(size)*.9 )) +"px";
	console.log("isEditable: "+ isEditable);
	if(isEditable === true){
			this.myElement.querySelector('.o-avatar_avatar-msg-button').style.display="block";
			this.myElement.querySelector('.o-avatar_avatar-msg-button').style.width = size;
			this.myElement.querySelector('.o-avatar_avatar-update-choice').style.width = size;
	}else{
			this.myElement.querySelector('.o-avatar_avatar-msg-button').style.display="none";
	}
}

// *******************
AvatarView.prototype.isDefaultImage = function () {
	return this.emptyPicture;
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
		console.error("There has been an error getting avatar: " + err.responseText);
	}

	try {
		this.profileData = JSON.parse(text);
		if(this.profileData === null) this.profileData ={};
	}
	catch (e) {
		console.error(e, "userprofile json not well formed: " + text);
		this.profileData = {};
	}
	const pd = this.profileData;

	// console.log('updating with avatar'+ pd.avatar);

	if(!pd || ! pd.avatar || pd.avatar ===""){
		this.myElement.querySelector('.o-avatar_avatar-msg-msg').text = noAvatarMsg;
		this.emptyPicture = true;
	}else{
		this.myElement.querySelector('.o-avatar_avatar-msg-msg').text = updateMsg;
		this.emptyPicture = false;
	}

	this.myElement.querySelector('.o-avatar_avatar-image').src = pd.avatar || noAvatarMsg;
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

		self.myElement.querySelector('.o-avatar_avatar-msg-msg').textContent = loadingMsg;
		self.myElement.querySelector(".o-avatar_avatar-image").src = '';

		self.myElement.querySelector('.o-loader').style.display = 'block';

		console.log('setting avatar in user profile')
		this.service.setAvatar(this.profileData.id, fileSelected[0], function (err, txt) {
			if(err !== null){
				console.log("an error has occured in setting the avatar: "+ err.responseText);
				// don't return here.  if invalid token then just put up blank avatar
			}

		console.log("I have received a response from avatar, I will wait a couple of seconds before using it")
		// the avatar is not necessarily availble as soon as the response comes back from user Profile
		// it could take a few seconds for the avatar to be availble for use.
			setTimeout(function () {
				self.parseUserProfile(err, txt);
				self.myElement.querySelector('.o-avatar_avatar-msg-msg').textContent = updateMsg;
				self.myElement.querySelector('.o-loader').style.display = 'none';
			}, 2000);

		});

	}
};

// *******************
AvatarView.prototype.removeAvatar = function () {
	// get the latest userprofile
	this.service.getProfile(this.profileData.id, this.parseUserProfile.bind(this));
	this.profileData.avatar = null;
	this.service.setProfile(this.profileData.id, JSON.stringify(this.profileData), this.parseUserProfile.bind(this));
};


module.exports = AvatarView;
