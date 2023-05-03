import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Constants} from "../../../utilities/constants";
import {Subscription} from "rxjs";
import {Chart} from "highcharts";

import * as Highcharts from "highcharts";
import MapModule from 'highcharts/modules/map';

declare var require: any;
const usaMapDataAsJson = require("@highcharts/map-collection/countries/us/custom/us-all-territories.geo.json");
MapModule(Highcharts);

// Turn on the highchart context menu *View/Print/Download* options
//  -- Gives you these menu options: View in Full Screen, Print Chart, Download PNG, Download JPEG, Download PDF, Download SVG
import HC_exporting from 'highcharts/modules/exporting';
HC_exporting(Highcharts);

// Turn on the highchart context menu *export* options
// -- Gives you these menu options: Download CSV, Download XLS, View Data Table
import HC_exportData from 'highcharts/modules/export-data';
HC_exportData(Highcharts);

// Do client-side exporting (so that calls do *NOT* go to https://export.highcharts.com/ but does not work on all browsers
import HC_offlineExport from 'highcharts/modules/offline-exporting';
import {DashboardService} from "../../../services/dashboard.service";
import {NavbarService} from "../../../services/navbar.service";
HC_offlineExport(Highcharts);


@Component({
  selector: 'app-usa-map-page',
  templateUrl: './usa-map-page.component.html',
  styleUrls: ['./usa-map-page.component.css']
})
export class UsaMapPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('myChart') myChartDiv: ElementRef;

  private contentIsInitialized: boolean = false;
  private navbarSubscription: Subscription;
  private mapChart: any;

  constructor(private dashboardService: DashboardService,
              private navbarService: NavbarService) { }

  public ngOnInit(): void {
    // Set the thousands separator as a comma for all charts
    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });

    this.navbarSubscription = this.navbarService.getNavbarStateAsObservable().subscribe( () => {
      // Left Side navbar was opened or closed.
      if (this.contentIsInitialized) {
        this.resizeChartsToFitContainers();
      }
    });

  }  // end of ngOnInit()

  public ngAfterViewInit(): void {
    this.reloadPage();
    this.contentIsInitialized = true;
  }


  public ngOnDestroy(): void {

    // Destroy all charts
    Highcharts.charts.forEach(function (chart: Chart | undefined) {
      if (chart) {
        chart.destroy();
      }
    });
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



  private reloadPage(): void {
    // Run this code in setInterval() so the code is executed after angular does a refresh
    // NOTE:  The 1 ms number doesn't matter as it will only run once
    let intervalFunction = setTimeout(() => {

      if (this.myChartDiv != undefined) {
        // The chart div HTML exists.  So, now we can tell Highcharts to rener (as the div actually exists

        // Invoke a REST call to get data for the initial page load
        this.dashboardService.getUsaMapData().subscribe((aData: any) => {
          // We got row data from the REST call

          // Set the map options series here (so that reset zoom works)
          this.mapOptions.series = [
            {
              type: "map",
              name: "Players Per State",
              states: {
                hover: {
                  color: "#BADA55"
                }
              },
              dataLabels: {
                enabled: true,
                format: "{point.name}<br>{point.value:,.0f}"    // Format the point.value with commas
              },
              allAreas: false,
              data: []
            }
          ];

          // Set the data
          this.mapOptions.series[0].data = aData;


          if (this.mapChart != undefined) {
            // Destroy the existing chart
            this.mapChart.destroy();
          }

          // Render the chart
          this.mapChart = Highcharts.mapChart('usaMapPage1', this.mapOptions);

          // Resize the chart to fit its container
          this.mapChart.reflow();
        });

        // Charts are rendered.  So, stop the interval
        clearInterval(intervalFunction);
      }

    }, 1);  // end of setTimeout()

  }  // end of reloadPage()



  /*
   * Add this public get method so that we can reference constants in the HTML template
   */
  public get constants(): typeof Constants {
    // Get a reference to the enumerated object
    // -- This is needed so that the html page can use the enum class
    return Constants;
  }



  private mapOptions: any = {
    chart: {
      map: usaMapDataAsJson as any
    },
    title: {
      text: "Players Per State"
    },
    credits: {
      enabled: false        // Hide the highcharts.com label
    },
    mapNavigation: {
      enabled: true,                 // Enable map navigation
      buttonOptions: {
        alignTo: "spacingBox"
      },
      enableMouseWheelZoom: true,   // Enable mouse wheel zooming (so the map does not swallow scrolling)
      enableDoubleClickZoom: true   // enable the double-click zoom-in, disable the +, disable the - buttons
    },
    legend: {
      enabled: true          // Enable the navigation as we have more room
    },
    colorAxis: {
      min: 0
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems:  [
            'viewFullscreen',
            {
              text: 'Reset Zoom',
              onclick: () => {
                this.reloadPage();
              }
            },
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'separator',
            'downloadCSV',
            'downloadXLS'
          ]
        }
      }
    }
  };

}
