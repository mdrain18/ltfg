import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {Subscription} from "rxjs";


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

// Included because the solid gauge charts are not included in vanilla Highcharts
import HC_more from "highcharts/highcharts-more";
import HC_solidgauge from 'highcharts/modules/solid-gauge';
HC_more(Highcharts);
HC_solidgauge(Highcharts);

// Turn on the drill-down capabilities
import HC_drillDown from "highcharts/modules/drilldown";
import {DashboardDataDTO} from "../models/dashboard-data-dto";
import {DashboardService} from "../services/dashboard.service";
import {Chart} from "highcharts";
import {NavbarService} from "../services/navbar.service";
HC_drillDown(Highcharts);


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, OnDestroy, AfterViewInit {
  public  selectedVisibleControls: FormControl;
  public  listOfVisibleCharts: number[] = [1, 2, 3, 4, 5];
  private selectedVisibleControlsSubscription: Subscription;
  public  disableGridDragDrop: boolean = false;
  private pageIsInitialized: boolean = false;
  public  dataIsLoading: boolean = false;

  private navbarSubscription: Subscription;


  constructor(private formBuilder: FormBuilder,
              private dashboardService: DashboardService,
              private navbarService: NavbarService) {
  }

  public ngOnInit(): void {
    // Create a form control that lists which controls are visible
    this.selectedVisibleControls = this.formBuilder.control(this.listOfVisibleCharts, null);

    this.selectedVisibleControlsSubscription =
      this.selectedVisibleControls.valueChanges.subscribe((arrayOfSelectedValues: number[]) => {
        // User selected some values inj the multi-select dropdown

        // Change the public list of numbers (which causes charts to appear/disappear)
        this.listOfVisibleCharts = arrayOfSelectedValues;

        if (this.pageIsInitialized) {
          // Render the charts (if they are set as visible)
          this.reloadData()
        }
      });


    this.navbarSubscription = this.navbarService.getNavbarStateAsObservable().subscribe(() => {
      // The user has made the left navbar hidden or visible

      // Redraw all of the charts on this page (so they fit perfectly within the mat-card tags
      this.resizeChartsToFitContainers();
    })

  }

  public ngOnDestroy(): void {
    if (this.selectedVisibleControlsSubscription) {
      this.selectedVisibleControlsSubscription.unsubscribe();
    }

    if (this.navbarSubscription) {
      this.navbarSubscription.unsubscribe();
    }
  }


  public ngAfterViewInit(): void {
    // Reload chart data
    // NOTE:  This call must be in ngAfterContentInit() and not in ngOnInit()
    this.reloadData();

    this.pageIsInitialized = true;
  }

  /*
   * Send a 'resize' event
   * This will cause HighCharts to resize all charts to fit inside their parent containers
   */
  private resizeChartsToFitContainers(): void {

    setTimeout(()=> {
      // Send a 'resize' event
      // NOTE:  The window.dispatchEvent() call MUST be in a setTimeout or it will not work
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }


  public drop(aEvent: CdkDragDrop<number[]>) {
    // Re-order the array
    moveItemInArray(this.listOfVisibleCharts, aEvent.previousIndex, aEvent.currentIndex);
  }


  public userChangedDragAndDropMode(aNewDragMode: number) {
    if (aNewDragMode == 10) {
      // User selected to enable chart drag & drop
      this.disableGridDragDrop = false;
    } else if (aNewDragMode == 11) {
      // User selected to enable Grid drag & drop  (so disable the cdk drag and drop)
      this.disableGridDragDrop = true;
    }
  }


  public reloadData(): void {
    this.dataIsLoading = true;

    // Run this code in setInterval() so the code is executed after angular does a refresh
    // NOTE:  the ms wait does not matter
    let intervalFunction = setInterval(() => {

      this.dashboardService.getAllChartData().subscribe((aData: DashboardDataDTO) => {
        // The REST call came back with data
        if (this.listOfVisibleCharts.includes(1)) {
          // Set the data for chart 1 and *render* chart 1
          this.chartOptions1.series[0].data = aData.chartData1;
          Highcharts.chart('chart1', this.chartOptions1);
        }

        if (this.listOfVisibleCharts.includes(2)) {
          this.chartOptions2.series = aData.chartData2;
          Highcharts.chart('chart2', this.chartOptions2);
        }

        if (this.listOfVisibleCharts.includes(5)) {

          // Render guageChart1
          Highcharts.chart('gaugeChart1', Highcharts.merge(this.gaugeChartOptions, {
            title: {
              text: 'Total Units',
              y: 70
            },
            yAxis: {
              min: 0,
              max: 20,
              stops: [
                [1, '#800080'] // purple
              ],
            },
            series: [{
              name: 'Total Units in System',   // smaller label
              data: [6],
              dataLabels: {
                format:
                  '<div style="text-align:center">' +
                  '<span style="font-size:25px">{y}</span><br/>' +
                  '<span style="font-size:12px;opacity:0.4">Total Units in System</span>' +
                  '</div>'
              }
            }]

          }));



          // Render guageChart2
          Highcharts.chart('gaugeChart2', Highcharts.merge(this.gaugeChartOptions, {
            title: {
              text: 'Pending Units',
              y: 70
            },
            yAxis: {
              min: 0,
              max: 50,
              stops: [
                [1, '#FF0000'] // red
              ],
            },
            series: [{
              name: 'Total Pending Units',
              data: [15],
              dataLabels: {
                format:
                  '<div style="text-align:center">' +
                  '<span style="font-size:25px">{y}</span><br/>' +
                  '<span style="font-size:12px;opacity:0.4">Total Pending Units</span>' +
                  '</div>'
              }
            }]

          }));

          // Render guageChart3
          Highcharts.chart('gaugeChart3', Highcharts.merge(this.gaugeChartOptions, {
            title: {
              text: 'Work in Progress Units',
              y: 70
            },
            yAxis: {
              min: 0,
              max: 50,
              stops: [
                [1, '#008000'] // green
              ],
            },
            series: [{
              name: 'Total Work in Progress Units',
              data: [33],
              dataLabels: {
                format:
                  '<div style="text-align:center">' +
                  '<span style="font-size:25px">{y}</span><br/>' +
                  '<span style="font-size:12px;opacity:0.4">Total Work in Progress Units</span>' +
                  '</div>'
              }
            }]

          }));

        }

        // Redraw all charts on this page (so they fit perfectly in the <mat-card> tags)
        Highcharts.charts.forEach(function (chart: Chart | undefined) {
          chart?.reflow();
        });

      }).add(() => {
        // REST call finally block

        this.dataIsLoading = false;

        // Whether the REST endpoint worked or not, clear the interval
        clearInterval(intervalFunction);
      });

    }, 1);

  } // end of reloadData()



  private chartOptions1: any = {
    credits: {
      enabled: false        // Hide the highcharts.com label
    },
    caption: {
      text: ''
    },
    chart: {
      type: 'pie'
    },
    title: {
      text: 'Pending Case Distribution'
    },
    subtitle: {
      text: ''
    },
    accessibility: {
      announceNewData: {
        enabled: true
      },
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      series: {
        enableMouseTracking: true,
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>:<br>{point.percentage:.1f} %<br>value: {point.y}'
        }
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> or <b>{point.percentage:.1f}%</b> of total<br/>'
    },
    series: [
      {
        panning: false,
        dragDrop: {
          draggableY: false,
          draggableX: false
        },
        name: "Browsers",
        colorByPoint: true,
        data: [],

        point:{
          events:{
            click: (event: any) => {
              this.logPointInfo(event)
            }
          }
        }

      }
    ],
    exporting: {
      buttons: {
        contextButton: {
          menuItems:  [
            'viewFullscreen',
            'printChart',
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
    },

    annotations: [{
      labels: [{
        point: 'max',
        text: 'Max'
      }],
      draggable: ""
    }]

  };


  public logPointInfo(event: any): void {
    console.log('name=' + event.point.name + '  x=' + event.point.x + '  y=' +
      event.point.y + '  percent=' + event.point.percentage);
  }

  // Chart 2 is a bar chart2
  private chartOptions2: any = {
    chart: {
      type: 'column'   // Uuse type:'bar' for horizontal chart.  Use type:'column' for vertical bar chart
    },
    credits: {
      enabled: false        // Hide the highcharts.com label
    },
    title: {
      text: 'Case Timeliness of Closes Cases (Days)'
    },
    xAxis: {
      categories: ['0-30', '31-60', '61-90', '91-120', '121-150', '151-180', '181-210', '211-240', '241-270', '271-300', '301+']
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of Cases'
      }
    },
    legend: {
      reversed: false
    },
    plotOptions: {
      series: {
        enableMouseTracking: true,
        stacking: 'normal'
      }
    },

    series: [],
    exporting: {
      buttons: {
        contextButton: {
          menuItems:  [
            'viewFullscreen',
            'printChart',
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

  private gaugeChartOptions: any = {
    chart: {
      type: 'solidgauge'
    },
    pane: {
      center: ['50%', '65%'],
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: '#EEE',
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc'
      }
    },

    credits: {
      enabled: false
    },

    exporting: {
      enabled: false
    },

    tooltip: {
      enabled: false
    },

    // the value axis
    yAxis: {
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      labels: {
        y: 16
      }
    },

    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true
        }
      }
    }
  };


}

