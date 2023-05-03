import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'timeline-item',
  templateUrl: './timeline-item.component.html',
  styleUrls: ['./timeline-item.component.css']
})
export class TimelineItemComponent implements OnInit {

  @Input() color: string;
  public dot: { [klass: string]: any; };
  public dotA: { [klass: string]: any; };

  constructor() {
  }

  ngOnInit(): void {
    if (this.color) {
      this.dot = {
        'background-color': this.color,
        'box-shadow': `0 0 2px 5px #fff,0 0 0 7px #808080,0 0 0 12px #fff,0 0 0 13px ${this.color}`
      };
      this.dotA = {
        'background-color': this.color
      };
    }
  }

}

