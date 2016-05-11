// "use strict";

const view = requireText("../html/AvatarView.html");
const translation = requireText("../translation/translations.json");
const UProfileService = require("o-profile-service").UserProfileService;
const ImageCropper =require('o-image-cropper').ImageCropper;


const unknownImage = "https://console.pearson.com/images/e9458be08c02638f73609401880032e24f5bcba2/user.jpg"
const CROPIMAGESIZE = 500;
const MAXIMAGEWIDTH = 750;
const EDITORFORMPADFORBUTTONSHEIGHT = 185;
const EDITORFORMPADFORBUTTONSWIDTH = 25;


// shim to define toBlob for browsers that don't have it
if( !HTMLCanvasElement.prototype.toBlob ) {
    Object.defineProperty( HTMLCanvasElement.prototype, 'toBlob', {
        value: function( callback, type, quality ) {
            const bin = atob( this.toDataURL( type, quality ).split(',')[1] ),
                  len = bin.length,
                  len32 = len >> 2,
                  a8 = new Uint8Array( len ),
                  a32 = new Uint32Array( a8.buffer, 0, len32 );

            for( var i=0, j=0; i < len32; i++ ) {
                a32[i] = bin.charCodeAt(j++)  |
                    bin.charCodeAt(j++) << 8  |
                    bin.charCodeAt(j++) << 16 |
                    bin.charCodeAt(j++) << 24;
            }

            let tailLength = len & 3;

            while( tailLength-- ) {
                a8[ j ] = bin.charCodeAt(j++);
            }

            callback( new Blob( [a8], {'type': type || 'image/png'} ) );
        }
    });
}
// *******************
function AvatarView( service,element, size, isEditable, language) {

  this.translator = new Translator(language);

  this.noAvatarMsg =   this.translator.translate('avatar.new');
  this.updateMsg =  this.translator.translate('avatar.update');
  this.loadingMsg = this.translator.translate('avatar.loading');

	this.service = service;

	this.elementlinks =[];
	this.profileData = {};
	this.myElement = element;
	this.emptyPicture = true;
	this.size = "500px";
	this.crop = {};
	this.imageCandidate = new Image();
	this.addAvatarView(size,isEditable);

  this.element = this.translator.translateHTML(element);

	return this;
}

 AvatarView.prototype.handleOutsideBubbleclick = function( evt){
	let elem =	this.myElement.querySelector(".o-avatar_avatar-update-choice");
	elem.style.display ="none";
}


// *******************
AvatarView.prototype.addAvatarView = function ( size, isEditable) {
	const container = document.createElement('div');
	container.innerHTML = view;

	this.myElement.appendChild(container);

	this.myElement.querySelector('.o-avatar_avatar-image').addEventListener('error', () => {
		this.myElement.querySelector('.o-avatar_avatar-image').src = unknownImage;
		this.myElement.querySelector('.o-avatar_avatar-msg-msg').textContent = this.noAvatarMsg;
	});

	let elem =	this.myElement.querySelector(".o-avatar_avatar-update-choice");
	this.myElement.querySelector(".o-avatar_avatar-msg-button").addEventListener("click", (evt) => {
		evt.stopPropagation();
		if(this.emptyPicture){
				this.myElement.querySelector(".o-avatar_avatar-edit-button").click();
		}else{
			if( elem.style.display==='block'){
				elem.style.display='none';
				document.body.removeEventListener("click",this.handleOutsideBubbleclick.bind(this) );
			}else{
				elem.style.display ='block';
				document.body.addEventListener("click",this.handleOutsideBubbleclick.bind(this) );
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
    this.handleDeleteModal();
  });
  this.myElement.querySelector(".o-avatar_delete--submit").addEventListener("click", () => {
    this.handleDeleteSubmit();
  });

  this.myElement.querySelector(".o-avatar_delete--cancel-edit").addEventListener("click", () => {
    this.handleDeleteCancel();
  });
  this.myElement.querySelector(".o-avatar_delete-form-kill").addEventListener("click", () => {
    this.handleDeleteCancel();
  });

  this.myElement.querySelector(".o-avatar_editor-form-kill").addEventListener("click", () => {
    this.handleEditFormClear();
  });

	this.myElement.querySelector(".o-avatar--cancel-edit").addEventListener("click", () => {
		this.handleEditFormClear();
	});

	this.myElement.querySelector(".o-avatar--submit-crop").addEventListener("click", () => {
		this.handleImageSave();

	});

	this.myElement.querySelector(".o-avatar_avatar-edit-button").addEventListener("change", () => {
		this.handleEditPicture();
		// once the file is chosen this sets the avatar
	});
	this.myElement.querySelector('.o-avatar_avatar').style.height = size;
	this.myElement.querySelector('.o-avatar_avatar').style.width = size;
	this.myElement.querySelector('.o-loader').style.width = Math.floor((parseInt(size)*.9 )) +"px";
	this.myElement.querySelector('.o-loader').style.height =Math.floor((parseInt(size)*.9 )) +"px";
	if(isEditable === true){
			this.myElement.querySelector('.o-avatar_avatar-msg-button').style.display="block";
			this.myElement.querySelector('.o-avatar_avatar-msg-button').style.width = size;
			this.myElement.querySelector('.o-avatar_avatar-update-choice').style.width = size;
			this.myElement.querySelector('.o-avatar_editor-form').style.display = 'none';

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
	this.setBannerText(pd.avatar);

	this.setImageFromURL(pd.avatar);
	// set all avatars on the page

		let i=0;
		for(i =0; i < this.elementlinks.length; i++){
			this.elementlinks[i].setBannerText(pd.avatar);
			this.elementlinks[i].setImageFromURL(pd.avatar);
		};

};

// *******************
AvatarView.prototype.setImageFromURL = function ( image) {
	let img =this.myElement.querySelector('.o-avatar_avatar-image');
	let size = parseInt(	this.myElement.querySelector('.o-avatar_avatar').style.height);

	img.src = image || this.noAvatarMsg;
	// if(img.width > this.size){img.width = this.size;	}

	let img2 =this.myElement.querySelector('.o-avatar_avatar-image');
		// console.log(" old dimensions: ",		img2.width , 	img2.height );
	if(img2.width > size){
		img.style.height = Math.floor(size* img2.height / img2.width)+"px";
		img.style.width = size + "px";
	}
	if(img2.height > size){
		img.style.width = Math.floor(size* img2.width / img2.height)+"px";
		img.style.height = size + "px";
	}

	// console.log(" new dimensions: ",		img.style.width , 	img.style.height );
}

// *******************
AvatarView.prototype.setBannerText = function ( image) {

		if( ! image || image ===""){
			this.myElement.querySelector('.o-avatar_avatar-msg-msg').textContent = this.noAvatarMsg;
			this.emptyPicture = true;
		}else{
			// this.myElement.querySelector('.o-avatar_avatar-msg-msg').text = this.updateMsg;
			this.myElement.querySelector('.o-avatar_avatar-msg-msg').textContent = this.updateMsg;
			this.emptyPicture = false;
		}
}

// *******************
AvatarView.prototype.addAvatar = function () {
	const self = this;
	const fileSelected = this.myElement.querySelector(".o-avatar_avatar-edit-button").files;
	if (fileSelected.length != 1) {
		console.log("chose only one file");
		return;
	}
	console.log("my files" + fileSelected[0].name);
	this.triggerLoadingDisplay();

	this.service.setAvatar(this.profileData.id, fileSelected[0], function (err, txt) {
		self.waitThenUpdateDisplay(err, txt);
	});
};

AvatarView.prototype.triggerLoadingDisplay = function () {

		this.myElement.querySelector(".o-avatar_avatar-update-choice").style.display = 'none';
		this.myElement.querySelector('.o-avatar_avatar-msg-msg').textContent = this.loadingMsg;
		this.myElement.querySelector(".o-avatar_avatar-image").src = '';

		this.myElement.querySelector('.o-loader').style.display = 'block';

		console.log('setting avatar in user profile')
};

AvatarView.prototype.waitThenUpdateDisplay = function (err, txt) {
	let self = this;
	if(err !== null){
		console.log("an error has occured in setting the avatar: "+ err.responseText);
		// don't return here.  if invalid token then just put up blank avatar
	}

	console.log("I have received a response from avatar, I will wait a couple of seconds before using it")
	// the avatar is not necessarily availble as soon as the response comes back from user Profile
	// it could take a few seconds for the avatar to be availble for use.
	setTimeout(function () {
		self.parseUserProfile(err, txt);
		self.myElement.querySelector('.o-loader').style.display = 'none';
	}, 2000);
};

// *******************
AvatarView.prototype.removeAvatar = function () {
	// get the latest userprofile
	this.service.getProfile(this.profileData.id, this.parseUserProfile.bind(this));
	this.profileData.avatar = null;
	this.service.setProfile(this.profileData.id, JSON.stringify(this.profileData), this.parseUserProfile.bind(this));
};

AvatarView.prototype.handleDeleteModal = function () {
  this.myElement.querySelector('.o-avatar_delete-form').style.display = 'block';
}

AvatarView.prototype.handleDeleteSubmit = function () {
  this.removeAvatar();
  this.myElement.querySelector('.o-avatar_delete-form').style.display = 'none';
  this.myElement.querySelector(".o-avatar_avatar-update-choice").style.display='none';
}

AvatarView.prototype.handleDeleteCancel = function () {
  this.myElement.querySelector('.o-avatar_delete-form').style.display = 'none';
  this.myElement.querySelector(".o-avatar_avatar-update-choice").style.display='none';
}

// *******************
AvatarView.prototype.handleEditPicture = function () {
	// dont show the avatar, only show the cropping tool
	this.myElement.querySelector('.o-avatar_detail-avatar').style.display = 'none';
	const self = this;
 // 	this.addAvatar();
	const fileSelected = self.myElement.querySelector(".o-avatar_avatar-edit-button").files;
	if (fileSelected.length != 1) {
		console.log("chose only one file");
		this.handleEditFormClear();
		return;
	}
	console.log("loading file: " + fileSelected[0].name);

	// load the file into a imageCandidate and attach the cropper ui
	var reader = new FileReader();
	self.imageCandidate = 	new Image();
	self.imageCandidate.setAttribute("class", "o-avatar_cropper-image");
	self.imageCandidate.style.height = CROPIMAGESIZE+"px";

	reader.onload = function(e) {

		self.imageCandidate.onload = function () {

      // this.style.width = 2*CROPIMAGESIZE+"px";
      console.log("height and width: ",  this.height +" "+  this.width);
      if(this.width > MAXIMAGEWIDTH){
        this.style.height = (MAXIMAGEWIDTH / this.width * this.height)+"px";
        this.style.width = MAXIMAGEWIDTH +"px";
        console.log("after height and width: ",  this.style.height +" "+ this.style.width);
      }


			let cropper = new ImageCropper(this, {
				// min_width: 10,
				// min_height: 10,
				one_box: true,
				ratio: {width: 1, height: 1},
				update: function (cropBox) {
					self.crop = cropBox;
				}
			});
			// cropper.coordinates = {x: 50, y: 50, width: 100, height: 100};
			let initialCropBoxSize = Math.min(self.imageCandidate.width, self.imageCandidate.height)/2;
			cropper.createCropArea(  {
				x: (self.imageCandidate.width - initialCropBoxSize)/2,
				y: (self.imageCandidate.height - initialCropBoxSize)/2,
				width: initialCropBoxSize,
				height: initialCropBoxSize
			});

			cropper.confine();
			cropper.crop();



      // make the form bigger to match the image
      var formStyle = self.myElement.querySelector('.o-avatar_editor-form-content').style;
      var imgStyle = self.myElement.querySelector('.o-avatar_cropper-image').style;
			formStyle.width = this.width+EDITORFORMPADFORBUTTONSWIDTH + "px";
			formStyle.height = (this.height+imgStyle.height) + "px";

		};// end onload
		self.imageCandidate.src = e.target.result;
		self.myElement.querySelector(".o-avatar_editor-cropper-frame").appendChild(self.imageCandidate);

		self.myElement.querySelector('.o-avatar_editor-form').style.display = 'block';
		self.crop = {};// clear off cropping data for next time
	};
	reader.readAsDataURL(fileSelected[0]);
};


// *******************
// triggered by form save
AvatarView.prototype.handleImageSave = function () {
	this.triggerLoadingDisplay();
	// crop needs to be rescaled from displayed image size (reflected in crop data)   to actual image coordinates

	let naturalWidth = this.imageCandidate.naturalWidth;
	let naturalHeight = this.imageCandidate.naturalHeight;

	let windowWidth = this.imageCandidate.width;
	let windowHeight = this.imageCandidate.height;

	let scalingFactorX = naturalWidth/windowWidth;
	let scalingFactorY = naturalHeight/windowHeight;  // if everything is right these should match

	if(! (this.crop.width > 0) ){
		console.log("crop not set",windowWidth,windowHeight);

		if(windowWidth>windowHeight){
			this.crop.x = (windowWidth - windowHeight)/2; // center the crop
			this.crop.y = 0;
			this.crop.width = windowHeight;
			this.crop.height = windowHeight;
			console.log("width / height",	 (windowWidth - windowHeight),	windowHeight);

		}else{
			this.crop.x = 0;
			this.crop.y = (windowHeight - windowWidth)/2; // center the crop;
			this.crop.width = windowWidth;
			this.crop.height = windowWidth;
		}
	}
	let cropX =  this.crop.x * scalingFactorX;
	let cropY =  this.crop.y * scalingFactorY;
	let width = this.crop.width * scalingFactorX;
	let height = this.crop.height * scalingFactorY;

	this.saveCroppedImage(this.imageCandidate, cropX,cropY, width, height);
	this.handleEditFormClear();
};

// *******************
// triggered by form save
AvatarView.prototype.handleEditFormClear = function () {
	// show the avatar, but not the cropping tool
	this.myElement.querySelector('.o-avatar_detail-avatar').style.display = 'block';
	var myNode = this.myElement.querySelector(".o-avatar_editor-cropper-frame");
	while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
}
	this.myElement.querySelector(".o-avatar_editor-form").style.display = 'none';
};


// *******************
// file: file with picture in it
// x1, y1 coords of one crop corner  (in natural or full image size coordinates)
// width and height give box size
AvatarView.prototype.saveCroppedImage = function (imageToSave, x1, y1, width, height) {
	const self = this;

	var canvas = document.createElement('canvas');
	canvas.style.display = 'none';
	var ctx = canvas.getContext("2d");

	canvas.width=width/height*canvas.height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(imageToSave,
			x1, y1, width,    height,    // source rectangle
			0, 0, canvas.width, canvas.height);
	canvas.toBlob(function(blob){
		self.service.setAvatar(self.profileData.id, blob, function (err, txt) {
			self.waitThenUpdateDisplay(err, txt);
		});
	},"image/png");
};

// *************************************
function Translator(locale) {
  console.log("in translator")
  this.locale = locale;
  let datafile = JSON.parse( translation);
  if(! this.locale){
      console.log('no localization chosen choose english as default');
      this.translation = datafile["english"];
  }else{
    this.translation = datafile[this.locale];
  }
  if(! this.translation){
      this.translation = datafile["english"];
  }
  // console.log("translation file", JSON.stringify(this.translation ));
	return this;
};

Translator.prototype.translate= function(tag) {
  let phrase = this.translation[tag.trim()];
  if(!phrase){
    console.log("translator: can not translate: ", tag);
    phrase = tag;
  };
  return phrase;
};

Translator.prototype.translateHTML= function(element) {
	let elems =	element.querySelectorAll(".o-localizable");
  let i=0;
  for(i =0; i < elems.length; i++){
    // console.log("translate localization",  elems[i].innerHTML);
    elems[i].innerHTML = this.translate(elems[i].innerHTML);
    // console.log("translated to",  elems[i].innerHTML);
  };
};
module.exports = AvatarView;
