import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {DashboardDataDTO} from "../models/dashboard-data-dto";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {DashboardGridRowDTO} from "../models/dashboard-grid-row-dto";
import {BarChartDTO} from "../models/bar-chart-dto";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private httpClient: HttpClient) { }


  public getAllChartData(): Observable<DashboardDataDTO> {
    // Construct the URL of the REST call
    const restUrl = environment.baseUrl + '/api/dashboard/chart/data';

    // Return an observable
    return this.httpClient.get <DashboardDataDTO>(restUrl);
  }


  public getGridData(): Observable<DashboardGridRowDTO[]> {
    let data: DashboardGridRowDTO[] = [
      {
        id: 1,
        clanName: 'Fake Game Clan #1',
        buildingLimit: 'OVER LIMIT',
        inventoryLimit: 'OVER LIMIT',
        violationDate: '11/24/2022',
        clanOwner: 'Fake Game Owner #1'
      },
      {
        id: 2,
        clanName: 'Fake Game Clan #2',
        buildingLimit: 'OVER LIMIT',
        inventoryLimit: 'OVER LIMIT',
        violationDate: '11/23/2022',
        clanOwner: 'Fake Game Owner #2'
      },
      {
        id: 3,
        clanName: 'Fake Game Clan #3',
        buildingLimit: 'OVER LIMIT',
        inventoryLimit: 'Under Limit',
        violationDate: '10/03/2022',
        clanOwner: 'Fake Game Owner #3'
      },
      {
        id: 4,
        clanName: 'Fake Game Clan #4',
        buildingLimit: 'Under Limit',
        inventoryLimit: 'OVER LIMIT',
        violationDate: '09/23/2022',
        clanOwner: 'Fake Game Owner #4'
      },
      {
        id: 5,
        clanName: 'Fake Game Clan #5',
        buildingLimit: 'OVER LIMIT',
        inventoryLimit: 'Under Limit',
        violationDate: '10/03/2022',
        clanOwner: 'Fake Game Owner #5'
      },

    ];

    return of(data);
  }


  public getBarChartData(): Observable<BarChartDTO> {
    let data: BarChartDTO = new BarChartDTO();

    data.chartData = [{
      name: 'Average Package Time in Each Work Role',  	// Named used for the "Back to <>" when drilled-in
      colorByPoint: true,
      data: [{
        name: 'GCA',
        y: 3
      }, {
        name: 'Contractor',
        y: 30
      }, {
        name: 'EM',
        y: 21,
        drilldown: 'emAnalysts'
      }, {
        name: 'EMTL',
        y: 5
      }, {
        name: 'FOCI Business Analyst',
        y: 15,
        drilldown: 'fociAnalysts'
      }, {
        name: 'FOCI Team Manager',
        y: 5,
      }, {
        name: 'RMO',
        y: 10,
      }, {
        name: 'Mitigation Strategy Officer / Approval Officer',
        y: 12,
      }, {
        name: 'Oversight RMO',
        y: 6,
      }]
    }];

    data.drillDownData = {
      series: [{
        id: 'emAnalysts',
        data: [
          {
            name: 'John Smith',
            y: 30
          },
          {
            name: 'Dave Lewis',
            y: 21
          },
          {
            name: 'Carl Johnson',
            y: 40
          },
          {
            name: 'Steve Young',
            y: 15
          }
        ]
      }, {
        id: 'fociAnalysts',
        data: [
          ['Nick Foles', 13],
          ['Blake Bortles', 15],
          ['Daniel Jones', 8]
        ]
      }]
    };

    return of(data);
  }  // end of getBarChartData()



  public getUsaMapData(): Observable<any> {
    let data =  [
      ['us-ma', 0],
      ['us-wa', 1],
      ['us-ca', 2],
      ['us-or', 3],
      ['us-wi', 4],
      ['us-me', 5],
      ['us-mi', 6],
      ['us-nv', 7],
      ['us-nm', 8],
      ['us-co', 9],
      ['us-wy', 10],
      ['us-ks', 11],
      ['us-ne', 12],
      ['us-ok', 13],
      ['us-mo', 14],
      ['us-il', 15],
      ['us-in', 16],
      ['us-vt', 17],
      ['us-ar', 18],
      ['us-tx', 19],
      ['us-ri', 20],
      ['us-al', 21],
      ['us-ms', 22],
      ['us-nc', 23],
      ['us-va', 24],
      ['us-ia', 25],
      ['us-md', 26],
      ['us-de', 27],
      ['us-pa', 28],
      ['us-nj', 29],
      ['us-ny', 30],
      ['us-id', 31],
      ['us-sd', 32],
      ['us-ct', 33],
      ['us-nh', 34],
      ['us-ky', 35],
      ['us-oh', 36],
      ['us-tn', 37],
      ['us-wv', 38],
      ['us-dc', 39],
      ['us-la', 40],
      ['us-fl', 41],
      ['us-ga', 42],
      ['us-sc', 43],
      ['us-mn', 44],
      ['us-mt', 45],
      ['us-nd', 46],
      ['us-az', 47],
      ['us-ut', 48],
      ['us-hi', 49],   // Hawaii
      ['us-ak', 50],   // Alaska
      ['gu-3605', 51],
      ['mp-ti', 52],
      ['mp-sa', 53],
      ['mp-ro', 54],
      ['as-6515', 55],
      ['as-6514', 56],
      ['pr-3614', 57],
      ['vi-3617', 58],
      ['vi-6398', 59],
      ['vi-6399', 60]
    ];

    return of(data);
  }  // end of getUsaMapData()

}
