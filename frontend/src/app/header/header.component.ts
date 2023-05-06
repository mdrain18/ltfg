import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavbarService} from "../services/navbar.service";
import {ThemeOptionDTO} from "../models/theme-option-dto";
import {Subscription} from "rxjs";
import {ThemeService} from "../services/theme.service";
import {UserService} from "../services/user.service";
import {UserIsLoggedOutDialogComponent} from "../dialogs/user-is-logged-out-dialog/user-is-logged-out-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public currentTheme: ThemeOptionDTO;
  private themeStateSubscription: Subscription;

  constructor(private matDialog: MatDialog,
              private navbarService: NavbarService,
              private userService: UserService,
              private themeService: ThemeService) {
  }

  public ngOnInit(): void {
    // Listen for changes from the theme service
    this.themeStateSubscription = this.themeService.getThemeStateAsObservable().subscribe((aNewTheme: ThemeOptionDTO) => {
      // The theme has changed.
      this.currentTheme = aNewTheme;
    });
  }

  public ngOnDestroy(): void {
    if (this.themeStateSubscription) {
      this.themeStateSubscription.unsubscribe();
    }
  }

  public toggleAppNavbar(): void {
    // Send a message to the navbarService (to tell it to toggle)
    this.navbarService.toggleAppNavbar();
  }

  public toggleUserNavbar(): void {
    this.navbarService.toggleUserNavbar();
  }

  public userClickedLogout(): void {

    // Invoke the REST call to end the user's session
    this.userService.logout().subscribe(() => {
      // REST endpoint succeeded

      // Clear the frontend cache
      this.userService.clearCache();

      // Open the dialog box (that cannot be escaped)
      this.matDialog.open(UserIsLoggedOutDialogComponent, {
        disableClose: true,              // Stop the user from closing the dialog box
        backdropClass: "logout-backdrop"
      });
    });
  }  // end of userClickedLogout()

}
