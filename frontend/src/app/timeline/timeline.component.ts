import {Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css',
  ],
  encapsulation: ViewEncapsulation.None   /* This is needed so that styles applied to the timeline parent are applied to the timeline-item children */
})
export class TimelineComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
