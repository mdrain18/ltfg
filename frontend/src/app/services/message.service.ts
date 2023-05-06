import {Injectable} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  public constructor(private snackBar: MatSnackBar) {
  }

  /**
    * Shows a success message using a snackbar for a given message
    * @param message The message to display in the snackbar.
   */
  public showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Done',
      {
        duration: 6000,        // Close the popup after 6 seconds
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['success-snackbar']
      });
  }

  /**
   * Shows a warning message using the MatSnackBar component.
   * @param message The message to display in the snackbar.
   *  TODO: for when a username is already used and the user has not pressed register yet, show a warning
   */
  public showWarningMessage(message: string): void {
    this.snackBar.open(message, 'Done',
      {
        duration: 6000,        // Close the popup after 6 seconds
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['warning-snackbar']
      });
  }

  /**
   * Shows an error message using a snack bar
   * @param message The message to display in the snackbar.
   */
  public showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Done',
      {
        duration: 6000,        // Close the popup after 6 seconds
        verticalPosition: 'bottom',
        horizontalPosition: 'right',
        panelClass: ['error-snackbar']
      });
  }

}
