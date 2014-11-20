import {FlickrService} from './FlickrService';
import {Dialog} from 'lib/Dialog';

class Flickr {
  constructor(dialog: Dialog, flickr: FlickrService){
    this.dialog = dialog;
    this.flickr = flickr;
    this.displayName = 'Flickr';
    this.images = [];
  }
  activate(){
    //the router's activator calls this function and waits for it to complete before proceeding
    if (this.images.length > 0) {
        return;
    }
    
    return this.flickr.findImages().then(response => {
        this.images = response.items;
    });
  }
  select(item){
    //the app model allows easy display of modal dialogs by passing a view model
    //views are usually located by convention, but you an specify it as well with viewUrl
    item.viewUrl = 'flickr/detail/detail';
    this.dialog.showDialog(item);
  }
  canDeactivate(){
    //the router's activator calls this function to see if it can leave the screen
    return this.dialog.showMessage('Are you sure you want to leave this page?', 'Navigate', ['Yes', 'No']);
  }
}

export default Flickr;