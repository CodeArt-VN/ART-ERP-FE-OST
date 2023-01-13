import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { OST_OfficeProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';

@Component({
    selector: 'app-office',
    templateUrl: 'office.page.html',
    styleUrls: ['office.page.scss']
})
export class OfficePage extends PageBase {
    constructor(
        public pageProvider: OST_OfficeProvider,
        public modalController: ModalController,
		public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
    ) {
        super();
    }

}
