import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {Chart} from "highcharts";
import {Router} from "@angular/router";
import {Constants} from "../../../utilities/constants";
HC_offlineExport(Highcharts);


@Component({
  selector: 'app-usa-map-little',
  templateUrl: './usa-map-little.component.html',
  styleUrls: ['./usa-map-little.component.css']
})
export class UsaMapLittleComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('myChart') myChartDiv: ElementRef;

  private mapChart: any;

  constructor(private dashboardService: DashboardService,
              private router: Router) { }

  public ngOnInit(): void {
    // Set the thousands separator as a comma for all charts
    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });

  }  // end of ngOnInit()

  public ngAfterViewInit(): void {
    this.reloadPage();
  }


  public ngOnDestroy(): void {
    // Destroy all charts
    Highcharts.charts.forEach(function (chart: Chart | undefined) {
      if (chart) {
        chart.destroy();
      }
    });
  }


  public goToFullSizePage(): void {
    this.router.navigate( [Constants.DASHBOARD_USA_MAP_PAGE] ).then();
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
          this.mapChart = Highcharts.mapChart('usaMapLittlePage1', this.mapOptions);

          // Resize the chart to fit its container
          this.mapChart.reflow();
        });

        // Charts are rendered.  So, stop the interval
        clearInterval(intervalFunction);
      }

    }, 1);  // end of setTimeout()

  }  // end of reloadPage()



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
      enableMouseWheelZoom: false,   // Disable mouse wheel zooming (so the map does not swallow scrolling)
      enableDoubleClickZoom: false   // Disable the double-click zoom-in, disable the +, disable the - buttons
    },
    legend: {
      enabled: false
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
