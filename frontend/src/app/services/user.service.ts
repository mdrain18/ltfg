import {Injectable} from '@angular/core';
import {UserInfoDTO} from "../models/user-info-dto";
import {EMPTY, Observable, of} from "rxjs";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {catchError, map, shareReplay} from "rxjs/operators";
import {RegistrationDto} from "../models/registration-dto";
import {LoginDto} from "../models/login-dto";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Internal cache of the userInfo object
  private cachedObservable: Observable<UserInfoDTO> | null = null;
  private cachedAckObservable: Observable<boolean> | null = null

  constructor(private httpClient: HttpClient) {
  }

  // Clears all cached things in this service
  public clearCache(): void {
    this.cachedObservable = null;
    this.cachedAckObservable = null;
  }

  // Returns an observable that will end the users session in the backend
  public logout(): Observable<string> {
    const restUrl = environment.baseUrl + "/api/user/logout";
    return this.httpClient.post<string>(restUrl, "", {responseType: 'json'});
  }

  /*
   * Return an observable that holds information about the user
   * -- The UserInfoDTO holds the user's name and map of routes
   */
  public getUserInfo(): Observable<UserInfoDTO> {

    if (this.cachedObservable != null) {
      // This observable is in the cache.  So, return it from the cache
      return this.cachedObservable;
    }

    // Construct the URL of the REST call
    const restUrl = environment.baseUrl + '/api/user/me';

    // Get the observable and store it in the internal cache
    this.cachedObservable = this.httpClient.get <UserInfoDTO>(restUrl).pipe(
      map((userInfoDTO: UserInfoDTO) => {

        // Convert the userInfoDTO.pageRoutes into a map
        // So that the PageGuard does not have to do it repeatedly
        let mapPageRoutes: Map<string, boolean> = new Map(Object.entries(userInfoDTO.pageRoutes));

        userInfoDTO.pageRoutes = mapPageRoutes;

        return userInfoDTO;
      }),
      shareReplay(1)
    );

    // Return the cached observable
    return this.cachedObservable;

  } // end of getUserInfo

  public didUserAcknowledge(): Observable<boolean> {
    if (this.cachedAckObservable != null) {
      // This observable is in the cache.  So, return it from the cache
      return this.cachedAckObservable;
    }

    // Construct the URL of the REST call
    const restUrl = environment.baseUrl + '/api/user/ack/get';

    // Return an observable
    this.cachedAckObservable = this.httpClient.get <boolean>(restUrl).pipe(
      shareReplay(1),
      catchError(err => {
        console.error('There was an error getting user info.   Error is ', err);

        // Clear the cache
        this.cachedAckObservable = null;

        return EMPTY;
      }));

    return this.cachedAckObservable;
  }

  public setUserAcknowledged(): Observable<string> {
    // Construct the URL of the REST call
    const restUrl = environment.baseUrl + '/api/user/ack/set'

    // Return an observable
    return this.httpClient.post <string>(restUrl, {}).pipe(
      map((result) => {
        // The set-acknowledged REST call finished successfully

        // Set the cachedAckObservable to hold an observable holding true
        this.cachedAckObservable = of(true);

        return result;
      }),
      catchError(err => {
        console.error('There was an error getting user info.   Error is ', err);

        // Clear the cache
        this.cachedAckObservable = null;

        return EMPTY;
      }));
  }

  public validateUserLogin(loginDto: LoginDto): Observable<boolean> {
    const restUrl = `${environment.baseUrl}/api/user/val`;

    return this.httpClient.post<boolean>(restUrl, loginDto).pipe(
      map((result: boolean) => {
        return result;
      }),
      catchError(err => {
        console.error('There was an error validating user info. Error is ', err);

        return EMPTY;
      })
    );
  }

  public registerUser(registrationDto: RegistrationDto): Observable<boolean> {
    const restUrl = `${environment.baseUrl}/api/user/register`;

    return this.httpClient.post<boolean>(restUrl, registrationDto).pipe(
      map((result: boolean) => {
        return result;
      }),
      catchError(err => {
        console.error('There was an error registering user info. Error is ', err);

        return EMPTY;
      })
    );
  }

}
