import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {PreferencesDTO} from "../models/preferences-dto";
import {HttpClient} from "@angular/common/http";
import {PreferenceService} from "./preference.service";
import {GetOnePreferenceDTO} from "../models/preferences/get-one-preference-dto";

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private bannerStateSubject: BehaviorSubject<boolean>;

  constructor(private httpClient: HttpClient,
              private preferenceService: PreferenceService) { }


  public getStateAsObservable(): Observable<boolean> {
    return this.bannerStateSubject.asObservable();
  }

  public hideBanner(): void {
    this.setLatestValue(false).subscribe( () => {
      // REST call came back successfully

      // Send a message with false  (to tell anyone listening to hide the banner)
      this.bannerStateSubject.next(false);
    })
  }


  public showBanner(): void {
    this.setLatestValue(true).subscribe( () => {
      // REST call came back successfully

      // Send a message with false  (to tell anyone listening to hide the banner)
      this.bannerStateSubject.next(true);
    })
  }

  public getLatestValueFromBackend(): Observable<GetOnePreferenceDTO> {
    // invoke the preference service to get the show-banner boolean value
    return this.preferenceService.getPreferenceValueWithoutPage("show.banner");
  }

  private setLatestValue(aBannerInfo: boolean): Observable<string> {
    // Use the preference service to set the show-banner boolean value
    return this.preferenceService.setPreferenceValueWithoutPage("show.banner",aBannerInfo);
  }


  public initialize(aBannerInfo: boolean) {
    // Send out a message that (to anyone listening) with the current value
    // Anyone who listens later, gets this initial message
    this.bannerStateSubject = new BehaviorSubject<boolean>(aBannerInfo);
  }


}
