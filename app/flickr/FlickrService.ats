import {Http} from 'lib/Http';
import {ModuleLoader} from 'durandal.forge';

export class FlickrService {
  constructor(http: Http){
    this.http = http;
    this.displayName = 'Flickr';
    this.images = [];
  }
  findImages(tags = 'mount ranier'){
    return this.http.jsonp('http://api.flickr.com/services/feeds/photos_public.gne', { tags, tagmode: 'any', format: 'json' }, 'jsoncallback');
  }
}