import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {EMPTY, Observable} from "rxjs";
import {SetPreferenceDTO} from "../models/preferences/set-preference-dto";
import {GetOnePreferenceDTO} from "../models/preferences/get-one-preference-dto";
import {catchError, shareReplay} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {


  // The cache holds key="preference-name,page" value=Observable that holds GetOnePreferenceDTO
  private cache: any = {};

  constructor(private httpClient: HttpClient) { }


  public getPreferenceValueForPage(aPreferenceName: string, aPage: string): Observable<GetOnePreferenceDTO> {
    let cacheKey: string = aPreferenceName + aPage;
    if (this.cache[cacheKey]) {
      // This observable is in the cache.  So, return it from the cache
      return this.cache[cacheKey];
    }


    // Construct the URL for the REST endpoint  (to get the grid preferences for this page)
    const restUrl = environment.baseUrl + `/api/preferences/get/${aPreferenceName}/${aPage}`;

    // NOTE:  The REST call is not invoked you call subscribe() on this observable
    this.cache[cacheKey] = this.httpClient.get <GetOnePreferenceDTO> (restUrl).pipe(
      shareReplay(1),
      catchError(err => {
        console.error('Error in getPreferenceValueForPage().  Error is ', err);
        delete this.cache[cacheKey];
        return EMPTY;
      }));

    return this.cache[cacheKey];
  }


  public getPreferenceValueWithoutPage(aPreferenceName: string): Observable<GetOnePreferenceDTO> {
    let cacheKey: string = aPreferenceName;
    if (this.cache[cacheKey]) {
      // This observable is in the cache.  So, return it from the cache
      return this.cache[cacheKey];
    }

    // Construct the URL for the REST endpoint  (to get the grid preferences for this page)
    const restUrl = environment.baseUrl + `/api/preferences/get/${aPreferenceName}`;

    // NOTE:  The REST call is not invoked you call subscribe() on this observable
    this.cache[cacheKey] = this.httpClient.get <GetOnePreferenceDTO> (restUrl).pipe(
      shareReplay(1),
      catchError(err => {
        console.error('Error in getPreferenceValueWithoutPage().  Error is ', err);
        delete this.cache[cacheKey];
        return EMPTY;
      }));

    return this.cache[cacheKey];
  }


  public setPreferenceValueWithoutPage(aPreferenceName: string, aPreferenceValue: any): Observable<string> {
    let cacheKey: string = aPreferenceName;
    if (this.cache[cacheKey]) {
      // Remove this from the cache  (as the value is changingThis observable is in the cache.  So, return it from the cache
      delete this.cache[cacheKey];
    }

    // Construct the URL for the REST endpoint  (to set the preference only)
    const restUrl = environment.baseUrl + '/api/preferences/set';

    let setPreferenceDTO: SetPreferenceDTO = new SetPreferenceDTO();
    setPreferenceDTO.name = aPreferenceName;
    setPreferenceDTO.value = aPreferenceValue;

    // Return an observable to this POST REST call
    // -- The 2nd arg is the json body sent to the REST call
    // -- The 3rd arg is the map of options
    return this.httpClient.post(restUrl, setPreferenceDTO, {responseType: 'text'} );
  }


  public setPreferenceValueForPage(aPreferenceName: string, aPreferenceValue: any, aPage: string): Observable<string> {
    let cacheKey: string = aPreferenceName + aPage;
    if (this.cache[cacheKey]) {
      // Remove this from the cache  (as the value is changingThis observable is in the cache.  So, return it from the cache
      delete this.cache[cacheKey];
    }

    // Construct the URL for the REST endpoint  (to set the preference for this page)
    const restUrl = environment.baseUrl + '/api/preferences/page/set';

    let setPreferenceDTO: SetPreferenceDTO = new SetPreferenceDTO();
    setPreferenceDTO.name = aPreferenceName;
    setPreferenceDTO.value = aPreferenceValue;
    setPreferenceDTO.page = aPage;

    // Return an observable to this POST REST call
    // -- The 2nd arg is the json body sent to the REST call
    // -- The 3rd arg is the map of options
    return this.httpClient.post(restUrl, setPreferenceDTO, {responseType: 'text'} );
  }


  public setPreferenceValueForPageUsingJson(aPreferenceName: string, aPreferenceValue: any, aPage: string): Observable<string> {
    let cacheKey: string = aPreferenceName + aPage;
    if (this.cache[cacheKey]) {
      // Remove this from the cache  (as the value is changingThis observable is in the cache.  So, return it from the cache
      delete this.cache[cacheKey];
    }

    // Construct the URL for the REST endpoint  (to set the preference only)
    const restUrl = environment.baseUrl + '/api/preferences/page/set';

    let setPreferenceDTO: SetPreferenceDTO = new SetPreferenceDTO();
    setPreferenceDTO.name = aPreferenceName;
    setPreferenceDTO.value = JSON.stringify(aPreferenceValue);
    setPreferenceDTO.page = aPage;

    // Return an observable to this POST REST call
    // -- The 2nd arg is the empty json body sent to the REST call
    // -- The 3rd arg is the empty map of options
    return this.httpClient.post(restUrl, setPreferenceDTO, {responseType: 'text'} );
  }


}
