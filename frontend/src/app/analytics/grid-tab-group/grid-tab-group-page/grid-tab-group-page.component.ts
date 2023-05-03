import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {isNumeric} from "rxjs/internal-compatibility";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-grid-tab-group-page',
  templateUrl: './grid-tab-group-page.component.html',
  styleUrls: ['./grid-tab-group-page.component.css']
})
export class GridTabGroupPageComponent implements OnInit, OnDestroy {

  public startingTabIndex: number;
  private paramRouteSubscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute) { }

  public ngOnInit(): void {
      // Solution:  Listen for parameter changes and then adjust the page in code
      this.paramRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
        // We got a new parameter -- so either the page is opening or need to refresh

        let startingTabNumber: string | null = routeParams?.startingTab;

        if (! isNumeric(startingTabNumber))  {
          // The passed-in startingTab is not numeric
          // -- So, go with the default starting tabIndex of zero
          this.startingTabIndex = 0;
        }
        else {
          let startingTabAsNumber = Number(startingTabNumber);

          if ((startingTabAsNumber < 1) || (startingTabAsNumber > 2)) {
            // The passed-in startingTab is not valid.
            // -- So, go with the default starting tabIndex of zero
            this.startingTabIndex = 0;
          }
          else {
            // The passed-in startingTab is valid
            this.startingTabIndex = startingTabAsNumber - 1;
          }
        }
    });

  }  // end of ngOnInit()



  public ngOnDestroy(): void {
    if (this.paramRouteSubscription) {
      this.paramRouteSubscription.unsubscribe();
    }
  }

}
