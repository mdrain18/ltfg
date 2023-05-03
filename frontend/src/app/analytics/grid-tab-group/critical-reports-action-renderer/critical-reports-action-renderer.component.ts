import { Component} from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";
import {ICellRendererParams} from "ag-grid-community";

@Component({
  selector: 'app-critical-reports-action-renderer',
  templateUrl: './critical-reports-action-renderer.component.html',
  styleUrls: ['./critical-reports-action-renderer.component.css']
})
export class CriticalReportsActionRendererComponent implements ICellRendererAngularComp {

  private params: ICellRendererParams;

  constructor() { }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  public editClicked() {
    //@ts-ignore
    this.params.editButtonClicked(this.params);
  }


}
