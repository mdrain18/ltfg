import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable, of} from 'rxjs';
import { map, switchMap,} from "rxjs/operators";
import {UserService} from "../services/user.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {UserAcknowledgeDialogComponentComponent} from "../dialogs/user-acknowledge-dialog-component/user-acknowledge-dialog-component.component";

@Injectable({
  providedIn: 'root'
})
export class UserAcknowledgeGuard implements CanActivate {

  private openedDialogRef: MatDialogRef<UserAcknowledgeDialogComponentComponent> | null = null;


  constructor(private router: Router,
              private matDialog: MatDialog,
              private userService: UserService) { }


  /*
   * If this method returns true, then proceed to the requested route
   * If this method returns false, then do not proceed to the requested route
   * If this method returns an observable<boolean>, then wait for the observable and then make a decision
     */
  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>  {


    return this.userService.didUserAcknowledge().pipe(

      // NOTE:  Use the switchMap because the dialogRef.afterClosed() generates an inner observable
      switchMap( (aAck: boolean) => {
        if (aAck) {
          // User has acknowledged message, so return an observable holding TRUE
          return of(true);
        }

        else {
          // User has not acknowledged message yet

          if (this.openedDialogRef == null) {
            // The dialog box has not been opened.

            // Open the acknowledge system dialog box
            // NOTE:  openedDialogRef is a private class variable instead of a local variable
            //        to ensure that only ONE dialog box opens
            this.openedDialogRef = this.matDialog.open(UserAcknowledgeDialogComponentComponent,
              {
                disableClose: true
              }
            );
          }


          // Return the *inner* observable by waiting for the dialog box
          // NOTE:  The dialog box acknowledge button invokes the REST endpoint to save the user-acknowledgement
          return this.openedDialogRef.afterClosed().pipe(
            map((aResult: boolean) => {
              // The dialog box has closed

              // Set the openedDialogRef back to null
              this.openedDialogRef = null;

              // Return an observable that holds either true or false
              return aResult;
            }) // end of map
          )

        }  // end of else
      })   // end of map
    );  // end of pipe


  } // end of canActivate()

}
