import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Constants} from "../../../utilities/constants";
import * as Highcharts from "highcharts";

window.Highcharts = Highcharts;

// Turn on the highchart context menu view/print/download options
import HC_exporting from "highcharts/modules/exporting";
HC_exporting(Highcharts);

// Turn on the highchart context menu *export* options
// NOTE:  This provides these menu options: Download CSV, Download XLS, View Data Table
import HC_exportData from "highcharts/modules/export-data";
HC_exportData(Highcharts);

// Do client-side exporting (so that the exporting does *NOT* go to https://export.highcharts.com/
// NOTE:  This does not work on all web browsers
import HC_offlineExport from "highcharts/modules/offline-exporting";
HC_offlineExport(Highcharts);

// Turn on the drill-down capabilities
import HC_drillDown from "highcharts/modules/drilldown";
import {BarChartDTO} from "../../../models/bar-chart-dto";
import {Chart} from "highcharts";
import {DashboardService} from "../../../services/dashboard.service";
import {NavbarService} from "../../../services/navbar.service";
import {Subscription} from "rxjs";
HC_drillDown(Highcharts);


@Component({
  selector: 'app-bar-chart-page',
  templateUrl: './bar-chart-page.component.html',
  styleUrls: ['./bar-chart-page.component.css']
})
export class BarChartPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('myChart') myChartDiv: ElementRef;

  private chart: Chart;
  private navbarSubscription: Subscription;
  private contentIsInitialized: boolean = false;

  constructor(private dashboardService: DashboardService,
              private navbarService: NavbarService) { }

  public ngOnInit(): void {
    // Set options for all highchart menus on this page
    Highcharts.setOptions( {
      lang: {
        thousandsSep: ','	// Set the thousand separator as a comma
      }
    });

    this.navbarSubscription = this.navbarService.getNavbarStateAsObservable().subscribe( () => {
      // Left Side navbar was opened or closed.
      if (this.contentIsInitialized) {
        this.resizeChartsToFitContainers();
      }
    });

  }

  public ngOnDestroy(): void {
    if (this.navbarSubscription) {
      this.navbarSubscription.unsubscribe();
    }
  }

  /*
   * The HTML div exists.  Now we can render the chart
   */
  public ngAfterViewInit(): void {
    this.reloadPage();
    this.contentIsInitialized = true;
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
        this.dashboardService.getBarChartData().subscribe((aData: BarChartDTO) => {
          // We got row data from the REST call

          this.chartOptions.series = aData.chartData;
          this.chartOptions.drilldown = aData.drillDownData;

          if (this.chart != undefined) {
            // Destroy the existing chart
            this.chart.destroy();
          }

          // Render the chart
          this.chart = Highcharts.chart('barChartPage1', this.chartOptions);

          // Resize the chart to fit its container
          this.chart.reflow();
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


  private chartOptions: any = {
    chart: {
      type: 'column',
      displayErrors: true
    },
    credits: {
      enabled: false    	// Hide the highcharts.com label
    },
    title: {
      text: 'Average Package Time in Each Work Role'
    },
    xAxis: {
      type: 'category'
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Avg. Time (Days)'
      }
    },
    lang: {
      drillUpText: '◁ Go Back'
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: false
        }
      }
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullscreen',
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
