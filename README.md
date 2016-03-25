# o-avatar

The Avatar component provides a user modifiable square image.


The Avatar Component adds an avatar image as a <div> to the html document.  The avatar comes from the UserProfile service and is user-modifiable.
Cropping is added where one uses a persistent box to choose an area within the chosen photo to be uploaded.



##Instantiation and options:

  to make an AvatarView an example below is provided:

	AView = new AvatarView(
    service,    // ( This is the user profile service with calls  call backs for userprofile data.
                // the o-Userprofile-Service is a reference implementation. if null then see Avatar via URL below)
    document.getElementById("largeAvatar"), // (This is the element of the document that the avatar will be placed upon)
    "160px", // (This is the size of the avatar.  The avatar is always square)
    true,   //  (modifiable: When true a banner letting you choose, crop, and change your avatar image.  if false, the banner is removed.)
    "english" // one of the supported languages in the translation directory's translation file.  The default is english.
  );

##Linking

  there are some cases where there may be multiple avatar's on a page for the same person.
  One such case is where there is an avatar in the header and one on the user profile update panel.
  Linking the avatars together ensures that both will update together:

  AView.linkAvatarView(AnotherView);

##Language support
  In the translations folder there is a translations.json file that contains key-value pairs from tag to translation.  The english translations can be used as a guide to create other translations in other languages.

## Cropping and scaling
   When an image is chosen from file the image is cropped and scaled before uploading.
   One can choose files of type: jpg, gif, jpeg, and png.
   Cropping is done by the Cropping Origami Component.  Although the cropping appears to be done on a scaled image, the cropping is actually done on the full sized image. Thus a small area on a large image will still have decent resolution.
   Large images (even after crop) will be scaled down to 500px by 500px.
   The cropping will always be locked down to a 1:1 aspect ratio (square image)


## Avatar via URL

  The avatar component can be used just to format images but not to edit them or get the avatar from user profile:
  AView.setImageFromURL("https://lh3.googleusercontent.com/-4VTFFjbVzjg/U_FvEuEzXxI/AAAAAAAAQdM/bRFkdVYqFW8/s400/%255BUNSET%255D");
  No token, pi id, or user profile service needs to be added.
 
