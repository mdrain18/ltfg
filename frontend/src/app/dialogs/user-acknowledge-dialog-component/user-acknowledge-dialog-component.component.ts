import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-user-acknowledge-dialog-component',
  templateUrl: './user-acknowledge-dialog-component.component.html',
  styleUrls: ['./user-acknowledge-dialog-component.component.css']
})
export class UserAcknowledgeDialogComponentComponent implements OnInit {

  constructor(private userService: UserService,
              private matDialogRef: MatDialogRef<UserAcknowledgeDialogComponentComponent>)
  { }

  public ngOnInit(): void {
  }


  /*
  * User clicked to acknowledge.
  *  1) Invoke the UserService method to acknowledge the popup
  *  2) return true back to the class that opened this dialog box
  */
  public userClickedAcknowledge() {

    this.userService.setUserAcknowledged().subscribe( () => {
      // The REST call came back successfully

      // Close the dialog box and return TRUE
      this.matDialogRef.close(true);
    })

  }  // end of userClickedAcknowledge()


}
