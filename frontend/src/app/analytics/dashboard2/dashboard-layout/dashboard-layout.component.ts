import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {Subscription} from "rxjs";
import {NavbarService} from "../../../services/navbar.service";

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  public selectedVisibleControls: FormControl;
  public listOfVisibleCharts: number[] = [1, 2, 3];
  private selectedVisibleControlsSubscription: Subscription;
  public disableGridDragDrop: boolean = false;

  private navbarSubscription: Subscription;
  private contentIsInitialized: boolean = false;
  public  showGrid: boolean = true;


  constructor(private formBuilder: FormBuilder,
              private navbarService: NavbarService) { }

  public ngOnInit(): void {
    // Create a form control that lists which controls are visible
    this.selectedVisibleControls = this.formBuilder.control(this.listOfVisibleCharts, null);

    this.selectedVisibleControlsSubscription = this.selectedVisibleControls.valueChanges.subscribe((arrayOfSelectedValues: number[]) => {
      // User selected some values in the multi-select dropdown

      // Tell the *ngFor loop to re-render the components
      //   1) set the listOfVisibleCharts to be empty
      //   2) use setTimeout to set the listOfVisibleCharts to hold the new array
      //      This causes components to be re-rendered in the updated *ngFor loop
      this.listOfVisibleCharts = [ ];
      setTimeout( () => {
        this.listOfVisibleCharts = arrayOfSelectedValues;
      });

    });


    this.navbarSubscription = this.navbarService.getNavbarStateAsObservable().subscribe( () => {
      // Left Side navbar was opened or closed.
      if (this.contentIsInitialized) {
        this.resizeChartsToFitContainers();

        this.initializeGridsToFitContainers();
      }
    });
  }


  public ngAfterViewInit(): void {
    this.contentIsInitialized=true;
  }

  public ngOnDestroy(): void {
    if (this.selectedVisibleControlsSubscription) {
      this.selectedVisibleControlsSubscription.unsubscribe();
    }

    if (this.navbarSubscription) {
      this.navbarSubscription.unsubscribe();
    }
  }


  public drop(aEvent: CdkDragDrop<number[]>) {
    // Re-order the array
    moveItemInArray(this.listOfVisibleCharts, aEvent.previousIndex, aEvent.currentIndex);
  }


  public userChangedDragAndDropMode(aNewDragMode: number) {
    if (aNewDragMode == 10) {
      // User selected to enable chart drag & drop
      this.disableGridDragDrop = false;
    }
    else if (aNewDragMode == 11) {
      // User selected to enable Grid drag & drop  (so disable the cdk drag and drop)
      this.disableGridDragDrop = true;
    }
  }



  /*
   * Send a 'resize' event
   * This will cause HighCharts to resize all charts to fit inside their parent containers
   */
  private resizeChartsToFitContainers(): void {

    setTimeout(()=> {
      // Send a 'resize' event
      // NOTE:  The window.dispatchEvent() call MUST be in a setTimeout or it will not work
      // NOTE:  The timeout must be ATLEAST 200ms (as the mat-sidenav needs that much time to shrink/grow)
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }


  /*
   * Hide and show the grids (so the grid resizes to fit its container)
   */
  private initializeGridsToFitContainers(): void {
    // Hide the grid
    this.showGrid = false;

    setTimeout( () => {
      // Show the grid (so it loads and takes the full width)
      // NOTE:  The timeout must be ATLEAST 200ms (as the mat-sidenav needs that much time to shrink/grow)
      this.showGrid = true;
    }, 225);
  }

}

