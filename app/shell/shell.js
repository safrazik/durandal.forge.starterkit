import app from 'durandal/app';
import {Dialog} from 'lib/Dialog';
import {AppRouter} from 'durandal.forge';

class Shell {

  constructor(router: AppRouter, dialog: Dialog){
    this.dialog = dialog;
    this.router = router.configure(config => { 
      config.map([
        { pattern: ['','welcome'],  moduleId: 'welcome/welcome',  nav: true, title:'Welcome' },
        { pattern: 'flickr',        moduleId: 'flickr/flickr',   nav: true },
        { pattern: 'legacy',        moduleId: 'legacy/legacy',   nav: true },
      ]);
    });
  }

  search() {
    //It's really easy to show a message box.
    //You can add custom options too. Also, it returns a promise for the user's response.
    this.dialog.showMessage('Search not yet implemented...');
  }
  
  activate(){
    return this.router.activate();
  }

}

export default Shell;