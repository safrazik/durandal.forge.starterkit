import system from 'durandal/system';
import app from 'durandal/app';
import viewLocator from 'durandal/viewLocator';

import providers from './providers';
import * as filters from './filters';
import {init} from 'durandal.forge';

import {FlickrService} from 'flickr/FlickrService';

init(providers, filters);

//>>excludeStart("build");
system.debug(true);
//>>excludeEnd("build");

app.title = 'Durandal Starter Kit';

app.configurePlugins({
    router:true,
    dialog: true
});

app.start().then(function() {
    //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
    //Look for partial views in a 'views' folder in the root.
    viewLocator.useConvention();

    //Show the app by setting the root view model for our application with a transition.
    app.setRoot('shell/shell', 'entrance');
});