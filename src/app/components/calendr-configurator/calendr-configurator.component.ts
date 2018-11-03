import * as FileSaver from 'file-saver';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Calrendr, Calendr, CalrendrConfiguration, SideMonthRenderer, PaperProvider } from 'src/app/classes/calendr';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-calendr-configurator',
  templateUrl: './calendr-configurator.component.html',
  styleUrls: ['./calendr-configurator.component.scss']
})
export class CalendrConfiguratorComponent implements OnInit {
  calrendr: Calrendr;
  calrendrConfig: CalrendrConfiguration;
  loadedFonts: string[] = [];

  pdfEndpoint = 'http://bruflodt.net/projects/calendr/calendr-pdf.php';
  pngData: any;

  @ViewChild('pdfForm') pdfForm: NgForm;

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.calrendrConfig = new CalrendrConfiguration(
      PaperProvider.legal,
      new SideMonthRenderer()
    );

    this.calrendrConfig.columns = 3;
    this.calrendrConfig.rows = 4;
    this.calrendrConfig.titleFont = 'Montserrat';
    this.calrendrConfig.titleFontWeight = '';
    this.calrendrConfig.monthRenderer.fontFamily = 'Raleway';
    this.calrendrConfig.monthRenderer.fontWeight = 'bold';
    this.calrendrConfig.monthRenderer.dateWeight = '';

    // https://github.com/typekit/webfontloader
    ((window as any).WebFont).load({
      google: {
        families: ['Montserrat', 'Raleway']
      },
      active: () => {
        console.log('active');
        this.calrendr =
            new Calrendr(
              new Calendr(),
              this.calrendrConfig,
              document.getElementById('calenvas') as HTMLCanvasElement);
      },
      loading: () => {
        console.log('loading');
      },
      inactive: () => {
        console.log('inactive');
      },
      fontloading: (familyName, fvd) => {

        console.log('font loading', familyName, fvd);
      },
      fontactive: (familyName, fvd) => {
        this.loadedFonts.push(familyName);
      },
      fontinactive: (familyName, fvd) => {
        console.log('font inactive', familyName, fvd);
      }
    });

  }

  updateTypes() {
    if (this.calrendrConfig) {
      if (typeof this.calrendrConfig.rows === 'string') {
        this.calrendrConfig.rows = parseInt(this.calrendrConfig.rows);
      }
      if (typeof this.calrendrConfig.columns === 'string') {
        this.calrendrConfig.columns = parseInt(this.calrendrConfig.columns);
      }
      if (typeof this.calrendrConfig.elementPadding === 'string') {
        this.calrendrConfig.elementPadding = parseInt(this.calrendrConfig.elementPadding);
      }
      if (typeof this.calrendrConfig.paperPadding === 'string') {
        this.calrendrConfig.paperPadding = parseInt(this.calrendrConfig.paperPadding);
      }
      if (typeof this.calrendrConfig.titleHeight === 'string') {
        this.calrendrConfig.titleHeight = parseInt(this.calrendrConfig.titleHeight);
      }
    }
  }

  updateConfig() {
    this.updateTypes();

    if (this.loadedFonts.indexOf(this.calrendrConfig.titleFont) === -1 ||
        this.loadedFonts.indexOf(this.calrendrConfig.monthRenderer.fontFamily) === -1
    ) {
      this.loadFont([this.calrendrConfig.titleFont, this.calrendrConfig.monthRenderer.fontFamily],
        () => {
          this.calrendr.updateConfiguration(this.calrendrConfig);
        });
    } else {
      this.calrendr.updateConfiguration(this.calrendrConfig);
    }

  }

  loadFont(fontFamilies, callback) {
    ((window as any).WebFont).load({
      google: {
        families: fontFamilies
      },
      active: () => {
        callback();
      },
      loading: () => {
        console.log('loading');
      },
      inactive: () => {
        console.log('inactive');
      },
      fontloading: (familyName, fvd) => {

        console.log('font loading', familyName, fvd);
      },
      fontactive: (familyName, fvd) => {
        this.loadedFonts.push(familyName);
      },
      fontinactive: (familyName, fvd) => {
        console.log('font inactive', familyName, fvd);
      }
    });
  }

  loadFontAndUpdate() {

  }
  generatePdf() {
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    this.httpClient.post(
      this.pdfEndpoint,
      {
        pngData: this.calrendr.pngData
      }, { headers: headers, responseType: 'blob' }
    ).subscribe((res: any) => {
      const blob = res;
      FileSaver.saveAs(blob, 'calendar.pdf');
    }, (error) => {
      console.log(error);
    });
  }
}
